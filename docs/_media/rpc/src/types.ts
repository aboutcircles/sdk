import type { Address } from '@aboutcircles/sdk-types';

/**
 * RPC-specific types
 * These types are specific to the RPC package and not shared across multiple packages
 */

/**
 * Transaction history row (base data from RPC)
 * Might include conversions between different circle representations
 */
export interface TransactionHistoryRow {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  version: number;
  from: Address;
  to: Address;
  id: string;
  tokenAddress: Address;
  value: string;
  /** Human-readable circle amount (demurraged) */
  circles?: number;
  /** Atto-circles (demurraged, 18 decimals) */
  attoCircles?: bigint;
  /** Static circles (inflationary, human-readable) */
  staticCircles?: number;
  /** Atto-static circles (inflationary, 18 decimals) */
  staticAttoCircles?: bigint;
  /** Time Circles (CRC) human-readable */
  crc?: number;
  /** Atto-CRC (18 decimals) */
  attoCrc?: bigint;
}

/**
 * Search result profile with additional metadata
 */
export interface SearchResultProfile {
  address: Address;
  name: string;
  description?: string;
  previewImageUrl?: string;
  imageUrl?: string;
  location?: string;
  geoLocation?: [number, number];
  extensions?: Record<string, any>;
  avatarType?: string;
  CID?: string;
  lastUpdatedAt?: number;
  registeredName?: string | null;
}

/**
 * Row type for GroupTokenHoldersBalance view table
 */
export interface GroupTokenHolderRow {
  group: Address;
  holder: Address;
  totalBalance: bigint;
  demurragedTotalBalance: bigint;
  fractionOwnership: number;
}

/**
 * Configuration for a cursor column in pagination.
 * Used only for buildOrderBy() — cursor columns define the sort order.
 */
export interface CursorColumn {
  name: string;
  sortOrder: 'ASC' | 'DESC';
}

/**
 * Flexible paged result using server-side opaque cursors
 */
export interface FlexiblePagedResult<TRow> {
  limit: number;
  size: number;
  sortOrder: 'ASC' | 'DESC';
  hasMore: boolean;
  nextCursor?: string;
  results: TRow[];
}
