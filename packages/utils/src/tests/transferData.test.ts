import { describe, test, expect } from 'bun:test';
import { encodeCrcV2TransferData, decodeCrcV2TransferData } from '../transferData';
import type { DecodedMetadataPayload, DecodedAbiPayload } from '../transferData';

// ============================================================================
// Type 0x0001 — UTF-8 Text
// ============================================================================

describe('Type 0x0001 — UTF-8 text', () => {
  test('encodes "Hi"', () => {
    const result = encodeCrcV2TransferData(['Hi'], 0x0001);
    expect(result as string).toBe('0x010001000248' + '69');
  });

  test('encodes "Happy Birthday 🎂"', () => {
    const result = encodeCrcV2TransferData(['Happy Birthday 🎂'], 0x0001);
    expect(result as string).toBe('0x0100010013486170707920426972746864617920F09F8E82'.toLowerCase());
  });

  test('round-trips simple text', () => {
    const text = 'Thanks for the lunch! 🍣';
    const encoded = encodeCrcV2TransferData([text], 0x0001);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.type).toBe(0x0001);
    expect(decoded.payload).toBe(text);
    expect(decoded.length).toBe(new TextEncoder().encode(text).length);
  });

  test('round-trips empty string', () => {
    const encoded = encodeCrcV2TransferData([''], 0x0001);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.payload).toBe('');
    expect(decoded.length).toBe(0);
  });

  test('round-trips multi-line text', () => {
    const text = 'Line 1\nLine 2\nLine 3';
    const encoded = encodeCrcV2TransferData([text], 0x0001);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.payload).toBe(text);
  });
});

// ============================================================================
// Type 0x0002 — Raw 32-byte hex (XMTP message ID)
// ============================================================================

describe('Type 0x0002 — Raw 32-byte hex', () => {
  const xmtpId = '0x69236a76eff7f05583e6fa5810cf6b24100f0e9132e0787594a790b2fea254ec';

  test('encodes XMTP message ID', () => {
    const result = encodeCrcV2TransferData([xmtpId], 0x0002);
    expect(result).toBe('0x010002002069236a76eff7f05583e6fa5810cf6b24100f0e9132e0787594a790b2fea254ec');
  });

  test('round-trips XMTP message ID', () => {
    const encoded = encodeCrcV2TransferData([xmtpId], 0x0002);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.type).toBe(0x0002);
    expect(decoded.length).toBe(32);
    expect((decoded.payload as string).toLowerCase()).toBe(xmtpId.toLowerCase());
  });

  test('accepts hex without 0x prefix', () => {
    const raw = '69236a76eff7f05583e6fa5810cf6b24100f0e9132e0787594a790b2fea254ec';
    const encoded = encodeCrcV2TransferData([raw], 0x0002);
    const decoded = decodeCrcV2TransferData(encoded);
    expect((decoded.payload as string).slice(2)).toBe(raw);
  });

  test('throws for wrong byte length', () => {
    expect(() => encodeCrcV2TransferData(['0xdeadbeef'], 0x0002)).toThrow();
  });
});

// ============================================================================
// Type 0x0003 — IPFS CID
// ============================================================================

describe('Type 0x0003 — IPFS CID', () => {
  const cidV0 = 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx';

  test('encodes CIDv0', () => {
    const result = encodeCrcV2TransferData([cidV0], 0x0003);
    expect(result).toMatch(/^0x01000300/);
  });

  test('round-trips CIDv0 back to CIDv0 string (dag-pb + sha256)', () => {
    const encoded = encodeCrcV2TransferData([cidV0], 0x0003);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.type).toBe(0x0003);
    expect(decoded.payload).toBe(cidV0);
  });

  test('round-trips CIDv1 string', () => {
    // CIDv1 base32 (dag-pb + sha256, same content as CIDv0 above)
    const cidV1 = 'bafybeie7m2fsbt6sjtn7tymyb6sim7iiyz6szl4ethtn7anzx4frzfzipu';
    const encoded = encodeCrcV2TransferData([cidV1], 0x0003);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.type).toBe(0x0003);
    // dag-pb + sha256 CIDv1 should decode back to CIDv0
    expect(decoded.payload).toBe(cidV0);
  });

  test('encodes and decodes produce consistent length', () => {
    const encoded = encodeCrcV2TransferData([cidV0], 0x0003);
    const decoded = decodeCrcV2TransferData(encoded);
    // CIDv1 hex for dag-pb sha256 = 36 bytes (1 version + 1 codec + 2 multihash header + 32 digest)
    expect(decoded.length).toBe(36);
  });
});

