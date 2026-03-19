# @aboutcircles/sdk-auth

Authentication utilities for Circles backends. Provides an in-memory caching client for the auth-service token exchange endpoint.

## Installation

```bash
npm install @aboutcircles/sdk-auth
```

## Usage

```typescript
import { TokenExchangeCache } from '@aboutcircles/sdk-auth';

const cache = new TokenExchangeCache({
  authServiceUrl: 'https://auth.circles.garden',
  audience: 'referrals-api',
});

// Exchange an external JWT for Circles claims
const claims = await cache.exchange(externalJwt);
if (claims) {
  console.log(claims.addr);     // "0x1234..."
  console.log(claims.chainId);  // 100
  console.log(claims.exp);      // Unix timestamp
}

// Clean up on shutdown
cache.destroy();
```

### Multi-audience

Request a token accepted by multiple backends:

```typescript
const cache = new TokenExchangeCache({
  authServiceUrl: 'https://auth.circles.garden',
  audience: ['referrals-api', 'market-api'],
});
```

### Event hooks (metrics integration)

```typescript
import { Histogram } from 'prom-client';

const exchangeDuration = new Histogram({ name: 'exchange_duration_ms', help: '...' });

const cache = new TokenExchangeCache({
  authServiceUrl: 'https://auth.circles.garden',
  audience: 'referrals-api',
  onEvent: (event) => {
    if (event.durationMs !== undefined) {
      exchangeDuration.observe(event.durationMs);
    }
    // event.type: cache_hit | cache_miss | negative_cache_hit |
    //             exchange_success | exchange_failed | exchange_timeout | eviction
  },
});
```

### Custom logger

```typescript
import pino from 'pino';

const logger = pino();

const cache = new TokenExchangeCache({
  authServiceUrl: 'https://auth.circles.garden',
  audience: 'referrals-api',
  logger: {
    debug: (msg, data) => logger.debug(data, msg),
    warn: (msg, data) => logger.warn(data, msg),
  },
});
```

---

## API Reference

### `TokenExchangeCache`

#### `constructor(options: TokenExchangeCacheOptions)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `authServiceUrl` | `string` | required | Auth-service base URL |
| `audience` | `string \| string[]` | required | Target audience(s) for the Circles JWT |
| `maxSize` | `number` | `1000` | Max cache entries before LRU eviction |
| `timeoutMs` | `number` | `5000` | Fetch timeout in milliseconds |
| `ttlSafetyMarginSeconds` | `number` | `60` | Expire cache entries this many seconds before JWT actually expires |
| `negativeCacheTtlMs` | `number` | `30000` | How long to cache 4xx responses (avoids retrying known-bad tokens) |
| `logger` | `CacheLogger` | no-op | Pluggable logger with `debug` and `warn` methods |
| `onEvent` | `(event: CacheEvent) => void` | - | Callback for cache/exchange events |

---

#### `exchange(rawToken: string): Promise<ExchangedClaims | null>`

Exchange an external JWT for Circles claims. Returns cached result on hit, calls auth-service `/exchange` on miss. Returns `null` on failure.

**Caching behavior:**
- Successful responses cached with TTL = `expiresIn - ttlSafetyMarginSeconds`
- 4xx responses cached as negative for `negativeCacheTtlMs` (avoids retrying invalid tokens)
- 5xx responses NOT cached (transient errors, retry immediately)
- LRU eviction when cache exceeds `maxSize`

---

#### `size: number` (getter)

Current number of entries in the positive cache. Useful for gauge metrics.

---

#### `destroy(): void`

Stop background cleanup timer and clear all cached entries. Call on process shutdown.

---

### Types

```typescript
interface ExchangedClaims {
  addr: string;        // Ethereum address (lowercase)
  chainId: number;     // Chain ID
  iat: number;         // Issued at (Unix seconds)
  exp: number;         // Expires at (Unix seconds)
  accountType?: string; // Always "wallet" for exchange tokens
}

interface CacheEvent {
  type: CacheEventType;
  durationMs?: number;  // Present for exchange_success/failed/timeout
  status?: number;      // HTTP status for exchange_failed
}

type CacheEventType =
  | "cache_hit"
  | "cache_miss"
  | "negative_cache_hit"
  | "exchange_success"
  | "exchange_failed"
  | "exchange_timeout"
  | "eviction";
```

---

## License

MIT
