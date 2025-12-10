import { describe, test, expect } from 'bun:test';
import { CirclesRpc } from '../rpc';
import type { Address } from '@aboutcircles/sdk-types';

const env = ((globalThis as Record<string, unknown>).process as { env?: Record<string, string | undefined> } | undefined)?.env ?? {};
const RPC_URL = env.CIRCLES_RPC_URL ?? 'http://localhost:8081/';
const TEST_AVATAR = (env.CIRCLES_TEST_AVATAR ?? '0xde374ece6fa50e781e81aac78e811b33d16912c7') as Address;
const TEST_TOKEN = (env.CIRCLES_TEST_TOKEN ?? '0x6b69683c8897e3d18e74b1ba117b49f80423da5d') as Address;
const SEARCH_TERM = env.CIRCLES_TEST_SEARCH_TERM ?? 'berlin';
const SEARCH_TYPES = env.CIRCLES_TEST_SEARCH_TYPES?.split(',').map((type: string) => type.trim()).filter(Boolean);
const TEST_TIMEOUT = Number(env.CIRCLES_RPC_TEST_TIMEOUT ?? 45000);

const rpc = new CirclesRpc(RPC_URL);
let rpcReachable = true;

try {
  await rpc.profile.getProfileByAddress(TEST_AVATAR);
} catch (error) {
  rpcReachable = false;
  console.warn(`[circles-rpc] Integration tests skipped - unable to reach ${RPC_URL}: ${(error as Error).message}`);
}

const profileKey = (profile: unknown): string => {
  if (profile && typeof profile === 'object') {
    const record = profile as Record<string, any>;
    const candidate = record.address ?? record.avatar ?? record.owner ?? record.tokenId;
    if (typeof candidate === 'string') {
      return candidate.toLowerCase();
    }
    if (record.cid || record.cidV0) {
      return String(record.cid ?? record.cidV0);
    }
  }
  return JSON.stringify(profile);
};


const integration = rpcReachable ? describe : describe.skip;

integration('Circles RPC live pagination', () => {
  test('group.findGroups stays aligned with legacy PagedQuery ordering', async () => {
    const limit = 5;
    const direct = await rpc.group.findGroups(limit);

    expect(direct.results.length).toBeGreaterThan(0);
    expect(direct.results.length).toBeLessThanOrEqual(limit);

    const legacyQuery = rpc.group.getGroups(limit);
    await legacyQuery.queryNextPage();
    const legacyResults = legacyQuery.currentPage?.results ?? [];

    expect(legacyResults.length).toBeGreaterThanOrEqual(direct.results.length);

    const legacyIndex = new Map(legacyResults.map((row) => [row.group.toLowerCase(), row]));
    for (const row of direct.results) {
      const legacy = legacyIndex.get(row.group.toLowerCase());
      expect(legacy).toBeDefined();
      expect(legacy?.name).toBe(row.name);
      expect(legacy?.symbol).toBe(row.symbol);
    }

    expect(direct.hasMore).toBe(true);
    expect(direct.nextCursor).toBeTruthy();

    const nextPage = await rpc.group.findGroups(limit, undefined, direct.nextCursor);
    const firstAddresses = new Set(direct.results.map((row) => row.group.toLowerCase()));
    const overlap = nextPage.results.some((row) => firstAddresses.has(row.group.toLowerCase()));
    expect(overlap).toBe(false);
  }, TEST_TIMEOUT);

  test('transaction history pagination yields disjoint pages', async () => {
    const limit = 5;
    const firstPage = await rpc.transaction.getTransactionHistory(TEST_AVATAR, limit);

    expect(firstPage.results.length).toBeGreaterThan(0);
    expect(firstPage.results.length).toBeLessThanOrEqual(limit);
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.nextCursor).toBeTruthy();

    const secondPage = await rpc.transaction.getTransactionHistory(TEST_AVATAR, limit, firstPage.nextCursor);
    const firstKeys = new Set(firstPage.results.map((tx) => `${tx.transactionHash}:${tx.logIndex}`));

    for (const tx of secondPage.results) {
      expect(firstKeys.has(`${tx.transactionHash}:${tx.logIndex}`)).toBe(false);
    }
  }, TEST_TIMEOUT);

  test('token holder pagination uses unique cursors', async () => {
    const limit = 5;
    const firstPage = await rpc.token.getTokenHolders(TEST_TOKEN, limit);

    expect(firstPage.results.length).toBeGreaterThan(0);
    expect(firstPage.results.length).toBeLessThanOrEqual(limit);
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.nextCursor).toBeTruthy();

    const secondPage = await rpc.token.getTokenHolders(TEST_TOKEN, limit, firstPage.nextCursor);
    const firstAccounts = new Set(firstPage.results.map((holder) => holder.account.toLowerCase()));

    for (const holder of secondPage.results) {
      expect(firstAccounts.has(holder.account.toLowerCase())).toBe(false);
    }
  }, TEST_TIMEOUT);

  test('searchProfileByAddressOrName honors offsets and detects addresses', async () => {
    const limit = 5;
    const searchTypes = SEARCH_TYPES && SEARCH_TYPES.length > 0 ? SEARCH_TYPES : undefined;

    const textResults = await rpc.sdk.searchProfileByAddressOrName(SEARCH_TERM, limit, 0, searchTypes);
    expect(textResults.searchType).toBe('text');
    expect(textResults.results.length).toBeLessThanOrEqual(limit);
    expect(textResults.totalCount).toBeGreaterThanOrEqual(textResults.results.length);

    if (textResults.totalCount > limit) {
      const offsetResults = await rpc.sdk.searchProfileByAddressOrName(SEARCH_TERM, limit, limit, searchTypes);
      const firstKeys = new Set(textResults.results.map((profile) => profileKey(profile)));
      const duplicates = offsetResults.results.filter((profile) => firstKeys.has(profileKey(profile)));
      expect(duplicates.length).toBe(0);
    }

    const addressResults = await rpc.sdk.searchProfileByAddressOrName(TEST_AVATAR);
    expect(addressResults.searchType).toBe('address');
    expect(addressResults.results.length).toBeGreaterThan(0);
    const bestMatch = addressResults.results[0] as Record<string, any>;
    const avatar = (bestMatch.address ?? bestMatch.avatar ?? '').toLowerCase();
    expect(avatar.startsWith(TEST_AVATAR.toLowerCase().slice(0, 6))).toBe(true);
  }, TEST_TIMEOUT);
});
