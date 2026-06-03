import { TestEnvClient } from '@aboutcircles/sdk-test-env-client';

/**
 * Find a transfer path against historical state.
 *
 * The session pins the pathfinder to the requested block via X-Max-Block-Number,
 * so the result reflects trust + balances as they existed at that moment.
 *
 * Override SOURCE / SINK / AMOUNT_WEI via env to test other pairs.
 */

const baseUrl =
  process.env.TEST_ENV_URL ?? 'http://localhost:5200';

// Defaults are a known-liquid pair on Gnosis: source has CRC, sink directly
// trusts source's token. Override via env to test your own scenario.
const SOURCE = process.env.SOURCE ?? '0x549fb6186affc15b370e230ce51fc3414bf7ba2d';
const SINK = process.env.SINK ?? '0x000e23fb756aeac403494c22ce4fce8bb96b077d';
const AMOUNT_WEI = BigInt(process.env.AMOUNT_WEI ?? '1000000000000000000');

async function main() {
  const client = new TestEnvClient({ baseUrl, timeoutMs: 60_000 });

  const currentBlock = await client.currentBlock();
  const targetBlock = Number(process.env.BLOCK ?? currentBlock - 5_000);

  const session = await client.createSession({
    blockNumber: targetBlock,
    features: ['pathfinder'],
    ttlMinutes: 5,
  });

  console.log(`Session ${session.id} pinned to block ${session.blockNumber}`);
  console.log(`Source: ${SOURCE}`);
  console.log(`Sink:   ${SINK}`);
  console.log(`Amount: ${AMOUNT_WEI} wei (~${Number(AMOUNT_WEI) / 1e18} CRC)\n`);

  const path = await session.pathfinder!.findPath({
    source: SOURCE,
    sink: SINK,
    targetFlow: AMOUNT_WEI,
  });

  console.log(`Pathfinder graphBlock: ${path.graphBlock}`);
  console.log(`MaxFlow: ${path.maxFlow} wei`);
  console.log(`Transfers: ${path.transfers.length}`);

  if (path.transfers.length === 0) {
    console.log(
      `\n[no path] No liquidity between ${SOURCE} → ${SINK} at block ${targetBlock}.`,
    );
    console.log(
      `Try a smaller AMOUNT_WEI, a more recent BLOCK, or pick addresses with known trust.`,
    );
  } else {
    console.log('\nFirst 5 hops:');
    for (const t of path.transfers.slice(0, 5)) {
      console.log(`  ${t.from.slice(0, 10)}… → ${t.to.slice(0, 10)}… (token ${t.tokenOwner.slice(0, 10)}…) value=${t.value}`);
    }
  }

  await session.release();
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
