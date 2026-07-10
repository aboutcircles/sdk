# Test Environment Examples

Recipes against the hosted test-env at `http://localhost:5200`.
Set `TEST_ENV_URL` to point elsewhere.

| File                         | Demonstrates                                              |
| ---------------------------- | --------------------------------------------------------- |
| `01-session-basics.ts`       | Create a session with all four features, exercise each.   |
| `02-pathfinder-at-block.ts`  | Find a transfer path at a historical block.               |
| `03-execute-on-anvil.ts`     | Pathfind, then verify on-chain balance on the Anvil fork. |
| `04-snapshot-revert.ts`      | Snapshot before destructive op, revert after.             |

Run with:

```bash
bun run examples/test-env/01-session-basics.ts
```

Per-example env overrides (e.g. for `02`):

```bash
SOURCE=0x... SINK=0x... AMOUNT_WEI=5000000000000000000 BLOCK=46420000 \
bun run examples/test-env/02-pathfinder-at-block.ts
```

Full guide: [`docs/test-env-guide.md`](../../docs/test-env-guide.md).
