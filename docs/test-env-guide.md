# Test Environment Guide

Hosted, block-pinned test sessions for SDK development. Each session gives you
a coherent snapshot of Circles state — Postgres, RPC, pathfinder, and a private
Anvil fork — all anchored to the same historical block.

## When to use it

- Reproduce a production pathfinder result, then execute the path on Anvil to
  prove SDK transaction-building works against the real contracts.
- Diagnose bugs that depend on specific historical state (avatar registered,
  trust relation present, balance equals X wei).
- Run integration tests without spinning up Postgres / Nethermind / pathfinder
  locally.

If you just need static contract reads against the current chain, use
`@aboutcircles/sdk-rpc` directly against `https://rpc.aboutcircles.com` — no
session needed.

## Mental model

A session pins four data planes to the same block:

| Plane          | Pinning mechanism                                    | What you get                                                |
| -------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| **Postgres**   | `SET circles.max_block_number` per connection         | All views filter to rows ≤ session block                    |
| **Anvil**      | `anvil --fork-url … --fork-block-number N`           | Full EVM state at block N; per-session subprocess           |
| **RPC**        | `X-Max-Block-Number` header forwarded to circles-rpc | RPC results filter via the same DB session var              |
| **Pathfinder** | `X-Max-Block-Number` header forwarded to pathfinder  | `findPath` / `snapshot` use the historical graph cache      |

The pathfinder's historical graph cache pre-loads avatars, trusts, balances,
groups, and ScoreGroup metadata for the block. Subsequent requests at the same
block reuse the cache, so latency drops to near-live.

**Limitation: Anvil overlay state is invisible to Postgres/RPC/pathfinder.**
If you `anvil_setBalance` or send a tx on the Anvil fork, it does NOT propagate
to the indexed Postgres state — pathfinder will not see avatars/trusts created
that way. The supported flow is the reverse: find a path against indexed state,
then execute that path on Anvil to verify the SDK builds the calldata correctly.

## Hosted URL

```
http://localhost:5200
```

Override via the `TEST_ENV_URL` env var.

## Session limits

- TTL: default 10 min, max 30 min (extended automatically on activity).
- Concurrent sessions per node: 10.
- Query row cap: 10,000.

## Install

```bash
bun add @aboutcircles/sdk-test-env-client
# or
npm install @aboutcircles/sdk-test-env-client
```

## Recipe: create → use → release

```ts
import { TestEnvClient } from '@aboutcircles/sdk-test-env-client';

const client = new TestEnvClient({
  baseUrl: 'http://localhost:5200',
});

const currentBlock = await client.currentBlock();
const session = await client.createSession({
  blockNumber: currentBlock - 100,
  features: ['db', 'anvil', 'rpc', 'pathfinder'],
  ttlMinutes: 10,
});

// All four feature proxies are typed and bound to the session:
const avatars = await session.postgres!.scalar<number>(
  'SELECT COUNT(*) FROM "V_CrcV2_Avatars"',
);

const path = await session.pathfinder!.findPath({
  source: '0x549fb6186affc15b370e230ce51fc3414bf7ba2d',
  sink: '0x000e23fb756aeac403494c22ce4fce8bb96b077d',
  targetFlow: 1_000_000_000_000_000_000n,
});

const blockNumber = await session.anvil!.getBlockNumber();

await session.release();
```

## Recipe: snapshot + revert on Anvil

```ts
const snap = await session.anvil!.snapshot();
try {
  await session.anvil!.setBalance(eoa, 0n);
  // … exercise the SDK under test …
} finally {
  await session.anvil!.revert(snap);
}
```

## Recipe: find-path-at-block → execute-on-anvil (supported flow)

```ts
const session = await client.createSession({
  blockNumber: targetBlock,
  features: ['pathfinder', 'anvil'],
});

// 1. Pathfind against historical state
const path = await session.pathfinder!.findPath({ source, sink, targetFlow });

// 2. Build the operateFlowMatrix calldata via @aboutcircles/sdk-pathfinder
//    + @aboutcircles/sdk-transfers (existing packages, not shown).

// 3. Execute on session.anvil — same Hub.sol, same state, isolated from
//    other sessions and from production.
await session.anvil!.impersonate(source);
await session.anvil!.call('eth_sendTransaction', [{ from: source, to: HUB, data }]);
```

## Known divergence: ScoreGroup historical paths

When the pathfinder serves a request at a historical block, its
`HistoricalGraphCache` currently loads avatars, trusts, balances, groups, and
ScoreGroup score data — but a small set of ScoreGroup-specific loader methods
(MintLimits, GroupRouters, ScoreRouters, OperatorApprovals) is still being
plumbed in. Paths that route through ScoreGroup minting at historical blocks
may therefore differ structurally from the same query against live state.

If your test pair routes through a ScoreGroup, prefer recent blocks (within the
last 100 or so) where the divergence is smaller, or call the pathfinder against
the live RPC (`https://rpc.aboutcircles.com`) without a block pin.

## Errors

The client throws two error types:

- `TestEnvError` — HTTP-level errors (4xx/5xx, network); fields: `status`, `body`.
- `JsonRpcError` — upstream JSON-RPC errors (Anvil, RPC); fields: `code`, `data`.

```ts
import { TestEnvError, JsonRpcError } from '@aboutcircles/sdk-test-env-client';

try {
  await session.rpc!.call('eth_getBalance', [address, 'latest']);
} catch (err) {
  if (err instanceof JsonRpcError) console.error('RPC code', err.code);
  if (err instanceof TestEnvError) console.error('HTTP', err.status, err.body);
}
```

## Examples

See `examples/test-env/` in this repo:

- `01-session-basics.ts` — create session with all four features, exercise each.
- `02-pathfinder-at-block.ts` — find a transfer path at a historical block.
- `03-execute-on-anvil.ts` — pathfind, then verify on-chain balance on Anvil.
- `04-snapshot-revert.ts` — snapshot before destructive op, revert after.

Run them with:

```bash
bun run examples/test-env/01-session-basics.ts
```

Or override the target with env vars:

```bash
TEST_ENV_URL=http://localhost:8080 \
SOURCE=0x... SINK=0x... AMOUNT_WEI=5000000000000000000 \
bun run examples/test-env/02-pathfinder-at-block.ts
```

## Further reading

- [Pathfinder block-pinning details](https://github.com/aboutcircles/circles-nethermind-plugin/blob/staging/src/Pathfinder/Circles.Pathfinder.Host/README.md) —
  the underlying `X-Max-Block-Number` mechanism.
