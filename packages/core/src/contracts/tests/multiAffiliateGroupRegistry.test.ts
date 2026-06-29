import { describe, test, expect, afterEach } from 'bun:test';
import { decodeAbiParameters, decodeErrorResult } from '@aboutcircles/sdk-utils';
import { AFFILIATE_GROUP_LIST_SENTINEL, ZERO_ADDRESS } from '@aboutcircles/sdk-utils';
import type { Address } from '@aboutcircles/sdk-types';
import { multiAffiliateGroupRegistryAbi } from '@aboutcircles/sdk-abis';
import { MultiAffiliateGroupRegistryContract } from '../multiAffiliateGroupRegistry.js';

const REGISTRY = '0x4a25a7cf216351963f1637ad965d77b3ae277ef3' as Address;
const AVATAR = '0x112b5cee910a077e4bd28ec158e35653b3ac2350' as Address;
const GROUP_A = '0xde6c6ecb280c6fa535000f2d5bbb8dfdf460d161' as Address;
const GROUP_B = '0x86533d1ada8ffbe7b6f7244f9a1b707f7f3e239b' as Address;
const ADD_SELECTOR = '0x812999c5'; // addAffiliateGroup(address)
const REMOVE_SELECTOR = '0x4b528ae5'; // removeAffiliateGroup(address)

/** Decode the single `address` argument from add/remove calldata. */
function decodeGroupArg(data: string): Address {
  const [group] = decodeAbiParameters(['address'], ('0x' + data.slice(10)) as `0x${string}`) as [Address];
  return group;
}

/** Left-pad an address to a 32-byte ABI word (no 0x prefix). */
function word(address: Address): string {
  return address.toLowerCase().replace('0x', '').padStart(64, '0');
}

/** Mock the next N eth_calls to return the given ABI-encoded addresses, in order. */
function mockReadSequence(returns: Address[]) {
  const orig = globalThis.fetch;
  let i = 0;
  globalThis.fetch = (async (_input: unknown, init?: { body?: unknown }) => {
    const body = JSON.parse(String(init?.body ?? '{}'));
    const next = returns[Math.min(i, returns.length - 1)];
    i++;
    return { ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id: body.id, result: '0x' + word(next) }) };
  }) as unknown as typeof fetch;
  return () => {
    globalThis.fetch = orig;
  };
}

describe('MultiAffiliateGroupRegistryContract — calldata', () => {
  const reg = new MultiAffiliateGroupRegistryContract({ address: REGISTRY, rpcUrl: 'http://localhost:9999/' });

  test('addAffiliateGroup encodes the right selector + group arg, zero value, registry target', () => {
    const tx = reg.addAffiliateGroup(GROUP_A);
    expect(tx.to?.toLowerCase()).toBe(REGISTRY.toLowerCase());
    expect(tx.value).toBe(0n);
    expect((tx.data as string).slice(0, 10)).toBe(ADD_SELECTOR);
    expect(decodeGroupArg(tx.data as string).toLowerCase()).toBe(GROUP_A.toLowerCase());
  });

  test('removeAffiliateGroup encodes the right selector + group arg', () => {
    const tx = reg.removeAffiliateGroup(GROUP_B);
    expect((tx.data as string).slice(0, 10)).toBe(REMOVE_SELECTOR);
    expect(decodeGroupArg(tx.data as string).toLowerCase()).toBe(GROUP_B.toLowerCase());
  });
});

describe('MultiAffiliateGroupRegistryContract — reads', () => {
  let restore: (() => void) | undefined;
  afterEach(() => restore?.());

  const reg = new MultiAffiliateGroupRegistryContract({ address: REGISTRY, rpcUrl: 'http://localhost:9999/' });

  test('isAffiliated is true when the list successor is non-zero', async () => {
    restore = mockReadSequence([AFFILIATE_GROUP_LIST_SENTINEL]); // non-zero successor → present
    expect(await reg.isAffiliated(AVATAR, GROUP_A)).toBe(true);
  });

  test('isAffiliated is false when the list successor is the zero default', async () => {
    restore = mockReadSequence([ZERO_ADDRESS as Address]);
    expect(await reg.isAffiliated(AVATAR, GROUP_A)).toBe(false);
  });

  test('affiliateGroups walks the linked list head→tail, most-recent first', async () => {
    // head = GROUP_A → next(GROUP_A) = GROUP_B → next(GROUP_B) = SENTINEL (stop).
    // read() decodes addresses to EIP-55 checksum, so compare case-insensitively.
    restore = mockReadSequence([GROUP_A, GROUP_B, AFFILIATE_GROUP_LIST_SENTINEL]);
    const walked = await reg.affiliateGroups(AVATAR);
    expect(walked.map((g) => g.toLowerCase())).toEqual([GROUP_A.toLowerCase(), GROUP_B.toLowerCase()]);
  });

  test('affiliateGroups returns [] for an empty list (head == 0)', async () => {
    restore = mockReadSequence([ZERO_ADDRESS as Address]);
    expect(await reg.affiliateGroups(AVATAR)).toEqual([]);
  });
});

describe('MultiAffiliateGroupRegistryContract — ABI carries the custom errors', () => {
  test('decodes AffiliateGroupNotExist(group) revert data', () => {
    const data = '0x6fdbf075' + word(GROUP_A);
    const decoded = decodeErrorResult({ abi: multiAffiliateGroupRegistryAbi as unknown as never, data });
    expect(decoded?.errorName).toBe('AffiliateGroupNotExist');
    expect((decoded?.args?.[0] as string)?.toLowerCase()).toBe(GROUP_A.toLowerCase());
  });

  test('decodes the no-arg OnlyHuman revert data', () => {
    const decoded = decodeErrorResult({ abi: multiAffiliateGroupRegistryAbi as unknown as never, data: '0x9aa42e72' });
    expect(decoded?.errorName).toBe('OnlyHuman');
  });
});