// ============================================================================
// Type 0x1001 — UTF-8 text with metadata
// ============================================================================

describe('Type 0x1001 — UTF-8 text with metadata', () => {
  test('encodes message + metadata', () => {
    const encoded = encodeCrcV2TransferData(['Happy Birthday', 'https://app.gnosis.io'], 0x1001);
    const hex = encoded.slice(2);
    // Header starts with version=01, type=1001
    expect(hex.slice(0, 2)).toBe('01');
    expect(hex.slice(2, 6)).toBe('1001');
    // Contains separator 480a868a
    expect(hex).toContain('480a868a');
  });

  test('round-trips message + metadata', () => {
    const message = 'Happy Birthday';
    const metadata = 'https://app.gnosis.io';
    const encoded = encodeCrcV2TransferData([message, metadata], 0x1001);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.type).toBe(0x1001);
    const p = decoded.payload as DecodedMetadataPayload;
    expect(p.message).toBe(message);
    expect(p.metadata).toBe(metadata);
  });

  test('length equals message + separator + metadata byte count', () => {
    const message = 'Hello';
    const metadata = 'order:123';
    const encoded = encodeCrcV2TransferData([message, metadata], 0x1001);
    const decoded = decodeCrcV2TransferData(encoded);
    const messageBytes = new TextEncoder().encode(message).length;
    const metadataBytes = new TextEncoder().encode(metadata).length;
    // 4 bytes for the separator
    expect(decoded.length).toBe(messageBytes + 4 + metadataBytes);
  });

  test('round-trips with emoji in message and metadata', () => {
    const message = 'Thanks! 🎉';
    const metadata = 'app:circles:tag=gift 🎁';
    const encoded = encodeCrcV2TransferData([message, metadata], 0x1001);
    const decoded = decodeCrcV2TransferData(encoded);
    const p = decoded.payload as DecodedMetadataPayload;
    expect(p.message).toBe(message);
    expect(p.metadata).toBe(metadata);
  });

  test('throws on decode if separator is missing', () => {
    // Manually craft a 0x1001 payload without the separator
    const fakePayloadHex = '48656c6c6f'; // "Hello" without separator
    const length = fakePayloadHex.length / 2;
    const hex = '0x' + '01' + '1001' + length.toString(16).padStart(4, '0') + fakePayloadHex;
    expect(() => decodeCrcV2TransferData(hex)).toThrow(/separator/i);
  });
});

// ============================================================================
// Type 0x0004 — ABI-encoded calldata
// ============================================================================

