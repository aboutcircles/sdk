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
const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as Address;
const TEST_TARGET = (env.CIRCLES_TEST_TARGET ?? '0x42cEDde51198D1773590311E2A340DC06B24cB37') as Address;

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

// ---------------------------------------------------------------------------
// 1. Balance
// ---------------------------------------------------------------------------
integration('Balance methods', () => {
  test('getTotalBalance returns bigint >= 0', async () => {
    const balance = await rpc.balance.getTotalBalance(TEST_AVATAR);
    expect(typeof balance).toBe('bigint');
    expect(balance).toBeGreaterThanOrEqual(0n);
  }, TEST_TIMEOUT);

  test('getTokenBalances returns array with expected shape', async () => {
    const balances = await rpc.balance.getTokenBalances(TEST_AVATAR);
    expect(Array.isArray(balances)).toBe(true);
    expect(balances.length).toBeGreaterThan(0);

    const first = balances[0];
    expect(first).toHaveProperty('tokenAddress');
    expect(typeof first.tokenAddress).toBe('string');
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 2. Avatar
// ---------------------------------------------------------------------------
integration('Avatar methods', () => {
  test('getAvatarInfo returns object with type field', async () => {
    const info = await rpc.avatar.getAvatarInfo(TEST_AVATAR);
    expect(info).toBeDefined();
    expect(info!.type).toBeDefined();
    expect(info!.avatar.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
  }, TEST_TIMEOUT);

  test('getAvatarInfoBatch returns correct length', async () => {
    const results = await rpc.avatar.getAvatarInfoBatch([TEST_AVATAR, ZERO_ADDR]);
    expect(Array.isArray(results)).toBe(true);
    // ZERO_ADDR is not a registered avatar, so result may filter it out
    // but we should get at least 1 result for TEST_AVATAR
    expect(results.length).toBeGreaterThanOrEqual(1);
  }, TEST_TIMEOUT);

  test('getNetworkSnapshot returns BlockNumber and Addresses', async () => {
    const snapshot = await rpc.avatar.getNetworkSnapshot();
    expect(snapshot).toBeDefined();
    expect(snapshot.BlockNumber).toBeGreaterThan(0);
    expect(Array.isArray(snapshot.Addresses)).toBe(true);
    expect(snapshot.Addresses.length).toBeGreaterThan(0);
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 3. Profile
// ---------------------------------------------------------------------------
integration('Profile methods', () => {
  let knownCid: string | undefined;

  test('getProfileByAddress returns profile with name', async () => {
    const profile = await rpc.profile.getProfileByAddress(TEST_AVATAR);
    expect(profile).not.toBeNull();
    expect(profile!.name).toBeDefined();
    expect(typeof profile!.name).toBe('string');
  }, TEST_TIMEOUT);

  test('getProfileByAddressBatch returns correct length', async () => {
    const results = await rpc.profile.getProfileByAddressBatch([TEST_AVATAR]);
    expect(results.length).toBe(1);
  }, TEST_TIMEOUT);

  test('searchProfiles returns results for search term', async () => {
    const results = await rpc.profile.searchProfiles(SEARCH_TERM, 5);
    expect(Array.isArray(results)).toBe(true);
    // 'berlin' should match at least one profile
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('name');
  }, TEST_TIMEOUT);

  test('searchByAddressOrName detects address search', async () => {
    const result = await rpc.profile.searchByAddressOrName(TEST_AVATAR);
    expect(result.searchType).toBe('address');
    expect(result.results.length).toBeGreaterThan(0);
  }, TEST_TIMEOUT);

  test('searchByAddressOrName detects text search', async () => {
    const result = await rpc.profile.searchByAddressOrName(SEARCH_TERM, 5);
    expect(result.searchType).toBe('text');
  }, TEST_TIMEOUT);

  test('getProfileView returns ProfileView shape', async () => {
    const view = await rpc.profile.getProfileView(TEST_AVATAR);
    expect(view).toBeDefined();
    expect(view.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(view.trustStats).toBeDefined();
    expect(typeof view.trustStats.trustsCount).toBe('number');
    expect(typeof view.trustStats.trustedByCount).toBe('number');
  }, TEST_TIMEOUT);

  test('getProfileByCid returns profile or null', async () => {
    // First retrieve a known CID from the avatar info
    const avatarInfo = await rpc.avatar.getAvatarInfo(TEST_AVATAR);
    knownCid = avatarInfo?.cidV0;

    if (!knownCid) {
      console.warn('[circles-rpc] No CID found for TEST_AVATAR, skipping CID-based tests');
      return;
    }

    const profile = await rpc.profile.getProfileByCid(knownCid);
    expect(profile).not.toBeNull();
    expect(profile!.name).toBeDefined();
  }, TEST_TIMEOUT);

  test('getProfileByCidBatch returns array of correct length', async () => {
    const avatarInfo = await rpc.avatar.getAvatarInfo(TEST_AVATAR);
    knownCid = avatarInfo?.cidV0;

    if (!knownCid) {
      console.warn('[circles-rpc] No CID, skipping batch CID test');
      return;
    }

    const results = await rpc.profile.getProfileByCidBatch([knownCid, null]);
    expect(results.length).toBe(2);
    expect(results[0]).not.toBeNull();
    expect(results[1]).toBeNull();
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 4. Trust
// ---------------------------------------------------------------------------
integration('Trust methods', () => {
  test('getAggregatedTrustRelations returns array with expected shape', async () => {
    const relations = await rpc.trust.getAggregatedTrustRelations(TEST_AVATAR);
    expect(Array.isArray(relations)).toBe(true);
    expect(relations.length).toBeGreaterThan(0);

    const first = relations[0];
    expect(first).toHaveProperty('subjectAvatar');
    expect(first).toHaveProperty('relation');
    expect(first).toHaveProperty('objectAvatar');
    expect(['trusts', 'trustedBy', 'mutuallyTrusts']).toContain(first.relation);
  }, TEST_TIMEOUT);

  test('getTrustedBy returns only trustedBy relations', async () => {
    const trustedBy = await rpc.trust.getTrustedBy(TEST_AVATAR);
    expect(Array.isArray(trustedBy)).toBe(true);
    for (const r of trustedBy) {
      expect(r.relation).toBe('trustedBy');
    }
  }, TEST_TIMEOUT);

  test('getTrusts returns only trusts relations', async () => {
    const trusts = await rpc.trust.getTrusts(TEST_AVATAR);
    expect(Array.isArray(trusts)).toBe(true);
    for (const r of trusts) {
      expect(r.relation).toBe('trusts');
    }
  }, TEST_TIMEOUT);

  test('getMutualTrusts returns only mutuallyTrusts relations', async () => {
    const mutual = await rpc.trust.getMutualTrusts(TEST_AVATAR);
    expect(Array.isArray(mutual)).toBe(true);
    for (const r of mutual) {
      expect(r.relation).toBe('mutuallyTrusts');
    }
  }, TEST_TIMEOUT);

  test('getCommonTrust returns Address array', async () => {
    const common = await rpc.trust.getCommonTrust(TEST_AVATAR, TEST_TARGET);
    expect(Array.isArray(common)).toBe(true);
    // Result may be empty if no common trust, but shape must be Address[]
    for (const addr of common) {
      expect(typeof addr).toBe('string');
      expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  }, TEST_TIMEOUT);

  test('getTrustNetworkSummary returns summary shape', async () => {
    const summary = await rpc.trust.getTrustNetworkSummary(TEST_AVATAR);
    expect(summary).toBeDefined();
    expect(summary.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(typeof summary.directTrustsCount).toBe('number');
    expect(typeof summary.directTrustedByCount).toBe('number');
    expect(typeof summary.mutualTrustsCount).toBe('number');
    expect(typeof summary.networkReach).toBe('number');
    expect(Array.isArray(summary.mutualTrusts)).toBe(true);
  }, TEST_TIMEOUT);

  test('getAggregatedTrustRelationsEnriched returns enriched response', async () => {
    const enriched = await rpc.trust.getAggregatedTrustRelationsEnriched(TEST_AVATAR);
    expect(enriched).toBeDefined();
    expect(enriched.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(Array.isArray(enriched.results)).toBe(true);
    expect(enriched.results.length).toBeGreaterThan(0);
    const first = enriched.results[0];
    expect(first).toHaveProperty('address');
    expect(first).toHaveProperty('relationType');
    expect(['mutual', 'trusts', 'trustedBy']).toContain(first.relationType);
  }, TEST_TIMEOUT);

  test('getValidInviters returns response with results', async () => {
    const result = await rpc.trust.getValidInviters(TEST_AVATAR);
    expect(result).toBeDefined();
    expect(result.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(Array.isArray(result.results)).toBe(true);
    if (result.results.length > 0) {
      const inviter = result.results[0];
      expect(inviter).toHaveProperty('address');
      expect(inviter).toHaveProperty('balance');
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 5. Token
// ---------------------------------------------------------------------------
integration('Token methods', () => {
  test('getTokenInfo returns TokenInfo with token address', async () => {
    const info = await rpc.token.getTokenInfo(TEST_TOKEN);
    expect(info).toBeDefined();
    expect(info!.tokenAddress.toLowerCase()).toBe(TEST_TOKEN.toLowerCase());
    expect(typeof info!.tokenOwner).toBe('string');
    expect(typeof info!.tokenType).toBe('string');
  }, TEST_TIMEOUT);

  test('getTokenInfoBatch returns correct length', async () => {
    const results = await rpc.token.getTokenInfoBatch([TEST_TOKEN]);
    expect(results.length).toBe(1);
    expect(results[0].tokenAddress.toLowerCase()).toBe(TEST_TOKEN.toLowerCase());
  }, TEST_TIMEOUT);

  test('getTokenHolders returns paginated response', async () => {
    const page = await rpc.token.getTokenHolders(TEST_TOKEN, 5);
    expect(page.results.length).toBeGreaterThan(0);
    expect(page.results.length).toBeLessThanOrEqual(5);
    expect(typeof page.hasMore).toBe('boolean');

    const holder = page.results[0];
    expect(holder).toHaveProperty('account');
    expect(holder).toHaveProperty('balance');
  }, TEST_TIMEOUT);

  test('getTokenHolders pagination yields disjoint pages', async () => {
    const first = await rpc.token.getTokenHolders(TEST_TOKEN, 5);
    expect(first.hasMore).toBe(true);
    expect(first.nextCursor).toBeTruthy();

    const second = await rpc.token.getTokenHolders(TEST_TOKEN, 5, first.nextCursor);
    const firstAccounts = new Set(first.results.map(h => h.account.toLowerCase()));

    for (const h of second.results) {
      expect(firstAccounts.has(h.account.toLowerCase())).toBe(false);
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 6. Transaction
// ---------------------------------------------------------------------------
integration('Transaction methods', () => {
  test('getTransactionHistory returns paginated response', async () => {
    const page = await rpc.transaction.getTransactionHistory(TEST_AVATAR, 5);
    expect(page.results.length).toBeGreaterThan(0);
    expect(page.results.length).toBeLessThanOrEqual(5);
    expect(typeof page.hasMore).toBe('boolean');

    const tx = page.results[0];
    expect(tx).toHaveProperty('transactionHash');
    expect(tx).toHaveProperty('from');
    expect(tx).toHaveProperty('to');
    expect(tx).toHaveProperty('value');
  }, TEST_TIMEOUT);

  test('getTransactionHistory pagination yields disjoint pages', async () => {
    const first = await rpc.transaction.getTransactionHistory(TEST_AVATAR, 5);
    expect(first.hasMore).toBe(true);
    expect(first.nextCursor).toBeTruthy();

    const second = await rpc.transaction.getTransactionHistory(TEST_AVATAR, 5, first.nextCursor);
    const firstKeys = new Set(first.results.map(tx => `${tx.transactionHash}:${tx.logIndex}`));

    for (const tx of second.results) {
      expect(firstKeys.has(`${tx.transactionHash}:${tx.logIndex}`)).toBe(false);
    }
  }, TEST_TIMEOUT);

  test('getTransactionHistoryEnriched returns enriched transactions', async () => {
    const page = await rpc.transaction.getTransactionHistoryEnriched(TEST_AVATAR, 0, null, 5);
    expect(page.results.length).toBeGreaterThan(0);
    expect(typeof page.hasMore).toBe('boolean');

    const tx = page.results[0];
    expect(tx).toHaveProperty('transactionHash');
    expect(tx).toHaveProperty('event');
    expect(tx).toHaveProperty('participants');
    expect(typeof tx.event).toBe('object');
    expect(typeof tx.participants).toBe('object');
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 7. Group
// ---------------------------------------------------------------------------
integration('Group methods', () => {
  let discoveredGroupAddr: Address | undefined;

  test('findGroups returns paginated response with disjoint pages', async () => {
    const first = await rpc.group.findGroups(5);
    expect(first.results.length).toBeGreaterThan(0);
    expect(first.results.length).toBeLessThanOrEqual(5);
    expect(first.hasMore).toBe(true);
    expect(first.nextCursor).toBeTruthy();

    discoveredGroupAddr = first.results[0].group;

    const second = await rpc.group.findGroups(5, undefined, first.nextCursor);
    const firstAddrs = new Set(first.results.map(r => r.group.toLowerCase()));
    for (const r of second.results) {
      expect(firstAddrs.has(r.group.toLowerCase())).toBe(false);
    }
  }, TEST_TIMEOUT);

  test('findGroups aligns with legacy PagedQuery', async () => {
    const direct = await rpc.group.findGroups(5);
    const legacyQuery = rpc.group.getGroups(5);
    await legacyQuery.queryNextPage();
    const legacyResults = legacyQuery.currentPage?.results ?? [];

    expect(legacyResults.length).toBeGreaterThanOrEqual(direct.results.length);

    const legacyIndex = new Map(legacyResults.map(row => [row.group.toLowerCase(), row]));
    for (const row of direct.results) {
      const legacy = legacyIndex.get(row.group.toLowerCase());
      expect(legacy).toBeDefined();
      expect(legacy?.name).toBe(row.name);
    }
  }, TEST_TIMEOUT);

  test('getGroupMemberships returns paginated response', async () => {
    const page = await rpc.group.getGroupMemberships(TEST_AVATAR, 5);
    expect(Array.isArray(page.results)).toBe(true);
    expect(typeof page.hasMore).toBe('boolean');
    // TEST_AVATAR may or may not be in groups, so we just check shape
    if (page.results.length > 0) {
      expect(page.results[0]).toHaveProperty('group');
      expect(page.results[0]).toHaveProperty('member');
    }
  }, TEST_TIMEOUT);

  test('getGroupMembers returns members for discovered group', async () => {
    if (!discoveredGroupAddr) {
      const groups = await rpc.group.findGroups(1);
      discoveredGroupAddr = groups.results[0]?.group;
    }
    expect(discoveredGroupAddr).toBeDefined();

    const page = await rpc.group.getGroupMembers(discoveredGroupAddr!, 5);
    expect(Array.isArray(page.results)).toBe(true);
    expect(typeof page.hasMore).toBe('boolean');
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 8. Invitation
// ---------------------------------------------------------------------------
integration('Invitation methods', () => {
  test('getInvitedBy returns Address or undefined', async () => {
    const inviter = await rpc.invitation.getInvitedBy(TEST_AVATAR);
    // May be undefined if not registered via invitation
    if (inviter !== undefined) {
      expect(typeof inviter).toBe('string');
      expect(inviter).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  }, TEST_TIMEOUT);

  test('getValidInviters returns response with results', async () => {
    const result = await rpc.invitation.getValidInviters(TEST_AVATAR);
    expect(result).toBeDefined();
    expect(result.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(Array.isArray(result.results)).toBe(true);
  }, TEST_TIMEOUT);

  test('getAllInvitations returns AllInvitationsResponse shape', async () => {
    const result = await rpc.invitation.getAllInvitations(TEST_AVATAR);
    expect(result).toBeDefined();
    expect(result.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(Array.isArray(result.trustInvitations)).toBe(true);
    expect(Array.isArray(result.escrowInvitations)).toBe(true);
    expect(Array.isArray(result.atScaleInvitations)).toBe(true);

    // Verify source field on trust invitations
    if (result.trustInvitations.length > 0) {
      expect(result.trustInvitations[0].source).toBe('trust');
      expect(result.trustInvitations[0]).toHaveProperty('balance');
    }
  }, TEST_TIMEOUT);

  test('getInvitationsFrom (accepted) returns InvitationsFromResponse', async () => {
    const result = await rpc.invitation.getInvitationsFrom(TEST_AVATAR, true);
    expect(result).toBeDefined();
    expect(result.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(result.accepted).toBe(true);
    expect(Array.isArray(result.results)).toBe(true);
    for (const entry of result.results) {
      expect(entry.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(entry.status).toBe('accepted');
    }
  }, TEST_TIMEOUT);

  test('getInvitationsFrom (pending) returns InvitationsFromResponse', async () => {
    const result = await rpc.invitation.getInvitationsFrom(TEST_AVATAR, false);
    expect(result).toBeDefined();
    expect(result.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(result.accepted).toBe(false);
    expect(Array.isArray(result.results)).toBe(true);
    for (const entry of result.results) {
      expect(entry.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(entry.status).toBe('pending');
    }
  }, TEST_TIMEOUT);

  test('getInvitationOrigin returns origin details', async () => {
    const origin = await rpc.invitation.getInvitationOrigin(TEST_AVATAR);
    // Should have origin since TEST_AVATAR is a registered human
    expect(origin).not.toBeNull();
    if (origin) {
      expect(origin.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
      expect(['v1_signup', 'v2_standard', 'v2_escrow', 'v2_at_scale']).toContain(origin.invitationType);
      expect(typeof origin.blockNumber).toBe('number');
      expect(typeof origin.timestamp).toBe('number');
      expect(typeof origin.transactionHash).toBe('string');
      expect(typeof origin.version).toBe('number');
    }
  }, TEST_TIMEOUT);

  test('getTrustInvitations returns TrustInvitation array', async () => {
    const result = await rpc.invitation.getTrustInvitations(TEST_AVATAR);
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0].source).toBe('trust');
      expect(result[0]).toHaveProperty('balance');
      expect(result[0]).toHaveProperty('address');
    }
  }, TEST_TIMEOUT);

  test('getEscrowInvitations returns EscrowInvitation array', async () => {
    const result = await rpc.invitation.getEscrowInvitations(TEST_AVATAR);
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0].source).toBe('escrow');
      expect(result[0]).toHaveProperty('escrowedAmount');
      expect(result[0]).toHaveProperty('escrowDays');
    }
  }, TEST_TIMEOUT);

  test('getAtScaleInvitations returns AtScaleInvitation array', async () => {
    const result = await rpc.invitation.getAtScaleInvitations(TEST_AVATAR);
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0].source).toBe('atScale');
      expect(result[0]).toHaveProperty('blockNumber');
      expect(result[0]).toHaveProperty('timestamp');
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 9. Pathfinder
// ---------------------------------------------------------------------------
integration('Pathfinder methods', () => {
  test('findPath returns maxFlow and transfers', async () => {
    const result = await rpc.pathfinder.findPath({
      from: TEST_AVATAR,
      to: TEST_TARGET,
      targetFlow: 1000000000000000000n, // 1 CRC
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('maxFlow');
    expect(result).toHaveProperty('transfers');
    expect(Array.isArray(result.transfers)).toBe(true);
  }, TEST_TIMEOUT);

  test('findMaxFlow returns bigint', async () => {
    const maxFlow = await rpc.pathfinder.findMaxFlow({
      from: TEST_AVATAR,
      to: TEST_TARGET,
    });

    expect(typeof maxFlow).toBe('bigint');
    expect(maxFlow).toBeGreaterThanOrEqual(0n);
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 10. Query
// ---------------------------------------------------------------------------
integration('Query methods', () => {
  test('tables() returns non-empty table info array', async () => {
    const tables = await rpc.query.tables();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);

    const first = tables[0];
    expect(first).toHaveProperty('namespace');
    expect(first).toHaveProperty('tables');
    expect(Array.isArray(first.tables)).toBe(true);
    expect(first.tables.length).toBeGreaterThan(0);
    const firstTable = first.tables[0];
    expect(firstTable).toHaveProperty('table');
    expect(firstTable).toHaveProperty('columns');
  }, TEST_TIMEOUT);

  test('query() returns typed objects for V_CrcV2 TrustRelations', async () => {
    const result = await rpc.query.query<Record<string, unknown>>({
      Namespace: 'V_CrcV2',
      Table: 'TrustRelations',
      Columns: [],
      Filter: [
        {
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'trustee',
          Value: TEST_AVATAR.toLowerCase(),
        },
      ],
      Order: [{ Column: 'blockNumber', SortOrder: 'DESC' }],
      Limit: 3,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
    // Each row should be an object with column keys
    const first = result[0];
    expect(first).toHaveProperty('trustee');
    expect(first).toHaveProperty('truster');
  }, TEST_TIMEOUT);

  test('PagedQuery with circles_paginated_query yields disjoint pages', async () => {
    const query = rpc.group.getGroups(5);

    // First page
    const hasPage1 = await query.queryNextPage();
    expect(hasPage1).toBe(true);
    const page1 = query.currentPage!;
    expect(page1.results.length).toBeGreaterThan(0);
    expect(page1.hasMore).toBe(true);
    expect(page1.nextCursor).toBeTruthy();

    // Second page
    const hasPage2 = await query.queryNextPage();
    expect(hasPage2).toBe(true);
    const page2 = query.currentPage!;

    const page1Addrs = new Set(page1.results.map(r => r.group.toLowerCase()));
    for (const row of page2.results) {
      expect(page1Addrs.has(row.group.toLowerCase())).toBe(false);
    }
  }, TEST_TIMEOUT);

  test('events() returns paginated events', async () => {
    const result = await rpc.query.events(
      TEST_AVATAR.toLowerCase(),
      null,
      null,
      ['CrcV2_Trust'],
      null,
      false,
      5,
      null
    );

    expect(Array.isArray(result.events)).toBe(true);
    expect(typeof result.hasMore).toBe('boolean');
    // May have 0 events if no CrcV2_Trust for this avatar recently, but shape is valid
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 11. SDK methods (consolidated convenience methods)
// ---------------------------------------------------------------------------
integration('SDK methods', () => {
  test('getProfileView returns ProfileView shape', async () => {
    const view = await rpc.sdk.getProfileView(TEST_AVATAR);
    expect(view).toBeDefined();
    expect(view.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(view.trustStats).toBeDefined();
    expect(typeof view.trustStats.trustsCount).toBe('number');
    expect(typeof view.trustStats.trustedByCount).toBe('number');
    // Optional fields
    if (view.profile) {
      expect(view.profile.name).toBeDefined();
    }
  }, TEST_TIMEOUT);

  test('getTrustNetworkSummary returns TrustNetworkSummary', async () => {
    const summary = await rpc.sdk.getTrustNetworkSummary(TEST_AVATAR);
    expect(summary.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(typeof summary.directTrustsCount).toBe('number');
    expect(typeof summary.directTrustedByCount).toBe('number');
    expect(typeof summary.mutualTrustsCount).toBe('number');
    expect(typeof summary.networkReach).toBe('number');
    expect(Array.isArray(summary.mutualTrusts)).toBe(true);
  }, TEST_TIMEOUT);

  test('getAggregatedTrustRelations returns AggregatedTrustRelation[]', async () => {
    const result = await rpc.sdk.getAggregatedTrustRelations(TEST_AVATAR);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    const first = result[0];
    expect(first).toHaveProperty('subjectAvatar');
    expect(first).toHaveProperty('relation');
    expect(first).toHaveProperty('objectAvatar');
  }, TEST_TIMEOUT);

  test('getValidInviters returns response with results', async () => {
    const result = await rpc.sdk.getValidInviters(TEST_AVATAR);
    expect(result.address.toLowerCase()).toBe(TEST_AVATAR.toLowerCase());
    expect(Array.isArray(result.results)).toBe(true);
  }, TEST_TIMEOUT);

  test('getTransactionHistoryEnriched returns paginated enriched txs', async () => {
    const page = await rpc.sdk.getTransactionHistoryEnriched(TEST_AVATAR, 0, null, 5);
    expect(page.results.length).toBeGreaterThan(0);
    expect(typeof page.hasMore).toBe('boolean');

    const tx = page.results[0];
    expect(tx).toHaveProperty('transactionHash');
    expect(tx).toHaveProperty('event');
    expect(tx).toHaveProperty('participants');
  }, TEST_TIMEOUT);

  test('searchProfileByAddressOrName detects text and address', async () => {
    const searchTypes = SEARCH_TYPES && SEARCH_TYPES.length > 0 ? SEARCH_TYPES : undefined;

    // Text search
    const textResult = await rpc.sdk.searchProfileByAddressOrName(SEARCH_TERM, 5, null, searchTypes);
    expect(textResult.searchType).toBe('text');
    expect(textResult.results.length).toBeLessThanOrEqual(5);
    expect(textResult.results.length).toBeGreaterThan(0);
    expect(typeof textResult.hasMore).toBe('boolean');

    // Address search
    const addrResult = await rpc.sdk.searchProfileByAddressOrName(TEST_AVATAR);
    expect(addrResult.searchType).toBe('address');
    expect(addrResult.results.length).toBeGreaterThan(0);
    const bestMatch = addrResult.results[0] as Record<string, any>;
    const avatar = (bestMatch.address ?? bestMatch.avatar ?? '').toLowerCase();
    expect(avatar.startsWith(TEST_AVATAR.toLowerCase().slice(0, 6))).toBe(true);
  }, TEST_TIMEOUT);

  test('searchProfileByAddressOrName cursor pagination yields disjoint pages', async () => {
    const page1 = await rpc.sdk.searchProfileByAddressOrName(SEARCH_TERM, 2);
    expect(page1.hasMore).toBe(true);
    expect(page1.nextCursor).toBeTruthy();

    const page2 = await rpc.sdk.searchProfileByAddressOrName(SEARCH_TERM, 2, page1.nextCursor);
    const page1Keys = new Set(page1.results.map(profileKey));
    for (const p of page2.results) {
      expect(page1Keys.has(profileKey(p))).toBe(false);
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 12. Unified RPC proxy — validates eth_*/net_*/web3_* routing
// ---------------------------------------------------------------------------
integration('Unified RPC proxy (eth/net/web3 forwarding)', () => {
  test('eth_blockNumber returns hex string', async () => {
    const blockNumber = await rpc.client.call<unknown[], string>('eth_blockNumber', []);
    expect(typeof blockNumber).toBe('string');
    expect(blockNumber).toMatch(/^0x[0-9a-fA-F]+$/);
  }, TEST_TIMEOUT);

  test('net_version returns string', async () => {
    const version = await rpc.client.call<unknown[], string>('net_version', []);
    expect(typeof version).toBe('string');
    // Gnosis chain ID is 100
    expect(version).toBe('100');
  }, TEST_TIMEOUT);

  test('web3_clientVersion contains Nethermind', async () => {
    const clientVersion = await rpc.client.call<unknown[], string>('web3_clientVersion', []);
    expect(typeof clientVersion).toBe('string');
    expect(clientVersion.toLowerCase()).toContain('nethermind');
  }, TEST_TIMEOUT);

  test('disallowed method returns error', async () => {
    try {
      await rpc.client.call<unknown[], unknown>('admin_peers', []);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      // Should get a -32601 "Method not found" error
      expect(error.code).toBe(-32601);
    }
  }, TEST_TIMEOUT);
});
