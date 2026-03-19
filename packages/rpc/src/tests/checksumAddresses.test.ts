import { describe, test, expect } from 'bun:test';
import { checksumAddresses, normalizeAddress, checksumAddress } from '../utils.js';
import type { Address } from '@aboutcircles/sdk-types';

describe('normalizeAddress', () => {
  test('normalizes checksummed address to lowercase', () => {
    const checksummed = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed' as Address;
    const expected = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';

    expect(normalizeAddress(checksummed)).toBe(expected);
  });

  test('keeps lowercase address as is', () => {
    const lowercase = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed' as Address;

    expect(normalizeAddress(lowercase)).toBe(lowercase);
  });

  test('normalizes uppercase address to lowercase', () => {
    const uppercase = '0X5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED' as Address;
    const expected = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';

    expect(normalizeAddress(uppercase)).toBe(expected);
  });
});

describe('checksumAddress', () => {
  test('checksums lowercase address', () => {
    const lowercase = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed' as Address;
    const result = checksumAddress(lowercase);

    // Result should have mixed case
    expect(result).not.toBe(lowercase);
    expect(result.toLowerCase()).toBe(lowercase);
    expect(result).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
  });
});

describe('checksumAddresses', () => {
  test('checksums a single address string', () => {
    const address = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
    const result = checksumAddresses(address);

    expect(result).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
  });

  test('checksums addresses in an array', () => {
    const addresses = [
      '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
    ];

    const result = checksumAddresses(addresses);

    expect(result).toEqual([
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    ]);
  });

  test('checksums addresses in object properties', () => {
    const data = {
      tokenAddress: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      tokenOwner: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
      balance: 1000n,
    };

    const result = checksumAddresses(data);

    expect(result).toEqual({
      tokenAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      tokenOwner: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      balance: 1000n,
    });
  });

  test('checksums addresses in nested objects', () => {
    const data = {
      avatar: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      tokens: [
        {
          tokenAddress: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
          amount: 100,
        },
        {
          tokenAddress: '0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb',
          amount: 200,
        },
      ],
    };

    const result = checksumAddresses(data);

    expect(result).toEqual({
      avatar: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      tokens: [
        {
          tokenAddress: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          amount: 100,
        },
        {
          tokenAddress: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
          amount: 200,
        },
      ],
    });
  });

  test('checksums addresses in arrays of objects', () => {
    const data = [
      {
        truster: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
        trustee: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
      },
      {
        truster: '0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb',
        trustee: '0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb',
      },
    ];

    const result = checksumAddresses(data);

    expect(result).toEqual([
      {
        truster: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        trustee: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      },
      {
        truster: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
        trustee: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      },
    ]);
  });

  test('preserves non-address strings', () => {
    const data = {
      address: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      name: 'Test Token',
      symbol: 'TEST',
      description: 'This is not an address: 0x123',
    };

    const result = checksumAddresses(data);

    expect(result).toEqual({
      address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      name: 'Test Token',
      symbol: 'TEST',
      description: 'This is not an address: 0x123', // Short strings are not treated as addresses
    });
  });

  test('handles null and undefined values', () => {
    const data = {
      address: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      optional: null,
      missing: undefined,
    };

    const result = checksumAddresses(data);

    expect(result).toEqual({
      address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      optional: null,
      missing: undefined,
    });
  });

  test('handles mixed types in arrays', () => {
    const data = [
      '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      null,
      { address: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359' },
      'not an address',
      123,
    ];

    const result = checksumAddresses(data);

    expect(result).toEqual([
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      null,
      { address: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359' },
      'not an address',
      123,
    ]);
  });

  test('handles real RPC response structure - TokenBalance', () => {
    const tokenBalances = [
      {
        tokenAddress: '0xfb4e4ca590b0ea4fdcf1d4764b64052dd599c62a',
        tokenOwner: '0xfb4e4ca590b0ea4fdcf1d4764b64052dd599c62a',
        balance: 1115970000000000000000n,
        circles: 1115.97,
      },
      {
        tokenAddress: '0x764e314b52681a4da39b442d399af07ce46632ca',
        tokenOwner: '0x764e314b52681a4da39b442d399af07ce46632ca',
        balance: 770700000000000000000n,
        circles: 770.7,
      },
    ];

    const result = checksumAddresses(tokenBalances);

    expect(result[0].tokenAddress).toBe('0xfB4E4cA590b0ea4fdCF1D4764B64052dD599C62a');
    expect(result[0].tokenOwner).toBe('0xfB4E4cA590b0ea4fdCF1D4764B64052dD599C62a');
    expect(result[0].balance).toBe(1115970000000000000000n);
    expect(result[0].circles).toBe(1115.97);

    expect(result[1].tokenAddress).toBe('0x764E314b52681a4dA39b442d399af07Ce46632Ca');
    expect(result[1].tokenOwner).toBe('0x764E314b52681a4dA39b442d399af07Ce46632Ca');
  });

  test('handles real RPC response structure - TrustRelation', () => {
    const trustRelations = [
      {
        blockNumber: 12345678,
        timestamp: 1697894400,
        truster: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
        trustee: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
        expiryTime: 0,
      },
    ];

    const result = checksumAddresses(trustRelations);

    expect(result[0].truster).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
    expect(result[0].trustee).toBe('0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359');
    expect(result[0].blockNumber).toBe(12345678);
    expect(result[0].timestamp).toBe(1697894400);
  });

  test('handles real RPC response structure - AvatarInfo', () => {
    const avatarInfo = {
      avatar: '0xc7d3df890952a327af94d5ba6fdc1bf145188a1b',
      type: 'CrcV2_RegisterHuman',
      isHuman: true,
      version: 2,
      tokenId: '0xc7d3df890952a327af94d5ba6fdc1bf145188a1b',
      v1Token: '0x05979f0d11641506cdccbd756edcd079c993160a',
    };

    const result = checksumAddresses(avatarInfo);

    expect(result.avatar).toBe('0xc7d3dF890952a327Af94D5Ba6fdC1Bf145188a1b');
    expect(result.tokenId).toBe('0xc7d3dF890952a327Af94D5Ba6fdC1Bf145188a1b');
    expect(result.v1Token).toBe('0x05979F0d11641506cDCCBd756eDCd079c993160A');
    expect(result.isHuman).toBe(true);
    expect(result.version).toBe(2);
  });

  test('handles pathfinding result structure', () => {
    const pathResult = {
      maxFlow: '1000000000000000000',
      transferSteps: [
        {
          from: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
          to: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
          tokenOwner: '0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb',
          value: '500000000000000000',
        },
        {
          from: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
          to: '0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb',
          tokenOwner: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
          value: '500000000000000000',
        },
      ],
    };

    const result = checksumAddresses(pathResult);

    expect(result.transferSteps[0].from).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
    expect(result.transferSteps[0].to).toBe('0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359');
    expect(result.transferSteps[0].tokenOwner).toBe('0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB');
    expect(result.transferSteps[1].to).toBe('0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb');
  });

  test('does not modify input - returns new object', () => {
    const original = {
      address: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      value: 100,
    };

    const result = checksumAddresses(original);

    // Original should not be modified
    expect(original.address).toBe('0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed');
    // Result should have checksummed address
    expect(result.address).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
    // Should be different objects
    expect(result).not.toBe(original);
  });

  test('handles empty inputs', () => {
    expect(checksumAddresses([])).toEqual([]);
    expect(checksumAddresses({})).toEqual({});
    expect(checksumAddresses(null)).toBe(null);
    expect(checksumAddresses(undefined)).toBe(undefined);
  });

  test('detects valid Ethereum addresses only', () => {
    const data = {
      validAddress: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      tooShort: '0x5aaeb6',
      tooLong: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed123',
      noPrefix: '5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
      invalidChars: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaeg',
    };

    const result = checksumAddresses(data);

    // Only validAddress and noPrefix should be checksummed
    expect(result.validAddress).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
    expect(result.tooShort).toBe('0x5aaeb6'); // Not modified - too short
    expect(result.tooLong).toBe('0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed123'); // Not modified - too long
    expect(result.noPrefix).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'); // Checksummed - valid without 0x
    expect(result.invalidChars).toBe('0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaeg'); // Not modified - invalid hex
  });
});
