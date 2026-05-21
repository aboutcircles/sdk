/**
 * Raw migration example — no pruning, pathfinder result submitted as-is.
 *
 * `PermissionlessGroup.migrationRaw(params)` calls the pathfinder and hands
 * the path straight to the flow-matrix builder with no bypass-branch
 * pruning, no per-collateral cap scaling, no two-stage probe. Omit
 * `amount` to request the pathfinder's MAX_FLOW sentinel (max migratable
 * in one shot — note MAX_FLOW plans are often over-committed and may
 * revert on-chain). Pass an explicit `amount` for a fixed-size migration.
 *
 * For production migrations use `migration()` (it adds the pruning that
 * keeps the live tx from reverting).
 *
 * Run:
 *   set -a && source .env && set +a
 *   bun run packages/permissionless-groups/src/examples/migration-raw.ts
 *
 * Required env:
 *   PRIVATE_KEY        Safe owner private key
 *   SAFE_ADDRESS       Safe wallet address holding the GnosisGroup CRC
 *
 * Optional env:
 *   MIGRATION_AMOUNT   Atto-CRC to migrate. Omit for MAX_FLOW.
 *   MIGRATION_DEBUG    When `1`, prints raw signed execTransaction calldata
 *                      instead of submitting.
 */
import { SafeContractRunner, chains } from '@aboutcircles/sdk-runner';
import { circlesConfig } from '@aboutcircles/sdk-utils';
import {
  PermissionlessGroup,
  PERMISSIONLESS_GROUPS_STAGING,
  SCORE_GROUPS_STAGING_BACKEND_URL,
} from '../index.js';
import type { Address, Hex } from '@aboutcircles/sdk-types';

const RPC = 'https://rpc.staging.aboutcircles.com/';
const CONFIG = { ...circlesConfig[100]!, circlesRpcUrl: RPC, pathfinderUrl: RPC };
const SAFE = process.env.SAFE_ADDRESS as Address;
const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex;
const amount = process.env.MIGRATION_AMOUNT ? BigInt(process.env.MIGRATION_AMOUNT) : undefined;
if (!SAFE || !PRIVATE_KEY) throw new Error('Missing env: SAFE_ADDRESS and/or PRIVATE_KEY');

const group = new PermissionlessGroup({
  groupAddress: PERMISSIONLESS_GROUPS_STAGING.groupAddress,
  hubAddress: CONFIG.v2HubAddress,
  liftERC20Address: CONFIG.liftERC20Address,
  backendBaseUrl: SCORE_GROUPS_STAGING_BACKEND_URL,
  rpcUrl: RPC,
  circlesConfig: CONFIG,
});

const { txs, amount: routed } = await group.migrationRaw({
  avatar: SAFE,
  ...(amount !== undefined ? { amount } : {}),
});
console.log('requested =', amount !== undefined ? `${Number(amount) / 1e18} CRC` : 'MAX');
console.log('routed    =', Number(routed) / 1e18, 'CRC');
console.log('txs       =', txs.length);

const runner = await SafeContractRunner.create(RPC, PRIVATE_KEY, SAFE, chains.gnosis);

if (process.env.MIGRATION_DEBUG === '1') {
  const call = await runner.encodeTransaction!(txs);
  console.log('from =', call.from);
  console.log('to   =', call.to);
  console.log('data =', call.data);
} else {
  const receipt = await runner.sendTransaction!(txs);
  console.log('tx     =', (receipt as any).transactionHash);
  console.log('status =', (receipt as any).status);
}
