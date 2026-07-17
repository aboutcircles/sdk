import { describe, test, expect, afterEach } from 'bun:test';
import type { Address } from '@aboutcircles/sdk-types';
import { CirclesRpc } from '../rpc.js';
import { checksumAddress } from '../utils.js';

const AVATAR_LOWER = '0x112b5cee910a077e4bd28ec158e35653b3ac2350';
const AVATAR_MIXED = checksumAddress(AVATAR_LOWER as Address); // valid EIP-55, exercises param normalization
const AVATAR_CHECKSUMMED = checksumAddress(AVATAR_LOWER as Address);
const COMMUNITY_LOWER = '0xde6c6ecb280c6fa535000f2d5bbb8dfdf460d161';
const COMMUNITY_CHECKSUMMED = checksumAddress(COMMUNITY_LOWER as Address);

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

describe('CommunityMethods', () => {
  let restore: (() => void) | undefined;
  afterEach(() => restore?.());

  const rpc = new CirclesRpc('http://localhost:9999/');

  test('getAvatarCommunitiesWishlist lowercases the avatar param and checksums community addresses', async () => {
    const stub = stubRpc({
      totalFeePercentage: 99,
      communities: [{ communityName: 'New Dummy Group', communityAddress: COMMUNITY_LOWER, membershipFee: 99, timestamp: 1782464475 }],
    });
    restore = stub.restore;

    const res = await rpc.communities.getAvatarCommunitiesWishlist(AVATAR_MIXED);

    expect(stub.captured[0].method).toBe('circles_getAvatarCommunitiesWishlist');
    expect(stub.captured[0].params).toEqual([AVATAR_LOWER]);
    expect(res.totalFeePercentage).toBe(99);
    expect(res.communities[0].communityAddress).toBe(COMMUNITY_CHECKSUMMED);
    expect(res.communities[0].membershipFee).toBe(99);
    expect(res.communities[0].communityName).toBe('New Dummy Group');
  });

  test('getAvatarCommunities routes to the trusted-subset method', async () => {
    const stub = stubRpc({ totalFeePercentage: 0, communities: [] });
    restore = stub.restore;

    const res = await rpc.communities.getAvatarCommunities(AVATAR_MIXED);

    expect(stub.captured[0].method).toBe('circles_getAvatarCommunities');
    expect(res.communities).toEqual([]);
    expect(res.totalFeePercentage).toBe(0);
  });

  test('getAvatarCommunityFeesPercentage unwraps the totalFeePercentage number', async () => {
    const stub = stubRpc({ totalFeePercentage: 42 });
    restore = stub.restore;

    expect(await rpc.communities.getAvatarCommunityFeesPercentage(AVATAR_MIXED)).toBe(42);
    expect(stub.captured[0].method).toBe('circles_getAvatarCommunityFeesPercentage');
  });

  test('getAvatarCommunityFeesPercentage treats a null/absent total as 0', async () => {
    const stub = stubRpc(null);
    restore = stub.restore;
    expect(await rpc.communities.getAvatarCommunityFeesPercentage(AVATAR_MIXED)).toBe(0);
  });

  test('getCommunityMembersWishlist passes [community, limit, cursor] and checksums avatars', async () => {
    const stub = stubRpc({
      results: [{ avatarName: 'Charles', avatarAddress: AVATAR_LOWER, timestamp: 1782468390 }],
      hasMore: true,
      nextCursor: 'eyJiIjo0Njg5',
    });
    restore = stub.restore;

    const res = await rpc.communities.getCommunityMembersWishlist(COMMUNITY_CHECKSUMMED as Address, 50, null);

    expect(stub.captured[0].method).toBe('circles_getCommunityMembersWishlist');
    expect(stub.captured[0].params).toEqual([COMMUNITY_LOWER, 50, null]);
    expect(res.hasMore).toBe(true);
    expect(res.nextCursor).toBe('eyJiIjo0Njg5');
    expect(res.results[0].avatarAddress).toBe(AVATAR_CHECKSUMMED);
  });

  test('getCommunityMembers defaults limit to 100 and cursor to null', async () => {
    const stub = stubRpc({ results: [], hasMore: false, nextCursor: null });
    restore = stub.restore;

    await rpc.communities.getCommunityMembers(COMMUNITY_CHECKSUMMED as Address);

    expect(stub.captured[0].method).toBe('circles_getCommunityMembers');
    expect(stub.captured[0].params).toEqual([COMMUNITY_LOWER, 100, null]);
  });
});
