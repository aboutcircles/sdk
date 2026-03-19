import { createHash } from "node:crypto";
import type {
  ExchangedClaims,
  TokenExchangeCacheOptions,
  CacheLogger,
  CacheEvent,
} from "./types.js";

interface CacheEntry {
  claims: ExchangedClaims;
  expiresAt: number;
}

interface NegativeCacheEntry {
  expiresAt: number;
}

const noopLogger: CacheLogger = {
  debug: () => {},
  warn: () => {},
};

/**
 * Calls auth-service /exchange to convert an external JWT into Circles claims,
 * with in-memory caching keyed by SHA-256(rawToken + audience).
 *
 * Features:
 * - LRU eviction (oldest entry when at capacity)
 * - Negative caching for 4xx responses
 * - TTL safety margin (expires cache entries before JWT actually expires)
 * - Pluggable logger and event hooks for metrics
 */
export class TokenExchangeCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly negativeCache = new Map<string, NegativeCacheEntry>();
  private readonly maxSize: number;
  private readonly authServiceUrl: string;
  private readonly audience: string | string[];
  private readonly audienceBody: string | string[];
  private readonly audienceCacheKey: string;
  private readonly timeoutMs: number;
  private readonly ttlSafetyMarginSeconds: number;
  private readonly negativeCacheTtlMs: number;
  private readonly logger: CacheLogger;
  private readonly onEvent?: (event: CacheEvent) => void;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: TokenExchangeCacheOptions) {
    this.authServiceUrl = options.authServiceUrl.replace(/\/+$/, "");
    this.audience = options.audience;
    this.audienceBody = options.audience;
    this.audienceCacheKey = Array.isArray(options.audience)
      ? [...options.audience].sort().join(",")
      : options.audience;
    this.maxSize = options.maxSize ?? 1000;
    this.timeoutMs = options.timeoutMs ?? 5_000;
    this.ttlSafetyMarginSeconds = options.ttlSafetyMarginSeconds ?? 60;
    this.negativeCacheTtlMs = options.negativeCacheTtlMs ?? 30_000;
    this.logger = options.logger ?? noopLogger;
    this.onEvent = options.onEvent;

    this.cleanupTimer = setInterval(() => this.evictExpired(), 60_000);
    this.cleanupTimer.unref();
  }

  /** Current number of entries in the positive cache */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Exchange an external JWT for Circles claims.
   * Returns cached claims on hit, fetches from auth-service on miss.
   * Returns null on failure (4xx cached as negative, 5xx not cached).
   */
  async exchange(rawToken: string): Promise<ExchangedClaims | null> {
    const key = this.hashToken(rawToken);

    // Check negative cache first
    const negative = this.negativeCache.get(key);
    if (negative) {
      if (negative.expiresAt > Date.now()) {
        this.logger.debug("Token exchange negative cache hit");
        this.onEvent?.({ type: "negative_cache_hit" });
        return null;
      }
      this.negativeCache.delete(key);
    }

    // Positive cache hit?
    const cached = this.cache.get(key);
    if (cached) {
      if (cached.expiresAt > Date.now()) {
        this.logger.debug("Token exchange cache hit");
        this.onEvent?.({ type: "cache_hit" });
        return cached.claims;
      }
      this.cache.delete(key); // evict stale entry immediately
    }

    // Cache miss — call auth-service /exchange
    this.onEvent?.({ type: "cache_miss" });
    const start = performance.now();

    try {
      const res = await fetch(`${this.authServiceUrl}/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: rawToken,
          audience: this.audienceBody,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const durationMs = performance.now() - start;

      if (!res.ok) {
        this.logger.warn("Token exchange returned non-200", {
          status: res.status,
        });

        // Cache 4xx as negative (client error, won't change on retry)
        // Don't cache 5xx (transient server errors)
        if (res.status >= 400 && res.status < 500) {
          this.negativeCache.set(key, {
            expiresAt: Date.now() + this.negativeCacheTtlMs,
          });
        }

        this.onEvent?.({
          type: "exchange_failed",
          durationMs,
          status: res.status,
        });
        return null;
      }

      const body = (await res.json()) as Record<string, unknown>;

      // Validate response shape before trusting it
      if (
        !body.address ||
        typeof body.address !== "string" ||
        typeof body.chainId !== "number" ||
        body.chainId <= 0 ||
        typeof body.expiresIn !== "number" ||
        body.expiresIn <= 0
      ) {
        this.logger.warn(
          "Token exchange returned unexpected response shape",
          { body },
        );
        this.onEvent?.({ type: "exchange_failed", durationMs });
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const claims: ExchangedClaims = {
        addr: (body.address as string).toLowerCase(),
        chainId: body.chainId as number,
        iat: now,
        exp: now + (body.expiresIn as number),
        accountType: "wallet",
      };

      // Evict oldest if at capacity
      if (this.cache.size >= this.maxSize) {
        const oldest = this.cache.keys().next().value;
        if (oldest !== undefined) {
          this.cache.delete(oldest);
          this.onEvent?.({ type: "eviction" });
        }
      }

      // TTL with safety margin — expire cache entry before JWT actually expires
      const ttlSeconds = Math.max(
        0,
        (body.expiresIn as number) - this.ttlSafetyMarginSeconds,
      );
      this.cache.set(key, {
        claims,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });

      this.logger.debug("Token exchange succeeded, cached", {
        addr: claims.addr,
      });
      this.onEvent?.({ type: "exchange_success", durationMs });
      return claims;
    } catch (err) {
      const durationMs = performance.now() - start;
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout =
        msg.includes("timed out") || msg.includes("AbortError");
      this.logger.warn("Token exchange failed", { error: msg });
      this.onEvent?.({
        type: isTimeout ? "exchange_timeout" : "exchange_failed",
        durationMs,
      });
      return null;
    }
  }

  /** Remove all expired entries from both positive and negative caches */
  private evictExpired(): void {
    const now = Date.now();
    let evicted = 0;
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        evicted++;
      }
    }
    for (const [key, entry] of this.negativeCache) {
      if (entry.expiresAt <= now) {
        this.negativeCache.delete(key);
      }
    }
    if (evicted > 0) {
      this.logger.debug("Token exchange cache cleanup", {
        evicted: evicted.toString(),
        remaining: this.cache.size.toString(),
      });
    }
  }

  /** Hash token + audience into a cache key */
  private hashToken(token: string): string {
    return createHash("sha256")
      .update(token + "|" + this.audienceCacheKey)
      .digest("hex");
  }

  /** Stop background cleanup and clear all cached entries */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
    this.negativeCache.clear();
  }
}
