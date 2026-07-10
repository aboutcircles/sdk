import { describe, test, expect } from 'bun:test';
import { checksumAddress } from '../abi.js';

describe('checksumAddress', () => {
  test('checksums lowercase address correctly', () => {
    const lowercase = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
    const expected = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    expect(checksumAddress(lowercase)).toBe(expected);
  });

  test('checksums uppercase address correctly', () => {
    const uppercase = '0X5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED';
    const expected = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    expect(checksumAddress(uppercase)).toBe(expected);
  });

  test('checksums mixed case address correctly', () => {
    const mixedCase = '0x5aAeB6053f3E94c9b9a09F33669435e7Ef1beAED';
    const expected = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    expect(checksumAddress(mixedCase)).toBe(expected);
  });

  test('handles address without 0x prefix', () => {
    const withoutPrefix = '5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
    const expected = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    expect(checksumAddress(withoutPrefix)).toBe(expected);
  });

  test('checksums all-zero address', () => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const expected = '0x0000000000000000000000000000000000000000';

    expect(checksumAddress(zeroAddress)).toBe(expected);
  });

  test('checksums real Ethereum addresses correctly', () => {
    // Real addresses with known checksums
    const testCases = [
      {
        input: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
        expected: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      },
      {
        input: '0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb',
        expected: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      },
      {
        input: '0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb',
        expected: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      },
      {
        input: '0xc7d3df890952a327af94d5ba6fdc1bf145188a1b',
        expected: '0xc7d3dF890952a327Af94D5Ba6fdC1Bf145188a1b',
      },
      {
        input: '0xcbdf2a2b2c7417ce9f10943d44d590058418ac00',
        expected: '0xCbdf2A2b2C7417CE9f10943d44D590058418Ac00',
      },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(checksumAddress(input)).toBe(expected);
    });
  });

  test('is idempotent - checksumming a checksummed address returns the same', () => {
    const checksummed = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    expect(checksumAddress(checksummed)).toBe(checksummed);
    expect(checksumAddress(checksumAddress(checksummed))).toBe(checksummed);
  });

  test('handles addresses from contract deployments', () => {
    // Common contract addresses
    const contracts = [
      {
        input: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        expected: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      {
        input: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
        expected: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
    ];

    contracts.forEach(({ input, expected }) => {
      expect(checksumAddress(input)).toBe(expected);
    });
  });

  test('validates EIP-55 checksumming algorithm', () => {
    // Test vectors from EIP-55
    const eip55TestVectors = [
      '0x52908400098527886E0F7030069857D2E4169EE7',
      '0x8617E340B3D01FA5F11F306F4090FD50E238070D',
      '0xde709f2102306220921060314715629080e2fb77',
      '0x27b1fdb04752bbc536007a920d24acb045561c26',
    ];

    eip55TestVectors.forEach((address) => {
      // These addresses are already checksummed according to EIP-55
      // So checksumming them should return the same address
      const result = checksumAddress(address.toLowerCase());
      expect(result).toBe(address);
    });
  });
});
