import type { Address } from './base';

/**
 * SDK-related types
 */

/**
 * Avatar type string literals from Circles protocol
 * These correspond to the registration events in the Circles V1/V2 contracts
 */
export type AvatarType =
  | 'CrcV1_Signup'
  | 'CrcV2_RegisterHuman'
  | 'CrcV2_RegisterGroup'
  | 'CrcV2_RegisterOrganization';

/**
 * Avatar row data from RPC
 */
export interface AvatarRow {
  /** The avatar's address (canonical field name from RPC) */
  avatar: Address;
  /**
   * The avatar's address (alias for backward compatibility)
   * @deprecated Use `avatar` instead. This field will be removed in a future version.
   */
  address: Address;
  /** Circles version (1 or 2) */
  version: number;
  /** Avatar type indicating how it was registered */
  type: AvatarType;
  /** Profile CID stored in the name registry */
  cidV0?: string;
  /** Name from the name registry */
  name?: string;
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
