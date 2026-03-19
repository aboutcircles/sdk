import type { Address } from './base.js';

/**
 * Group-related types
 */

/**
 * Group row information
 */
export interface GroupRow {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  group: Address;
  type: string;
  owner: Address;
  mintPolicy?: Address;
  mintHandler?: Address;
  treasury?: Address;
  service?: Address;
  feeCollection?: Address;
  memberCount?: number;
  name?: string;
  symbol?: string;
  cidV0Digest?: string;
  erc20WrapperDemurraged?: Address;
  erc20WrapperStatic?: Address;
}

/**
 * Group membership row
 */
export interface GroupMembershipRow {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  group: Address;
  member: Address;
  expiryTime: number;
}

/**
 * Group query parameters
 */
export interface GroupQueryParams {
  nameStartsWith?: string;
  symbolStartsWith?: string;
  groupAddressIn?: Address[];
  groupTypeIn?: string[];
  ownerIn?: Address[];
  mintHandlerEquals?: Address;
  treasuryEquals?: Address;
}
