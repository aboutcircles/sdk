import type { Address } from './base';

/**
 * Token-related types
 */

/**
 * Token balance information
 */
export interface TokenBalance {
  tokenAddress: Address;
  tokenId: bigint;
  tokenOwner: Address;
  tokenType: string;
  version: number;
  attoCircles: bigint;
  circles: number;
  staticAttoCircles: bigint;
  staticCircles: number;
  attoCrc: bigint;
  crc: number;
  isErc20: boolean;
  isErc1155: boolean;
  isWrapped: boolean;
  isInflationary: boolean;
  isGroup: boolean;
}

/**
 * Token information from circles_getTokenInfoBatch
 */
export interface TokenInfo {
  tokenAddress: Address;
  tokenOwner: Address;
  tokenType: string;
  version: number;
  type?: string;
}

/**
 * Token holder information from V_CrcV2_BalancesByAccountAndToken
 */
export interface TokenHolder {
  account: Address;
  tokenAddress: Address;
  demurragedTotalBalance: string;
}

/**
 * Token holder row emitted by circles_getTokenHolders RPC
 */
export interface TokenHolderRow {
  account: Address;
  balance: string;
  tokenAddress: Address;
  version: number;
}
