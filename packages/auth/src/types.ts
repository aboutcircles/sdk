/** Response from auth-service POST /exchange */
export interface ExchangeResponse {
  token: string;
  address: string;
  chainId: number;
  expiresIn: number;
  exchangedFrom: string;
}

/** Claims extracted from an exchanged token */
export interface ExchangedClaims {
  addr: string;
  chainId: number;
  iat: number;
  exp: number;
  accountType?: string;
}

/** Logger interface — pluggable, not pino-coupled */
export interface CacheLogger {
  debug: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
}

/** Event types emitted by the cache */
export type CacheEventType =
  | "cache_hit"
  | "cache_miss"
  | "negative_cache_hit"
  | "exchange_success"
  | "exchange_failed"
  | "exchange_timeout"
  | "eviction";

/** Event payload for onEvent callback */
export interface CacheEvent {
  type: CacheEventType;
  durationMs?: number;
  status?: number;
}

/** Options for TokenExchangeCache */
export interface TokenExchangeCacheOptions {
  authServiceUrl: string;
  audience: string | string[];
  maxSize?: number;
  timeoutMs?: number;
  ttlSafetyMarginSeconds?: number;
  negativeCacheTtlMs?: number;
  logger?: CacheLogger;
  onEvent?: (event: CacheEvent) => void;
}
