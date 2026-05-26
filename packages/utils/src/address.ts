import type { Address, Hex } from '@aboutcircles/sdk-types';
import { ZERO_ADDRESS } from './constants.js';

/**
 * True when `a` is the zero address (case-insensitive).
 */
export function isZeroAddress(a: Address): boolean {
  return a.toLowerCase() === ZERO_ADDRESS;
}

/**
 * Case-insensitive equality for hex strings (addresses, hashes, calldata).
 */
export function hexEq(a: Hex, b: Hex): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Converts a uint256 value to an Ethereum address
 * Takes the last 20 bytes of the uint256
 *
 * @param uint256 - The uint256 value as a bigint
 * @returns The address as a checksummed hex string
 */
export function uint256ToAddress(uint256: bigint): Address {
  // Convert bigint to hex string
  const hex = uint256.toString(16);

  // Pad to 64 characters (256 bits / 4 bits per hex char)
  const paddedHex = hex.padStart(64, '0');

  // Take the last 40 characters (20 bytes = 160 bits)
  const addressHex = paddedHex.slice(-40);

  // Add 0x prefix and return as lowercase (checksumming happens at consumer level if needed)
  return `0x${addressHex}` as Address;
}
