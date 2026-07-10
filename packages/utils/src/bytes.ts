// Pre-computed lookup table for byte-to-hex conversion
const byteToHex: string[] = [];
for (let i = 0; i < 256; i++) {
  byteToHex[i] = i.toString(16).padStart(2, '0');
}

/**
 * Convert a Uint8Array to a hex string with 0x prefix
 */
export function bytesToHex(bytes: Uint8Array): string {
  let hex = '0x';
  for (let i = 0; i < bytes.length; i++) {
    hex += byteToHex[bytes[i]];
  }
  return hex;
}

/**
 * Convert a hex string (with or without 0x prefix) to a Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);

  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
  }

  return bytes;
}
