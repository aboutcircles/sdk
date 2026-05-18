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
  groupAddress: '0x24c9bA1fB88533B0cD2aEa37DaD75B809eEcF2C0' as Address,

  /** Treasury of the score-gated group. */
  treasuryAddress: '0x4cb3b2Bb537d6252e57c021B95f2fB1aa11d09aa' as Address,
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
 * Note `scoreGroupAddress` and `scoreGroupTreasuryAddress` deliberately
 * overlap with `PERMISSIONLESS_GROUPS_STAGING.groupAddress` and `.treasuryAddress` —
 * the destination of the migration *is* the staging score-gated group.
 */
export const PERMISSIONLESS_GROUPS_MIGRATION = {
  /**
   * SinkWrapper / PathDestinationWrapper. Receives scoreGroupCRC via 1155
   * safeTransferFrom and mints out a stable ERC20 to the source.
   */
  sinkWrapperAddress: '0xc1936539cF967e3b3C20cE994EBc6659a19aBa99' as Address,

  /** Source group of the migration path (legacy GnosisGroup). */
  gnosisGroupAddress: '0xC19BC204eb1c1D5B3FE500E5E5dfaBaB625F286c' as Address,

  /** Treasury of the GnosisGroup, holding the original collateral. */
  gnosisGroupTreasuryAddress: '0x61CC0D966A97d716Ec5Cbe02095d45aA22B28b1d' as Address,

  /**
   * ScoreRouter — receives collateral from the source treasury and forwards
   * it to the destination ScoreGroup along the trusted path. Admin operations:
   *   - `enableCRCForRouting(address[])`
   *   - `setApprovalForCRC(address[])`
   */
  scoreRouterAddress: '0x819fB2af6d66A4fdE8D2F8396283Cc9b40208c1D' as Address,

  /** Destination ScoreGroup of the migration. Same as PERMISSIONLESS_GROUPS_STAGING.groupAddress. */
  scoreGroupAddress: '0x24c9bA1fB88533B0cD2aEa37DaD75B809eEcF2C0' as Address,

  /** Treasury of the destination ScoreGroup. */
  scoreGroupTreasuryAddress: '0x4cb3b2Bb537d6252e57c021B95f2fB1aa11d09aa' as Address,
} as const;

/**
 * Backend URL for the staging score-groups deployment.
 * Operates on the prod Gnosis Chain contracts.
 *
 * (Renamed from `/pgroups` on 2026-05-11. The legacy path no longer responds.)
 */
export const SCORE_GROUPS_STAGING_BACKEND_URL = 'https://rpc.staging.aboutcircles.com/score-groups';

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
