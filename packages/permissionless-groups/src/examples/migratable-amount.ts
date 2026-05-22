/**
 * Minimal example — preview how much an avatar can migrate right now.
 *
 * `PermissionlessGroup.migratableAmount(params)` runs the pathfinder +
 * bypass + per-collateral cap pruning without building any transactions.
 * Use it for UI previews ("you could migrate up to X CRC") before calling
 * `migration()` to actually submit.
 *
 * Run:
 *   set -a && source .env && set +a
 *   bun run packages/permissionless-groups/src/examples/migratable-amount.ts
 *
 * Required env:
 *   SAFE_ADDRESS   Avatar to preview (typically the Safe holding the CRC).
 */
import { circlesConfig, PERMISSIONLESS_GROUPS_MIGRATION } from '@aboutcircles/sdk-utils';
import {
  PermissionlessGroup,
  PERMISSIONLESS_GROUPS_STAGING,
  SCORE_GROUPS_STAGING_BACKEND_URL,
  SCORE_GROUPS_STAGING_RPC_URL,
} from '../index.js';
import type { Address } from '@aboutcircles/sdk-types';

const RPC = SCORE_GROUPS_STAGING_RPC_URL;
const CONFIG = { ...circlesConfig[100]!, circlesRpcUrl: RPC, pathfinderUrl: RPC };
const SAFE = process.env.SAFE_ADDRESS as Address;
if (!SAFE) throw new Error('Missing env: SAFE_ADDRESS');

const group = new PermissionlessGroup({
  groupAddress: PERMISSIONLESS_GROUPS_STAGING.groupAddress,
  hubAddress: CONFIG.v2HubAddress,
  liftERC20Address: CONFIG.liftERC20Address,
  backendBaseUrl: SCORE_GROUPS_STAGING_BACKEND_URL,
  rpcUrl: RPC,
  circlesConfig: CONFIG,
});

const { amount, probedMaxFlow, bypassPruned } = await group.migratableAmount({
  avatar: SAFE,
});

const crc = (atto: bigint) => `${Number(atto) / 1e18} CRC`;
console.log('avatar          =', SAFE);
console.log('pathfinder max  =', crc(probedMaxFlow));
console.log('bypass removed  =', crc(bypassPruned));
console.log('migratable now  =', crc(amount));
console.log('sink            =', PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress);
