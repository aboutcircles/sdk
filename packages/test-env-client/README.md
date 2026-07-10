# @aboutcircles/sdk-test-env-client

TypeScript client for the Circles Test Environment — block-pinned sessions with Postgres, RPC, pathfinder, and a per-session Anvil fork.

## Install

```bash
bun add @aboutcircles/sdk-test-env-client
# or
npm install @aboutcircles/sdk-test-env-client
```

## Quickstart

```ts
import { TestEnvClient } from '@aboutcircles/sdk-test-env-client';

const client = new TestEnvClient({
  baseUrl: 'http://localhost:5200',
});

const session = await client.createSession({
  blockNumber: 46_420_000,
  features: ['db', 'anvil', 'rpc', 'pathfinder'],
  ttlMinutes: 10,
});

const path = await session.pathfinder!.findPath({
  source: '0x549fb6186affc15b370e230ce51fc3414bf7ba2d',
  sink: '0x000e23fb756aeac403494c22ce4fce8bb96b077d',
  targetFlow: 1_000_000_000_000_000_000n,
});

await session.release();
```

## Full guide

See [`docs/test-env-guide.md`](../../docs/test-env-guide.md) in the monorepo root for mental model, supported workflow recipes, and limitations.

## License

MIT
