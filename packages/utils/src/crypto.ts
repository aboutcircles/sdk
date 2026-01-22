import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import type { Address, Hex } from '@aboutcircles/sdk-types';
import { checksumAddress } from './abi';

/**
 * Generate a random private key (32 bytes / 64 hex chars)
 * @returns Private key as hex string with 0x prefix
 */
export function generatePrivateKey(): Hex {
  const privateKeyBytes = secp256k1.utils.randomPrivateKey();
  return ('0x' + Buffer.from(privateKeyBytes).toString('hex')) as Hex;
}

/**
 * Derive Ethereum address from private key
 * @param privateKey - Private key as hex string (with or without 0x prefix)
 * @returns Checksummed Ethereum address
 */
export function privateKeyToAddress(privateKey: string): Address {
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const keyBytes = Buffer.from(cleanKey, 'hex');

  // Get uncompressed public key (65 bytes: 0x04 + 64 bytes)
  const publicKey = secp256k1.getPublicKey(keyBytes, false);

  // Hash the public key (excluding the 0x04 prefix byte)
  const hash = keccak_256(publicKey.slice(1));

  // Take last 20 bytes as address
  const addressBytes = hash.slice(-20);
  const address = '0x' + Buffer.from(addressBytes).toString('hex');

  return checksumAddress(address) as Address;
}

/**
 * Calculate keccak256 hash of data
 * @param data - Hex string or Uint8Array to hash
 * @returns Hash as hex string with 0x prefix
 */
export function keccak256(data: Hex | Uint8Array): Hex {
  let bytes: Uint8Array;

  if (typeof data === 'string') {
    const cleanData = data.startsWith('0x') ? data.slice(2) : data;
    bytes = Buffer.from(cleanData, 'hex');
  } else {
    bytes = data;
  }

  const hash = keccak_256(bytes);
  return ('0x' + Buffer.from(hash).toString('hex')) as Hex;
}
