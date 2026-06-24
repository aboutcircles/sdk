import type { Address, Hex } from './base';

export interface TransactionHistoryRow {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: Hex;
  version: number;
  from: Address;
  to: Address;
  operator?: Address;
  id?: string;
  value: string;
  circles: string;
  attoCircles: string;
  crc: string;
  attoCrc: string;
  staticCircles: string;
  staticAttoCircles: string;
}

/**
 * A transfer-data annotation row, as returned by `circles_getTransferData`.
 *
 * Annotations are carried in the `data` bytes of an ERC-1155 `safeTransferFrom`
 * (including the 0-value transfer used to annotate a gCRC/ERC-20 transfer). The indexer
 * extracts them from calldata and stores them keyed by `(transactionHash, from, to)` — there
 * is no explicit link to a specific value transfer, so correlate by those fields. Decode
 * `data` with `decodeCrcV2TransferData` from `@aboutcircles/sdk-utils`.
 */
export interface TransferDataRow {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  /** Synthetic, negative for calldata-derived events (no real log emitted the data). */
  logIndex: number;
  transactionHash: Hex;
  from: Address;
  to: Address;
  /** 0x-prefixed hex annotation blob; decode with `decodeCrcV2TransferData`. */
  data: Hex;
}
