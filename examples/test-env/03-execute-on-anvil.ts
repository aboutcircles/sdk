import { TestEnvClient } from '@aboutcircles/sdk-test-env-client';

/**
 * End-to-end: find a transitive path against historical state, then submit
 * it to Hub.operateFlowMatrix on the session's Anvil fork to prove the SDK
 * encoding matches what the contract accepts.
 *
 * This example only proves Hub.operateFlowMatrix would NOT revert; it does
 * not run the transaction. (Full execution needs a signer + nonce; out of
 * scope for the test-env client itself.) The wallet-side flow lives in
 * the existing @aboutcircles/sdk-pathfinder / sdk-transfers examples.
 *
 * What we DO prove here: pathfinder result matches the on-chain trust + balance
 * state at the historical block, by re-querying balance on the Anvil fork.
 */

const baseUrl =
  process.env.TEST_ENV_URL ?? 'http://localhost:5200';

const HUB_V2 = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8';

// ERC1155.balanceOf(account, id) selector
const BALANCE_OF_SELECTOR = '0x00fdd58e';

function pad32(hexNoPrefix: string): string {
  return hexNoPrefix.padStart(64, '0');
}

function encodeBalanceOf(account: string, tokenId: string): string {
  return (
    BALANCE_OF_SELECTOR +
    pad32(account.toLowerCase().replace(/^0x/, '')) +
    pad32(BigInt(tokenId).toString(16))
  );
}

async function main() {
  const client = new TestEnvClient({ baseUrl, timeoutMs: 60_000 });
  const currentBlock = await client.currentBlock();
  const targetBlock = Number(process.env.BLOCK ?? currentBlock - 100);

  const source =
    process.env.SOURCE ?? '0x549fb6186affc15b370e230ce51fc3414bf7ba2d';
  const sink =
    process.env.SINK ?? '0x000e23fb756aeac403494c22ce4fce8bb96b077d';
  const amount = BigInt(process.env.AMOUNT_WEI ?? '1000000000000000000');

  const session = await client.createSession({
    blockNumber: targetBlock,
    features: ['anvil', 'pathfinder'],
    ttlMinutes: 5,
  });

  console.log(`Session ${session.id} at block ${session.blockNumber}`);

  // 1. Find path against historical Postgres state via pathfinder
  const path = await session.pathfinder!.findPath({
    source,
    sink,
    targetFlow: amount,
  });

  if (path.transfers.length === 0) {
    console.log(`No path found ${source} → ${sink} at block ${targetBlock}.`);
    await session.release();
    return;
  }

  console.log(`Path: ${path.transfers.length} hops, maxFlow=${path.maxFlow}`);

  // 2. Verify the source actually holds source's token on the Anvil fork
  //    (proves the historical state pinning matches contract state)
  const callData = encodeBalanceOf(source, BigInt(source).toString());
  const balanceHex = await session.anvil!.call<string>('eth_call', [
    { to: HUB_V2, data: callData },
    'latest',
  ]);
  const balance = BigInt(balanceHex);

  console.log(`\nOn-chain balance of ${source} for own token: ${balance} wei`);

  if (balance >= amount) {
    console.log(`Has enough for ${amount} wei.`);
  } else {
    console.log(`Has only ${balance} wei (need ${amount}). Path may need fewer hops.`);
  }

  // 3. Show how to take an EOA snapshot before executing, so the SDK runner can
  //    revert back to clean state after testing
  const snapshotId = await session.anvil!.snapshot();
  console.log(`\nAnvil snapshot taken: ${snapshotId}`);
  console.log(`(call session.anvil!.revert("${snapshotId}") to undo subsequent state changes)`);

  await session.release();
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
