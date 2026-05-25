/**
 * Live migration example — legacy GnosisGroup CRC → ScoreGroup via SinkWrapper.
 *
 * `PermissionlessGroup.migration()` asks the pathfinder to route CRC from
 * `avatar` into the SinkWrapper, then hands the path to the transfers package
 * to emit the unwrap + `operateFlowMatrix` + re-wrap batch.
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
 *   MIGRATION_AMOUNT   Atto-CRC to migrate. Omit for max (MAX_FLOW).
 *   MAX_EDGES          Cap on flow-matrix edges (default 100).
 *   MIGRATION_DEBUG    When `1`, prints raw signed execTransaction calldata
 *                      (paste into Tenderly) instead of submitting.
 */
import { SafeContractRunner, chains } from '@aboutcircles/sdk-runner';
import { circlesConfig, PERMISSIONLESS_GROUPS_MIGRATION } from '@aboutcircles/sdk-utils';

import {
  PermissionlessGroup,
  PERMISSIONLESS_GROUPS_STAGING,
  SCORE_GROUPS_STAGING_BACKEND_URL,
  SCORE_GROUPS_STAGING_RPC_URL,
} from '../index.js';
import type { Address, Hex } from '@aboutcircles/sdk-types';

// Staging indexer / pathfinder. The on-chain contracts are still prod
// (Hub V2, Lift, GnosisGroup, SinkWrapper) — only the indexer + pathfinder
// move to staging because that's where the score-groups stack is wired up.
const RPC = SCORE_GROUPS_STAGING_RPC_URL;
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
  const maxEdges = process.env.MAX_EDGES ? Number(process.env.MAX_EDGES) : 100;

  log('rpc        =', RPC);
  log('safe       =', SAFE);
  log('sink       =', SINK);
  log('scoreGroup =', SCORE_GROUP);
  log('requested  =', requestedAmount ? `${formatCrc(requestedAmount)} CRC` : 'MAX');
  log('maxEdges   =', maxEdges);

  const group = new PermissionlessGroup({
    groupAddress: GROUP,
    hubAddress: HUB,
    liftERC20Address: LIFT,
    backendBaseUrl: SCORE_GROUPS_STAGING_BACKEND_URL,
    rpcUrl: RPC,
    circlesConfig: CONFIG,
  });

  log('\n=== build migration batch ===');
  const { txs, amount } = await group.migration({
    avatar: SAFE,
    maxEdges,
    ...(requestedAmount !== undefined ? { amount: requestedAmount } : {}),
  });
  log('  routed =', formatCrc(amount), 'CRC');
  log('  txs    =', txs.length);

  if (amount === 0n) {
    log('\nnothing to migrate — exiting');
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
