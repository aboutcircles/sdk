/**
 * Live migration example — legacy GnosisGroup CRC → ScoreGroup via SinkWrapper.
 *
 * `PermissionlessGroup.migration()` does the heavy lifting:
 *   1. asks the pathfinder for `MAX_FLOW` from `avatar` to the SinkWrapper —
 *      everything the trust graph can route in one shot
 *   2. drops *sink-bypass branches* (edges that deposit group-CRC into the
 *      sink from a non-group address; those revert on-chain) and the
 *      predecessor edges that funded them
 *   3. batch-queries the score-groups backend for each collateral's
 *      `leftToMintEffective` cap
 *   4. uniformly scales the whole path down to the most-binding cap so no
 *      branch can trip `CollateralLimitReached` on-chain
 *   5. hands the (possibly scaled) path to the transfers package to emit the
 *      unwrap + `operateFlowMatrix` + re-wrap batch
 *
 * The script migrates the maximum possible amount by default. Pass
 * `MIGRATION_AMOUNT` only when you want to cap the migration at a specific
 * size (e.g. for a slider UI or a test) — pathfinder will then refuse if the
 * exact amount can't be sourced.
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
 *   MIGRATION_AMOUNT   Atto-CRC to migrate. Omit for max migratable.
 *   MIGRATION_DEBUG    When `1`, prints raw signed execTransaction calldata
 *                      (paste into Tenderly) instead of submitting.
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

const formatCrc = (atto: bigint): string => {
  const sign = atto < 0n ? '-' : '';
  const abs = atto < 0n ? -atto : atto;
  const whole = abs / 10n ** 18n;
  const frac = abs % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '');
  return fracStr ? `${sign}${whole}.${fracStr}` : `${sign}${whole}`;
};

async function main() {
  const PRIVATE_KEY = req('PRIVATE_KEY') as Hex;
  const SAFE = req('SAFE_ADDRESS') as Address;
  const ENV_AMOUNT = process.env.MIGRATION_AMOUNT;
  const requestedAmount = ENV_AMOUNT ? BigInt(ENV_AMOUNT) : undefined;

  log('rpc        =', RPC);
  log('safe       =', SAFE);
  log('sink       =', SINK);
  log('scoreGroup =', SCORE_GROUP);
  log('requested  =', requestedAmount ? `${formatCrc(requestedAmount)} CRC` : 'MAX');

  const group = new PermissionlessGroup({
    groupAddress: GROUP,
    hubAddress: HUB,
    liftERC20Address: LIFT,
    backendBaseUrl: SCORE_GROUPS_STAGING_BACKEND_URL,
    rpcUrl: RPC,
    circlesConfig: CONFIG,
  });

  log('\n=== preview migratable amount ===');
  // `migratableAmount()` runs the same pruning pipeline as `migration()`
  // but stops before building txs. Useful for showing "you could migrate
  // up to X CRC" in a UI before committing.
  const preview = await group.migratableAmount({
    avatar: SAFE,
    ...(requestedAmount !== undefined ? { amount: requestedAmount } : {}),
  });
  log('  probedMaxFlow    =', formatCrc(preview.probedMaxFlow), 'CRC (raw pathfinder headline)');
  log('  bypass branches  =', formatCrc(preview.bypassPruned), 'CRC removed');
  log('  → migratable now =', formatCrc(preview.amount), 'CRC');
  if (preview.collaterals.length) {
    log('  per-collateral cap report:');
    for (const c of preview.collaterals) {
      const capStr = c.cap === null ? 'n/a' : formatCrc(c.cap);
      const tag = c.capped ? ' [CAPPED]' : '';
      log(
        `    ${c.collateral} path=${formatCrc(c.pathAmount)} cap=${capStr} → final=${formatCrc(c.finalAmount)}${tag}`
      );
    }
  }

  if (preview.amount === 0n) {
    log('\nnothing to migrate after pruning — exiting');
    return;
  }

  log('\n=== build migration batch ===');
  // Re-queries the pathfinder + reapplies pruning, then builds the tx
  // batch. Numbers may differ slightly from the preview if the chain
  // moved (typically within the 10 bp pathfinder buffer).
  const { txs, amount, requestedAmount: pathMax, probedMaxFlow, bypassPruned } =
    await group.migration({
      avatar: SAFE,
      ...(requestedAmount !== undefined ? { amount: requestedAmount } : {}),
    });

  if (probedMaxFlow !== null) {
    log('  probedMaxFlow      =', formatCrc(probedMaxFlow), 'CRC (raw MAX_FLOW probe)');
  }
  log('  feasible path      =', formatCrc(pathMax), 'CRC');
  log('  bypass branches    =', formatCrc(bypassPruned), 'CRC removed');
  log('  after cap pruning  =', formatCrc(amount), 'CRC');
  log('  txs                =', txs.length);

  if (amount === 0n) {
    log('\nnothing to migrate after pruning — exiting');
    return;
  }

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
