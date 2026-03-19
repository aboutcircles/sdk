import type { Hex } from './base';

/**
 * Supported CRC V2 transfer data annotation types.
 *
 * - 0x0001: UTF-8 text
 * - 0x1001: UTF-8 text with metadata
 * - 0x0002: Raw 32-byte hex (e.g. XMTP message ID)
 * - 0x0003: IPFS CID
 * - 0x0004: ABI-encoded calldata
 */
export type TransferDataType = 0x0001 | 0x1001 | 0x0002 | 0x0003 | 0x0004;

/**
 * Decoded ABI calldata payload (type 0x0004).
 */
export interface DecodedAbiPayload {
  selector: Hex;
  data: Hex;
}

/**
 * Decoded text with metadata payload (type 0x1001).
 */
export interface DecodedMetadataPayload {
  message: string;
  metadata: string;
}

/**
 * Result of decoding a CRC V2 transfer data annotation.
 */
export interface DecodedTransferData {
  type: TransferDataType;
  length: number;
  payload: string | Hex | DecodedAbiPayload | DecodedMetadataPayload;
}
