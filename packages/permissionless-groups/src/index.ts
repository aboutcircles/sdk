export { PermissionlessGroup, encodePolicyData } from './PermissionlessGroup.js';
export { ScoreGroupsClient } from './ScoreGroupsClient.js';
export { PermissionlessGroupError } from './errors.js';
export type { PermissionlessGroupErrorSource } from './errors.js';
export type {
  PermissionlessGroupConfig,
  MintParams,
  MintResult,
  MigrationParams,
  MigrationResult,
  BalanceResult,
  ProofResponse,
} from './types.js';

// Re-export ABIs + contract wrappers + addresses for convenience.
// Canonical homes: @aboutcircles/sdk-abis, @aboutcircles/sdk-core, @aboutcircles/sdk-utils.
export { scoreGatedMintPolicyAbi } from '@aboutcircles/sdk-abis';
export { ScoreGatedMintPolicyContract } from '@aboutcircles/sdk-core';
export {
  PERMISSIONLESS_GROUPS_STAGING,
  PERMISSIONLESS_GROUPS_MIGRATION,
  SCORE_GROUPS_STAGING_BACKEND_URL,
  DEFAULT_SCORE_THRESHOLD,
  withPermissionlessGroupsStaging,
} from '@aboutcircles/sdk-utils';
