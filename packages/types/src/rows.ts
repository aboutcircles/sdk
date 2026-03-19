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
