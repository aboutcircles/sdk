/**
 * Live migration example — legacy GnosisGroup CRC → ScoreGroup via SinkWrapper.
 *
 * `PermissionlessGroup.migration()` builds the path-based tx batch:
 *   - destination       = SinkWrapper (PathDestinationWrapper)
 *   - excludeFromTokens = [ScoreGroup]   (already-migrated ScoreGroup CRC may not be used as a source)
 *
 * The sink mints out the wrapped ERC20 to the original sender inside its
 * `onERC1155Received` hook — no extra step required from the SDK.
 *
 * Run:
 *   set -a && source .env && set +a
 *   bun run packages/permissionless-groups/src/examples/migration.ts
 *
 * Required env:
 *   PRIVATE_KEY        Safe owner private key (signer for the multisend tx)
 *   SAFE_ADDRESS       Safe wallet address holding the GnosisGroup CRC
 *
 * Optional env:
 *   MIGRATION_AMOUNT   Atto-CRC to migrate. Omit to fall back to the example
 *                      default (6400 CRC). `migration()` forwards this verbatim
 *                      to the pathfinder as `targetFlow`; the pathfinder will
 *                      refuse if the requested amount cannot be sourced.
 */
import { SafeContractRunner, chains } from '@aboutcircles/sdk-runner';
import { circlesConfig, PERMISSIONLESS_GROUPS_MIGRATION } from '@aboutcircles/sdk-utils';

import {
  PermissionlessGroup,
  PERMISSIONLESS_GROUPS_STAGING,
  SCORE_GROUPS_STAGING_BACKEND_URL,
} from '../index.js';
import type { Address, Hex } from '@aboutcircles/sdk-types';

// Staging indexer / pathfinder. The on-chain contracts are still prod
// (Hub V2, Lift, GnosisGroup, SinkWrapper) — only the indexer + pathfinder
// move to staging because that's where the score-groups stack is wired up.
const RPC = 'https://rpc.staging.aboutcircles.com/';
const CONFIG = {
  ...circlesConfig[100]!,
  circlesRpcUrl: RPC,
  pathfinderUrl: RPC,
};
const HUB = CONFIG.v2HubAddress;
const LIFT = CONFIG.liftERC20Address;
const GROUP = PERMISSIONLESS_GROUPS_STAGING.groupAddress;
const SINK = PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress;
const SCORE_GROUP = PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress;

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const log = (...a: unknown[]) => console.log('[migration]', ...a);

async function main() {
  const PRIVATE_KEY = req('PRIVATE_KEY') as Hex;
  const SAFE = req('SAFE_ADDRESS') as Address;
  const ENV_AMOUNT = process.env.MIGRATION_AMOUNT;

  log('rpc         =', RPC);
  log('safe        =', SAFE);
  log('sink        =', SINK);
  log('exclude     =', SCORE_GROUP, '(ScoreGroup CRC, source-side)');
  log('amount      =', ENV_AMOUNT ?? '6400 CRC (default)');

  // `migration()` requires an explicit `amount`. Default to 6400 CRC when env
  // omits a value — callers wanting "max migratable" should query the
  // pathfinder's max-flow API themselves and pass the result.
  const amount: bigint | undefined = ENV_AMOUNT ? BigInt(ENV_AMOUNT) : undefined;

  const group = new PermissionlessGroup({
    groupAddress: GROUP,
    hubAddress: HUB,
    liftERC20Address: LIFT,
    backendBaseUrl: SCORE_GROUPS_STAGING_BACKEND_URL,
    rpcUrl: RPC,
    circlesConfig: CONFIG,
  });

  log('\n=== probe max redeemable amount ===');
  // Ask the score-groups backend how much this avatar can still migrate
  // today against this group. `leftToMintEffective` is the source of truth —
  // it folds in the on-chain policy state plus what's already in the treasury.
  const limitsUrl =
    `${SCORE_GROUPS_STAGING_BACKEND_URL}/groups/${GROUP}/mint-limits/${SAFE}`;
  const limitsRes = await fetch(limitsUrl, { headers: { Accept: 'application/json' } });
  if (!limitsRes.ok) throw new Error(`mint-limits ${limitsRes.status}: ${await limitsRes.text()}`);
  const limits = (await limitsRes.json()) as {
    migration: { leftToMintEffective: string; leftToMintEffectiveCrc: string };
  };
  const maxRedeemable = BigInt(limits.migration.leftToMintEffective);
  log('  leftToMintEffective =', limits.migration.leftToMintEffective, 'atto');
  log('  leftToMintEffective =', limits.migration.leftToMintEffectiveCrc, 'CRC');

  log('\n=== build migration batch ===');
  // `migration()` forwards `amount` straight to the pathfinder as `targetFlow`.
  // Clamp the requested amount to what the backend says the avatar can still
  // redeem today — otherwise the pathfinder may return a path that reverts
  // on-chain when the policy enforces its cap.
  const REQUESTED = amount ?? BigInt(6400e18);
  const targetFlow = REQUESTED < maxRedeemable ? REQUESTED : maxRedeemable;
  log('  requested      =', REQUESTED.toString(), 'atto');
  log('  maxRedeemable  =', maxRedeemable.toString(), 'atto');
  log('  targetFlow     =', targetFlow.toString(), 'atto (min of the two)');
  if (targetFlow === 0n) {
    log('  nothing to migrate today — exiting');
    return;
  }
  const { txs, amount: resolvedAmount } = await group.migration({
    avatar: SAFE,
    amount: targetFlow,
  });
  log('  amount =', resolvedAmount.toString(), 'atto');
  log('  txs    =', txs.length);

  const runner = await SafeContractRunner.create(RPC, PRIVATE_KEY, SAFE, chains.gnosis);

  // MIGRATION_DEBUG=1 → print the raw Safe execTransaction calldata and stop.
  // Paste {from, to, data} into Tenderly's "Simulate Transaction" to inspect
  // why the inner multisend reverts. The data is already signed by the
  // configured owner, so it's directly submittable too.
  if (process.env.MIGRATION_DEBUG === '1') {
    if (!runner.encodeTransaction) throw new Error('runner does not support encodeTransaction');
    const call = await runner.encodeTransaction(txs);
    log('\n=== raw execTransaction call (debug) ===');
    log('  from =', call.from);
    log('  to   =', call.to);
    log('  value=', call.value);
    log('  data =', call.data);
    return;
  }

  log('\n=== submit migration batch ===');
  if (!runner.sendTransaction) throw new Error('runner does not support sendTransaction');
  const receipt = await runner.sendTransaction(txs);
  log('  receipt =', summarizeReceipt(receipt));
}

function summarizeReceipt(r: unknown): string {
  const rec = r as {
    transactionHash?: string;
    status?: string;
    blockNumber?: bigint;
    gasUsed?: bigint;
  };
  return [
    `tx=${rec?.transactionHash}`,
    `status=${rec?.status}`,
    `block=${rec?.blockNumber}`,
    `gas=${rec?.gasUsed}`,
  ].join(' ');
}

main().catch((e) => {
  console.error('\n[migration] fatal:', e?.message ?? e);
  if (e?.context) console.error('[migration] context:', e.context);
  process.exit(1);
});