describe('Type 0x0004 — ABI-encoded calldata', () => {
  const signature = 'transfer(address,uint256)';
  const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const amount = 1000000000000000000n;

  const expectedSelector = 'a9059cbb';
  const expectedEncodedAddress = '000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e';
  const expectedEncodedAmount = '0000000000000000000000000000000000000000000000000de0b6b3a7640000';

  test('encodes from function signature + params', () => {
    const result = encodeCrcV2TransferData([signature, address, amount], 0x0004);
    const hex = result.slice(2);
    // Header: 01 0004 0044
    expect(hex.slice(0, 10)).toBe('0100040044');
    // Selector
    expect(hex.slice(10, 18)).toBe(expectedSelector);
    // Encoded address
    expect(hex.slice(18, 18 + 64)).toBe(expectedEncodedAddress);
    // Encoded amount
    expect(hex.slice(18 + 64, 18 + 128)).toBe(expectedEncodedAmount);
  });

  test('encodes from pre-encoded calldata (single element)', () => {
    const rawCalldata = `0x${expectedSelector}${expectedEncodedAddress}${expectedEncodedAmount}`;
    const result = encodeCrcV2TransferData([rawCalldata], 0x0004);
    const hex = result.slice(2);
    expect(hex.slice(0, 10)).toBe('0100040044');
    expect(hex.slice(10, 18)).toBe(expectedSelector);
  });

  test('decodes known selector with resolved signature and params', () => {
    const encoded = encodeCrcV2TransferData([signature, address, amount], 0x0004);
    const decoded = decodeCrcV2TransferData(encoded);
    expect(decoded.type).toBe(0x0004);
    expect(decoded.length).toBe(68); // 4 selector + 32 + 32
    const p = decoded.payload as DecodedAbiPayload;
    expect(p.selector).toBe(`0x${expectedSelector}`);
    expect(p.signature).toBe(signature);
    expect(p.params.length).toBe(2);
    // address param (lowercased with checksum)
    expect((p.params[0] as string).toLowerCase()).toBe(address.toLowerCase());
    // uint256 param
    expect(p.params[1]).toBe(amount);
  });

  test('decodes raw calldata with known selector', () => {
    const rawCalldata = `0x${expectedSelector}${expectedEncodedAddress}${expectedEncodedAmount}`;
    const encoded = encodeCrcV2TransferData([rawCalldata], 0x0004);
    const decoded = decodeCrcV2TransferData(encoded);
    const p = decoded.payload as DecodedAbiPayload;
    expect(p.selector).toBe(`0x${expectedSelector}`);
    expect(p.signature).toBe(signature);
    expect(p.params.length).toBe(2);
  });

  test('returns raw data for unknown selector', () => {
    // Craft calldata with a selector not in the lookup table
    // Use 8 zeros padded — extremely unlikely to be a real function
    const unknownSelector = 'ffffffff';
    const fakePayload = unknownSelector + expectedEncodedAddress;
    const encoded = encodeCrcV2TransferData([`0x${fakePayload}`], 0x0004);
    const decoded = decodeCrcV2TransferData(encoded);
    // Unknown selector — payload is raw hex string
    expect(typeof decoded.payload).toBe('string');
    expect(decoded.payload).toBe(`0x${fakePayload}`);
  });

  test('throws for invalid signature', () => {
    expect(() => encodeCrcV2TransferData(['notASignature', address], 0x0004)).toThrow();
  });
});

// ============================================================================
// Version handling
// ============================================================================

describe('Version handling', () => {
  test('default version is 0x01', () => {
    const encoded = encodeCrcV2TransferData(['test'], 0x0001);
    expect(encoded.slice(2, 4)).toBe('01');
  });

  test('throws on version mismatch when decoding', () => {
    const encoded = encodeCrcV2TransferData(['test'], 0x0001, 0x01);
    expect(() => decodeCrcV2TransferData(encoded, 0x02)).toThrow(/version/i);
  });
});

// ============================================================================
// Error cases
// ============================================================================

describe('Error cases', () => {
  test('throws for unsupported type in encode', () => {
    expect(() => encodeCrcV2TransferData(['foo'], 0x9999 as any)).toThrow();
  });

  test('throws for unsupported type in decode', () => {
    // Manually craft an encoded payload with type 0x9999
    const hex = '0x01999900020000';
    expect(() => decodeCrcV2TransferData(hex)).toThrow();
  });

  test('throws for data too short to decode', () => {
    expect(() => decodeCrcV2TransferData('0x0100')).toThrow(/too short/i);
  });

  test('throws for payload length mismatch', () => {
    // Header says length=10 but no payload follows
    const hex = '0x' + '01' + '0001' + '000a'; // 5 header bytes, claims 10 payload bytes
    expect(() => decodeCrcV2TransferData(hex)).toThrow(/mismatch/i);
  });
});