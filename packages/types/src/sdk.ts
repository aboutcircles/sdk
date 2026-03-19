import type { Address } from './base.js';

/**
 * SDK-related types
 */

/**
 * Avatar row data from RPC
 */
export interface AvatarRow {
  address: Address;
  version: number;
  type: string;
  cidV0?: string; // Profile CID stored in the name registry
  // Additional fields as needed
}

/**
 * Token balance row from RPC
 */
export interface TokenBalanceRow {
  tokenAddress: Address;
  balance: bigint;
  // Additional fields as needed
}

/**
 * Trust relation row from RPC
 */
export interface TrustRelationRow {
  truster: Address;
  trustee: Address;
  expiryTime: number;
}

/**
 * Circles query result with pagination
 */
export interface CirclesQuery<T> {
  rows: T[];
  hasMore: boolean;
  nextPage(): Promise<CirclesQuery<T>>;
}

/**
 * Group type enumeration
 */
export enum GroupType {
  Standard = 'Standard',
  Custom = 'Custom',
}
