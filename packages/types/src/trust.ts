import type { Address, Hex } from './base.js';

/**
 * Trust relation types
 */

/**
 * Trust relation information
 */
export interface TrustRelation {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: Hex;
  truster: Address;
  trustee: Address;
  expiryTime: number;
}

export type TrustRelationType = 'trusts' | 'trustedBy' | 'mutuallyTrusts';

export interface AggregatedTrustRelation {
  subjectAvatar: Address;
  relation: TrustRelationType;
  objectAvatar: Address;
  timestamp: number;
}
