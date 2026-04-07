import type { Address, Hex } from '@aboutcircles/sdk-types';

/**
 * Converts a uint256 value to an Ethereum address
 * Takes the last 20 bytes of the uint256
 *
 * @param uint256 - The uint256 value as a bigint
 * @returns The address as a checksummed hex string
 */
export function uint256ToAddress(uint256: bigint): Address {
  const hex = uint256.toString(16);
  const paddedHex = hex.padStart(64, '0');
  const addressHex = paddedHex.slice(-40);
  return `0x${addressHex}` as Address;
}

export function isEvmAddress(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(v.trim());
}

export function normalizeEvmAddress(v: unknown): string {
  if (typeof v !== 'string') throw new Error(`Invalid address: ${String(v)}`);
  const s = v.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(s)) throw new Error(`Invalid address: ${v}`);
  return s;
}

export function normalizeHex32(v: unknown, name: string): Hex | undefined {
  if (v == null) return undefined;
  if (typeof v !== 'string') throw new Error(`${name} must be a hex string`);
  const s = v.trim().toLowerCase();
  if (s.length === 0) return undefined;
  if (!/^0x[0-9a-f]{64}$/.test(s)) throw new Error(`${name} must be a 32-byte hex string`);
  return s as Hex;
}

export function isAbsoluteUri(u: unknown): u is string {
  if (typeof u !== 'string') return false;
  try {
    const url = new URL(u);
    return !!url.protocol && !!url.hostname;
  } catch {
    return false;
  }
}

