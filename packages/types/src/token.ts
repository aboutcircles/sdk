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
 * Token information
 */
export interface TokenInfo {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  version: number;
  type?: string;
  tokenType: string;
  token: Address;
  tokenOwner: Address;
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
