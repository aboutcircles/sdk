import { describe, test, expect, afterEach } from 'bun:test';
import { decodeAbiParameters } from '@aboutcircles/sdk-utils';
import { AFFILIATE_GROUP_NONE_SENTINEL, ZERO_ADDRESS } from '@aboutcircles/sdk-utils';
import type { Address } from '@aboutcircles/sdk-types';
import { AffiliateGroupRegistryContract } from '../affiliateGroupRegistry.js';

const REGISTRY = '0xca8222e780d046707083f51377B5Fd85E2866014' as Address;
const HUMAN = '0x4d825a98ee3e4801e39f2de6dd16184de2285ce4' as Address;
const GROUP = '0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c' as Address;
const SETTER_SELECTOR = '0xbaa3440f'; // setAffiliateGroup(address)

/** Decode the single `address` argument from setAffiliateGroup calldata. */
function decodeGroupArg(data: string): Address {
  const [group] = decodeAbiParameters(['address'], ('0x' + data.slice(10)) as `0x${string}`) as [Address];
  return group;
}

/** Mock the next eth_call to return an ABI-encoded address. */
function mockReadOnce(returnAddress: Address) {
  const orig = globalThis.fetch;
  const padded = '0x' + returnAddress.toLowerCase().replace('0x', '').padStart(64, '0');
  globalThis.fetch = (async (_input: unknown, init?: { body?: unknown }) => {
    const body = JSON.parse(String(init?.body ?? '{}'));
    return { ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id: body.id, result: padded }) };
  }) as unknown as typeof fetch;
  return () => {
    globalThis.fetch = orig;
  };
}

describe('AffiliateGroupRegistryContract — zero/sentinel mapping', () => {
  let restore: (() => void) | undefined;
  afterEach(() => restore?.());

  const reg = new AffiliateGroupRegistryContract({ address: REGISTRY, rpcUrl: 'http://localhost:9999/' });

  test('setAffiliateGroup(zero) substitutes the sentinel group', () => {
    const tx = reg.setAffiliateGroup(ZERO_ADDRESS);
    expect(tx.to?.toLowerCase()).toBe(REGISTRY.toLowerCase());
    expect((tx.data as string).slice(0, 10)).toBe(SETTER_SELECTOR);
    expect(decodeGroupArg(tx.data as string).toLowerCase()).toBe(AFFILIATE_GROUP_NONE_SENTINEL.toLowerCase());
  });

  test('setAffiliateGroup(realGroup) passes the group through unchanged', () => {
    const tx = reg.setAffiliateGroup(GROUP);
    expect(decodeGroupArg(tx.data as string).toLowerCase()).toBe(GROUP.toLowerCase());
  });

  test('affiliateGroup returns zero when the registry holds the sentinel', async () => {
    restore = mockReadOnce(AFFILIATE_GROUP_NONE_SENTINEL);
    const result = await reg.affiliateGroup(HUMAN);
    expect(result.toLowerCase()).toBe(ZERO_ADDRESS);
  });

  test('affiliateGroup returns the real group unchanged', async () => {
    restore = mockReadOnce(GROUP);
    const result = await reg.affiliateGroup(HUMAN);
    expect(result.toLowerCase()).toBe(GROUP.toLowerCase());
  });

  test('affiliateGroup returns zero when the registry holds nothing', async () => {
    restore = mockReadOnce(ZERO_ADDRESS as Address);
    const result = await reg.affiliateGroup(HUMAN);
    expect(result.toLowerCase()).toBe(ZERO_ADDRESS);
  });
});
