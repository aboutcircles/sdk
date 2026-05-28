import type { Address, CirclesConfig } from '@aboutcircles/sdk-types';

/**
 * Permissionless-groups (score-gated mint) addresses.
 *
 * The staging *backend* (`https://rpc.staging.aboutcircles.com/score-groups`) works
 * against **production contracts on Gnosis Chain**. There is no separate
 * "staging hub" — Hub V2 is always `circlesConfig[100].v2HubAddress`.
 *
 * What differs across environments is the *backend URL* and *which group +
 * policy* the backend operates on. Treat the addresses below as configuration;
 * production deployments may re-issue them.
 */
export const PERMISSIONLESS_GROUPS_STAGING = {
  /** Score-gated group avatar served by the staging backend. */
  groupAddress: '0x93eD5A96347927ff6fF6b790F8Cf5258240c321f' as Address,

  /**
   * Parent ScoreTreasury (collateral custodian). Verifies and forwards every
   * Hub-initiated receipt to a sub-treasury. Only this parent exposes
   * `balanceOfCollateral(id)` — the aggregate across both sub-treasuries.
   */
  treasuryAddress: '0xE445f8b377f7689D2987920D51B8bBa21B6241Ce' as Address,

  /** Sub-treasury holding collateral routed from low-score (below threshold) minters. */
  lowScoreTreasuryAddress: '0xd9fa2f4A35899f7d1e5ADb79592fbf51DC0806a4' as Address,

  /** Sub-treasury holding collateral routed from high-score (above threshold) minters. */
  highScoreTreasuryAddress: '0x516ADcF32be9576AefE2176C059d8abaB4f3C2D4' as Address,

  /** MerkleTreeRegistry — registry of published score Merkle trees. */
  merkleTreeRegistryAddress: '0xB4bfedaD42a14c30Bd9C1FdBf3e11916Fc719E6C' as Address,
} as const;

// The ScoreGatedMintPolicy address is intentionally NOT in this constant —
// `Hub.mintPolicies(groupAddress)` is the source of truth and the SDK reads
// it lazily. Caller-side ops on the resolved policy:
//   - `merkleRoots(group)` → current SMT root the policy verifies against.
//   - `snapshotIssuance()` → minter must call before `Hub.groupMint`.
//   - `updateMerkleRoot(group, root)` → admin-only (publisher uses it).

/**
 * Migration-path stack: legacy GnosisGroup → ScoreGroup via router + sink
 * wrapper. The first-iteration SDK doesn't drive this path, but the
 * addresses are stored here so they're discoverable from one place.
 *
 * Note `scoreGroupAddress`, `scoreGroupLowScoreTreasuryAddress`, and
 * `scoreGroupHighScoreTreasuryAddress` deliberately overlap with the fields
 * on `PERMISSIONLESS_GROUPS_STAGING` — the destination of the migration *is*
 * the staging score-gated group.
 */
export const PERMISSIONLESS_GROUPS_MIGRATION = {
  /**
   * SinkWrapper / PathDestinationWrapper. Receives scoreGroupCRC via 1155
   * safeTransferFrom and mints out a stable ERC20 to the source.
   */
  sinkWrapperAddress: '0xD4cF9afd3aE777C24454b70dd28E32d1bd516F05' as Address,

  /** Source group of the migration path (legacy GnosisGroup). */
  gnosisGroupAddress: '0xC19BC204eb1c1D5B3FE500E5E5dfaBaB625F286c' as Address,

  /** Treasury of the GnosisGroup, holding the original collateral. */
  gnosisGroupTreasuryAddress: '0x61CC0D966A97d716Ec5Cbe02095d45aA22B28b1d' as Address,

  /**
   * ScoreRouter (ScoreGroupMintRouter) — an org on the trust graph between
   * curated personal CRCs and the group, so flow paths can route through it.
   * Admin operations:
   *   - `enableCRCForRouting(address[])` / `disableCRCForRouting(address[])`
   *   - `setApprovalForCRC(address[])` (permissionless; grants operator rights
   *     for `HUB.operateFlowMatrix`, not revocable from this contract)
   */
  scoreRouterAddress: '0xE171a76De6B645A28b3767f84B177a4f6659a3D7' as Address,

  /** Destination ScoreGroup of the migration. Same as PERMISSIONLESS_GROUPS_STAGING.groupAddress. */
  scoreGroupAddress: '0x93eD5A96347927ff6fF6b790F8Cf5258240c321f' as Address,

  /** Treasury of the destination ScoreGroup, low-score branch. */
  scoreGroupLowScoreTreasuryAddress: '0xd9fa2f4A35899f7d1e5ADb79592fbf51DC0806a4' as Address,

  /** Treasury of the destination ScoreGroup, high-score branch. */
  scoreGroupHighScoreTreasuryAddress: '0x516ADcF32be9576AefE2176C059d8abaB4f3C2D4' as Address,
} as const;

/**
 * Backend URL for the staging score-groups deployment.
 * Operates on the prod Gnosis Chain contracts.
 *
 * (Renamed from `/pgroups` on 2026-05-11. The legacy path no longer responds.)
 */
export const SCORE_GROUPS_STAGING_BACKEND_URL = 'https://rpc.staging.aboutcircles.com/score-groups';

/**
 * Staging Circles RPC URL — the only indexer that knows about the
 * score-groups migration stack (sinkWrapper, scoreRouter, score-gated
 * trust). The `PermissionlessGroup` SDK relies on the pathfinder hosted
 * here; pointing `circlesConfig.circlesRpcUrl` at the prod indexer
 * `rpc.aboutcircles.com` will silently return paths that don't route
 * through the score router and revert at the sink.
 *
 * Use this as the source of truth — the constructor of `PermissionlessGroup`
 * warns when `circlesConfig.circlesRpcUrl` doesn't match.
 */
export const SCORE_GROUPS_STAGING_RPC_URL = 'https://rpc.staging.aboutcircles.com/';

/**
 * Default score threshold used by the deployed ScoreGatedMintPolicy. Scores
 * are on a 0–100 integer scale; minters with a score below this revert.
 */
export const DEFAULT_SCORE_THRESHOLD = 50n;

/**
 * Returns a CirclesConfig pre-populated with the staging permissionless-groups
 * backend URL, mint policy, and group avatar layered onto a base config.
 */
export function withPermissionlessGroupsStaging(
  base: CirclesConfig,
  overrides?: Partial<Pick<CirclesConfig,
    | 'scoreGroupsBackendUrl'
    | 'scoreGatedGroupAddress'>>
): CirclesConfig {
  return {
    ...base,
    scoreGroupsBackendUrl: SCORE_GROUPS_STAGING_BACKEND_URL,
    scoreGatedGroupAddress: PERMISSIONLESS_GROUPS_STAGING.groupAddress,
    ...overrides,
  };
}
