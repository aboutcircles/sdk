import { TestEnvClient } from '@aboutcircles/sdk-test-env-client';

/**
 * Test Environment basics: create a session with all four features
 * (db, anvil, rpc, pathfinder), exercise each, then release.
 *
 * Set TEST_ENV_URL to your test environment (defaults to http://localhost:5200).
 */

const baseUrl =
  process.env.TEST_ENV_URL ?? 'http://localhost:5200';

async function main() {
  const client = new TestEnvClient({ baseUrl, timeoutMs: 60_000 });

  const health = await client.health();
  console.log(`Health: ${health.status} (active sessions: ${health.activeSessions})`);

  const currentBlock = await client.currentBlock();
  const targetBlock = currentBlock - 5_000;
  console.log(`Current block: ${currentBlock}, requesting session at: ${targetBlock}`);

  const session = await client.createSession({
    blockNumber: targetBlock,
    features: ['db', 'anvil', 'rpc', 'pathfinder'],
    ttlMinutes: 5,
  });

  console.log(`\nSession ${session.id} created, expires ${session.expiresAt.toISOString()}`);
  console.log(`Block pinned to: ${session.blockNumber}`);

  // db — historical row count
  if (session.postgres) {
    const result = await session.postgres.scalar<number>(
      'SELECT COUNT(*) FROM "V_CrcV2_Avatars"',
    );
    console.log(`\n[db] Avatars at block ${session.blockNumber}: ${result.value} (${result.executionTimeMs}ms)`);
  }

  // anvil — chain id + block
  if (session.anvil) {
    const blockNumber = await session.anvil.getBlockNumber();
    console.log(`[anvil] chainId=${session.anvil.chainId}, blockNumber=${blockNumber}, accounts[0]=${session.anvil.accounts[0]}`);
  }

  // rpc — circles_getAvatarInfo via the block-pinned RPC
  if (session.rpc) {
    const blockHex = await session.rpc.call<string>('eth_blockNumber', []);
    console.log(`[rpc] eth_blockNumber=${BigInt(blockHex)}`);
  }

  // pathfinder — snapshot summary
  if (session.pathfinder) {
    const snap = await session.pathfinder.snapshot();
    console.log(`[pathfinder] snapshot graphBlock=${snap.BlockNumber}, addresses=${snap.Addresses?.length ?? 0}`);
  }

  await session.release();
  console.log(`\nSession ${session.id} released.`);
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
