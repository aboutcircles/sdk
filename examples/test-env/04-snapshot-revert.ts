import { TestEnvClient } from '@aboutcircles/sdk-test-env-client';

/**
 * Anvil snapshot/revert recipe.
 *
 * Pattern: take a snapshot before any destructive operation, exercise the
 * SDK code under test, then revert. The session's Anvil fork stays warm
 * and reusable across multiple revert cycles.
 */

const baseUrl =
  process.env.TEST_ENV_URL ?? 'http://localhost:5200';

async function main() {
  const client = new TestEnvClient({ baseUrl, timeoutMs: 60_000 });
  const currentBlock = await client.currentBlock();
  const targetBlock = currentBlock - 100;

  const session = await client.createSession({
    blockNumber: targetBlock,
    features: ['anvil'],
    ttlMinutes: 5,
  });

  console.log(`Session ${session.id} at block ${session.blockNumber}`);

  const anvil = session.anvil!;
  const eoa = anvil.accounts[0];

  const initial = await anvil.getBalance(eoa);
  console.log(`Initial xDAI balance of ${eoa}: ${initial}`);

  // Snapshot
  const snap = await anvil.snapshot();
  console.log(`Snapshot id: ${snap}`);

  // Destructive op: drain the EOA's xDAI to zero
  await anvil.setBalance(eoa, 0n);
  const afterDrain = await anvil.getBalance(eoa);
  console.log(`After drain: ${afterDrain} (expected 0)`);

  // Revert
  const reverted = await anvil.revert(snap);
  console.log(`Revert success: ${reverted}`);

  const restored = await anvil.getBalance(eoa);
  console.log(`After revert: ${restored} (expected ${initial})`);

  if (restored !== initial) {
    throw new Error(`Snapshot/revert did not restore state: ${restored} !== ${initial}`);
  }

  await session.release();
  console.log(`\nDone.`);
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
