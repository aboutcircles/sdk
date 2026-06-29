import { describe, test, expect, afterEach } from 'bun:test';
import type { Address } from '@aboutcircles/sdk-types';
import { CirclesRpc } from '../rpc.js';
import { checksumAddress } from '../utils.js';

const AVATAR_LOWER = '0x112b5cee910a077e4bd28ec158e35653b3ac2350';
const AVATAR_MIXED = checksumAddress(AVATAR_LOWER as Address); // valid EIP-55, exercises param normalization
const AVATAR_CHECKSUMMED = checksumAddress(AVATAR_LOWER as Address);
const GROUP_LOWER = '0xde6c6ecb280c6fa535000f2d5bbb8dfdf460d161';
const GROUP_CHECKSUMMED = checksumAddress(GROUP_LOWER as Address);

interface CapturedRequest {
  method: string;
  params: unknown[];
}

/** Stub fetch to capture the JSON-RPC request and return a canned `result`. */
function stubRpc(result: unknown): { captured: CapturedRequest[]; restore: () => void } {
  const orig = globalThis.fetch;
  const captured: CapturedRequest[] = [];
  globalThis.fetch = (async (_input: unknown, init?: { body?: unknown }) => {
    const body = JSON.parse(String(init?.body ?? '{}'));
    captured.push({ method: body.method, params: body.params });
    return { ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id: body.id, result }) };
  }) as unknown as typeof fetch;
  return { captured, restore: () => { globalThis.fetch = orig; } };
}

describe('AffiliateMethods', () => {
  let restore: (() => void) | undefined;
  afterEach(() => restore?.());

  const rpc = new CirclesRpc('http://localhost:9999/');

  test('getAffiliateGroupWishlist lowercases the avatar param and checksums group addresses', async () => {
    const stub = stubRpc({
      totalFeePercentage: 99,
      groups: [{ groupName: 'New Dummy Group', groupAddress: GROUP_LOWER, membershipFee: 99, timestamp: 1782464475 }],
    });
    restore = stub.restore;

    const res = await rpc.affiliate.getAffiliateGroupWishlist(AVATAR_MIXED);

    expect(stub.captured[0].method).toBe('circles_getAffiliateGroupWishlist');
    expect(stub.captured[0].params).toEqual([AVATAR_LOWER]);
    expect(res.totalFeePercentage).toBe(99);
    expect(res.groups[0].groupAddress).toBe(GROUP_CHECKSUMMED);
    expect(res.groups[0].membershipFee).toBe(99);
    expect(res.groups[0].groupName).toBe('New Dummy Group');
  });

  test('getAffiliateGroups routes to the trusted-subset method', async () => {
    const stub = stubRpc({ totalFeePercentage: 0, groups: [] });
    restore = stub.restore;

    const res = await rpc.affiliate.getAffiliateGroups(AVATAR_MIXED);

    expect(stub.captured[0].method).toBe('circles_getAffiliateGroups');
    expect(res.groups).toEqual([]);
    expect(res.totalFeePercentage).toBe(0);
  });

  test('getAffiliateGroupFeesPercentage unwraps the totalFeePercentage number', async () => {
    const stub = stubRpc({ totalFeePercentage: 42 });
    restore = stub.restore;

    expect(await rpc.affiliate.getAffiliateGroupFeesPercentage(AVATAR_MIXED)).toBe(42);
    expect(stub.captured[0].method).toBe('circles_getAffiliateGroupFeesPercentage');
  });

  test('getAffiliateGroupFeesPercentage treats a null/absent total as 0', async () => {
    const stub = stubRpc(null);
    restore = stub.restore;
    expect(await rpc.affiliate.getAffiliateGroupFeesPercentage(AVATAR_MIXED)).toBe(0);
  });

  test('getAffiliateGroupMembersWishlist passes [group, limit, cursor] and checksums avatars', async () => {
    const stub = stubRpc({
      results: [{ avatarName: 'Charles', avatarAddress: AVATAR_LOWER, timestamp: 1782468390 }],
      hasMore: true,
      nextCursor: 'eyJiIjo0Njg5',
    });
    restore = stub.restore;

    const res = await rpc.affiliate.getAffiliateGroupMembersWishlist(GROUP_CHECKSUMMED as Address, 50, null);

    expect(stub.captured[0].method).toBe('circles_getAffiliateGroupMembersWishlist');
    expect(stub.captured[0].params).toEqual([GROUP_LOWER, 50, null]);
    expect(res.hasMore).toBe(true);
    expect(res.nextCursor).toBe('eyJiIjo0Njg5');
    expect(res.results[0].avatarAddress).toBe(AVATAR_CHECKSUMMED);
  });

  test('getAffiliateGroupMembers defaults limit to 100 and cursor to null', async () => {
    const stub = stubRpc({ results: [], hasMore: false, nextCursor: null });
    restore = stub.restore;

    await rpc.affiliate.getAffiliateGroupMembers(GROUP_CHECKSUMMED as Address);

    expect(stub.captured[0].method).toBe('circles_getAffiliateGroupMembers');
    expect(stub.captured[0].params).toEqual([GROUP_LOWER, 100, null]);
  });
});
