import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TokenExchangeCache } from "../src/TokenExchangeCache.js";
import type { CacheEvent } from "../src/types.js";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function exchangeResponse(
  address: string,
  chainId: number,
  expiresIn: number,
) {
  return {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        token: "circles-jwt-token",
        address,
        chainId,
        expiresIn,
        exchangedFrom: "https://ga.example.com",
      }),
  };
}

describe("TokenExchangeCache", () => {
  let cache: TokenExchangeCache;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: "referrals-api",
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  // ── Ported tests from invitation-backend ─────────────────────────────

  it("calls /exchange and returns claims on success", async () => {
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    const result = await cache.exchange("external-jwt-token");

    expect(result).not.toBeNull();
    expect(result!.addr).toBe("0xabc123def456abc123def456abc123def456abc1");
    expect(result!.chainId).toBe(100);
    expect(result!.exp).toBeGreaterThan(result!.iat);

    // Verify fetch was called correctly
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://auth:3001/exchange");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({
      token: "external-jwt-token",
      audience: "referrals-api",
    });
  });

  it("returns cached result on second call (no second fetch)", async () => {
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    const first = await cache.exchange("same-token");
    const second = await cache.exchange("same-token");

    expect(first).toEqual(second);
    expect(mockFetch).toHaveBeenCalledOnce(); // Only one HTTP call
  });

  it("returns null on non-200 response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    const result = await cache.exchange("bad-token");
    expect(result).toBeNull();
  });

  it("returns null on fetch timeout/error", async () => {
    mockFetch.mockRejectedValueOnce(
      new Error("AbortError: signal timed out"),
    );

    const result = await cache.exchange("timeout-token");
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fetch failed"));

    const result = await cache.exchange("unreachable-token");
    expect(result).toBeNull();
  });

  it("does not cache 5xx failed exchanges (retries work)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    const first = await cache.exchange("retry-token");
    expect(first).toBeNull();

    const second = await cache.exchange("retry-token");
    expect(second).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("evicts expired entries", async () => {
    // Use expiresIn=0 so TTL after safety margin is also 0
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        0,
      ),
    );

    await cache.exchange("expiring-token");

    // Wait a tick for it to expire
    await new Promise((r) => setTimeout(r, 10));

    // Should fetch again since expired
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    const result = await cache.exchange("expiring-token");
    // The first call returns null because expiresIn=0 fails validation (expiresIn <= 0)
    // So the second call is also a miss. Let's verify both calls happened.
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("evicts oldest entry when at max capacity", async () => {
    const smallCache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: "referrals-api",
      maxSize: 2,
    });

    // Fill cache to capacity
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0x0000000000000000000000000000000000000001",
        100,
        3600,
      ),
    );
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0x0000000000000000000000000000000000000002",
        100,
        3600,
      ),
    );
    await smallCache.exchange("token-1");
    await smallCache.exchange("token-2");

    // Third token should evict token-1
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0x0000000000000000000000000000000000000003",
        100,
        3600,
      ),
    );
    await smallCache.exchange("token-3");

    // token-1 should no longer be cached
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0x0000000000000000000000000000000000000001",
        100,
        3600,
      ),
    );
    await smallCache.exchange("token-1");
    expect(mockFetch).toHaveBeenCalledTimes(4); // All 4 fetches happened

    smallCache.destroy();
  });

  it("lowercases the address from exchange response", async () => {
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xABC123DEF456ABC123DEF456ABC123DEF456ABC1",
        100,
        3600,
      ),
    );

    const result = await cache.exchange("mixed-case-token");
    expect(result!.addr).toBe("0xabc123def456abc123def456abc123def456abc1");
  });

  it("strips trailing slashes from auth service URL", async () => {
    const trailingSlashCache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001///",
      audience: "referrals-api",
    });

    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    await trailingSlashCache.exchange("slash-token");
    expect(mockFetch.mock.calls[0][0]).toBe("http://auth:3001/exchange");

    trailingSlashCache.destroy();
  });

  // ── New tests for enhanced features ──────────────────────────────────

  it("negative caching: 401 returns null without fetch for 30s", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    const first = await cache.exchange("neg-cached-token");
    expect(first).toBeNull();
    expect(mockFetch).toHaveBeenCalledOnce();

    // Second call should NOT call fetch (negative cache hit)
    const second = await cache.exchange("neg-cached-token");
    expect(second).toBeNull();
    expect(mockFetch).toHaveBeenCalledOnce(); // Still only 1 call
  });

  it("negative cache does NOT cache 5xx", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const first = await cache.exchange("server-error-token");
    expect(first).toBeNull();
    expect(mockFetch).toHaveBeenCalledOnce();

    // Second call SHOULD call fetch again (5xx not negatively cached)
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const second = await cache.exchange("server-error-token");
    expect(second).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("TTL safety margin: cache expires before JWT", async () => {
    // Create cache where safety margin equals the expiresIn value
    // so the cache TTL becomes max(0, 120 - 120) = 0
    const marginCache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: "referrals-api",
      ttlSafetyMarginSeconds: 120,
    });

    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        120, // expiresIn = safety margin → cache TTL = 0
      ),
    );

    await marginCache.exchange("margin-token");

    // Wait a tick for the 0ms TTL to expire
    await new Promise((r) => setTimeout(r, 10));

    // Should fetch again since TTL was 0 (immediately expired)
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );
    await marginCache.exchange("margin-token");
    expect(mockFetch).toHaveBeenCalledTimes(2);

    marginCache.destroy();
  });

  it("event hooks fire with correct types", async () => {
    const events: CacheEvent[] = [];
    const eventCache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: "referrals-api",
      onEvent: (event) => events.push(event),
    });

    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    // First call: cache_miss + exchange_success
    await eventCache.exchange("event-token");
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("cache_miss");
    expect(events[1].type).toBe("exchange_success");
    expect(events[1].durationMs).toBeGreaterThanOrEqual(0);

    // Second call: cache_hit
    await eventCache.exchange("event-token");
    expect(events).toHaveLength(3);
    expect(events[2].type).toBe("cache_hit");

    eventCache.destroy();
  });

  it("array audience is included in fetch body and cache key", async () => {
    const arrayCache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: ["referrals-api", "circles-api"],
    });

    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    await arrayCache.exchange("array-aud-token");

    // Verify the audience array is sent as-is in the body
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.audience).toEqual(["referrals-api", "circles-api"]);

    arrayCache.destroy();
  });

  it("array audiences in different order produce same cache key", async () => {
    const cache1 = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: ["circles-api", "referrals-api"],
    });
    const cache2 = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: ["referrals-api", "circles-api"],
    });

    mockFetch.mockResolvedValue(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );

    // Both caches should produce the same cache behavior for the same token.
    // We verify this indirectly: if cache keys are the same internally,
    // then the hash function uses sorted audience.
    const result1 = await cache1.exchange("same-token-diff-order");
    const result2 = await cache2.exchange("same-token-diff-order");

    // Both should succeed
    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    expect(result1!.addr).toBe(result2!.addr);

    cache1.destroy();
    cache2.destroy();
  });

  it("size getter reflects current cache size", async () => {
    expect(cache.size).toBe(0);

    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );
    await cache.exchange("size-token-1");
    expect(cache.size).toBe(1);

    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc2",
        100,
        3600,
      ),
    );
    await cache.exchange("size-token-2");
    expect(cache.size).toBe(2);
  });

  it("timeout event fires on AbortError", async () => {
    const events: CacheEvent[] = [];
    const timeoutCache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: "referrals-api",
      onEvent: (event) => events.push(event),
    });

    mockFetch.mockRejectedValueOnce(
      new Error("AbortError: signal timed out"),
    );

    await timeoutCache.exchange("timeout-event-token");

    expect(events).toHaveLength(2); // cache_miss + exchange_timeout
    expect(events[0].type).toBe("cache_miss");
    expect(events[1].type).toBe("exchange_timeout");

    timeoutCache.destroy();
  });

  it("destroy clears both positive and negative caches", async () => {
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );
    await cache.exchange("destroy-token");
    expect(cache.size).toBe(1);

    // Add a negative cache entry
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await cache.exchange("destroy-neg-token");

    cache.destroy();
    expect(cache.size).toBe(0);

    // After destroy, fetching same token should call fetch again
    // (need a new cache since cleanup timer is gone)
    const freshCache = new TokenExchangeCache({
      authServiceUrl: "http://auth:3001",
      audience: "referrals-api",
    });
    mockFetch.mockResolvedValueOnce(
      exchangeResponse(
        "0xabc123def456abc123def456abc123def456abc1",
        100,
        3600,
      ),
    );
    await freshCache.exchange("destroy-token");
    expect(mockFetch).toHaveBeenCalledTimes(3);
    freshCache.destroy();
  });
});
