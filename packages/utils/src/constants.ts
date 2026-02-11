import type { Address } from '@aboutcircles/sdk-types';

/**
 * Common constants used across the SDK
 */

/**
 * The zero address (0x0000000000000000000000000000000000000000)
 */
export const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

/**
 * The invitation fee required to invite a new user (96 CRC)
 */
export const INVITATION_FEE = BigInt(96) * BigInt(10 ** 18);

/**
 * Maximum target flow value used for pathfinding to find the maximum possible flow
 * This represents an extremely large number that effectively means "find max flow"
 */
export const MAX_FLOW = BigInt('9999999999999999999999999999999999999');

/**
 * Safe Proxy Factory address used to deploy Safe proxies
 */
export const SAFE_PROXY_FACTORY: Address = '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67';

/**
 * Hash of the account initializer used in CREATE2 salt calculation
 */
export const ACCOUNT_INITIALIZER_HASH: `0x${string}` = '0x89867a67674bd4bf33165a653cde826b696ab7d050166b71066dfa0b9b6f90f4';

/**
 * Hash of the account creation code used in CREATE2 address calculation
 */
export const ACCOUNT_CREATION_CODE_HASH: `0x${string}` = '0xe298282cefe913ab5d282047161268a8222e4bd4ed106300c547894bbefd31ee';

/**
 * Gnosis group address used for filtering trusted accounts in invitation logic
 */
export const GNOSIS_GROUP_ADDRESS: Address = '0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c';

/**
 * Farm destination address for market-based invitations
 * Send 96 CRC here via transitive transfer to earn quota on the InvitationFarm
 */
export const FARM_DESTINATION: Address = '0x9Eb51E6A39B3F17bB1883B80748b56170039ff1d';
