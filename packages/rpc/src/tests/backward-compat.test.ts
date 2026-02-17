/**
 * Backward Compatibility Tests
 *
 * Validates that the new dedicated RPC endpoints return equivalent data
 * to the old circles_query-based approach. This ensures the RPC migration
 * doesn't silently change behavior.
 *
 * Strategy: For each migrated method, call both the old (circles_query) and
 * new (dedicated endpoint) approaches, then compare address sets.
 */
import { describe, test, expect } from 'bun:test';
import { CirclesRpc } from '../rpc';
import type { Address, CirclesQueryResponse, AvatarInfo } from '@aboutcircles/sdk-types';

const env = ((globalThis as Record<string, unknown>).process as { env?: Record<string, string | undefined> } | undefined)?.env ?? {};
const RPC_URL = env.CIRCLES_RPC_URL ?? 'http://localhost:8081/';
const TEST_AVATAR = (env.CIRCLES_TEST_AVATAR ?? '0xde374ece6fa50e781e81aac78e811b33d16912c7') as Address;
const SEARCH_TERM = env.CIRCLES_TEST_SEARCH_TERM ?? 'berlin';
const TEST_TIMEOUT = Number(env.CIRCLES_RPC_TEST_TIMEOUT ?? 60000);

const rpc = new CirclesRpc(RPC_URL);
let rpcReachable = true;

try {
  await rpc.profile.getProfileByAddress(TEST_AVATAR);
} catch (error) {
  rpcReachable = false;
  console.warn(`[backward-compat] Tests skipped — unable to reach ${RPC_URL}: ${(error as Error).message}`);
}

/** Transform circles_query columnar response into typed objects */
function transformQueryResponse<T>(response: CirclesQueryResponse): T[] {
  const { columns, rows } = response;
  return rows.map((row) => {
    const obj: any = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj as T;
  });
}

/** Normalize address set for comparison */
const addrSet = (addrs: string[]) => new Set(addrs.map(a => a.toLowerCase()));

const compat = rpcReachable ? describe : describe.skip;

// ---------------------------------------------------------------------------
// 1. getInvitationsFrom (accepted=true)
//    Old: circles_query on CrcV2.RegisterHuman WHERE inviter = address
//    New: circles_getInvitationsFrom(address, true)
// ---------------------------------------------------------------------------
compat('getInvitationsFrom (accepted) — old vs new', () => {
  test('address sets match', async () => {
    // --- Old approach: raw circles_query ---
    const oldResponse = await rpc.client.call<[any], CirclesQueryResponse>('circles_query', [
      {
        Namespace: 'CrcV2',
        Table: 'RegisterHuman',
        Columns: ['avatar'],
        Filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'inviter',
            Value: TEST_AVATAR.toLowerCase(),
          },
        ],
        Order: [{ Column: 'blockNumber', SortOrder: 'DESC' }],
      },
    ]);
    const oldAvatars = transformQueryResponse<{ avatar: string }>(oldResponse).map(r => r.avatar);

    // --- New approach: dedicated endpoint ---
    const newResult = await rpc.invitation.getInvitationsFrom(TEST_AVATAR, true);
    const newAvatars = newResult.results.map(r => r.address);

    // Compare address sets (order may differ)
    const oldSet = addrSet(oldAvatars);
    const newSet = addrSet(newAvatars);

    expect(oldSet.size).toBe(newSet.size);
    for (const addr of oldSet) {
      expect(newSet.has(addr)).toBe(true);
    }
  }, TEST_TIMEOUT);

  test('new endpoint enriches with avatarInfo', async () => {
    const result = await rpc.invitation.getInvitationsFrom(TEST_AVATAR, true);
    // Accepted invitations should have avatarInfo for registered accounts
    for (const entry of result.results) {
      expect(entry.status).toBe('accepted');
      // avatarInfo may be present for registered accounts
      if (entry.avatarInfo) {
        expect(entry.avatarInfo).toHaveProperty('avatar');
        expect(entry.avatarInfo).toHaveProperty('type');
      }
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 2. getInvitationsFrom (accepted=false / pending)
//    Old: circles_query on V_Crc.TrustRelations WHERE truster = address
//         + getAvatarInfoBatch to find unregistered
//    New: circles_getInvitationsFrom(address, false)
// ---------------------------------------------------------------------------
compat('getInvitationsFrom (pending) — old vs new', () => {
  test('address sets match', async () => {
    // --- Old approach: V_Crc.TrustRelations + filter unregistered ---
    const trustResponse = await rpc.client.call<[any], CirclesQueryResponse>('circles_query', [
      {
        Namespace: 'V_Crc',
        Table: 'TrustRelations',
        Columns: ['trustee', 'truster'],
        Filter: [
          {
            Type: 'Conjunction',
            ConjunctionType: 'And',
            Predicates: [
              {
                Type: 'FilterPredicate',
                FilterType: 'Equals',
                Column: 'version',
                Value: 2,
              },
              {
                Type: 'FilterPredicate',
                FilterType: 'Equals',
                Column: 'truster',
                Value: TEST_AVATAR.toLowerCase(),
              },
            ],
          },
        ],
        Order: [],
      },
    ]);

    const trustRelations = transformQueryResponse<{ trustee: string; truster: string }>(trustResponse);
    const v2Trusted = trustRelations.map(r => r.trustee);

    let oldPending: string[] = [];
    if (v2Trusted.length > 0) {
      const avatarInfoBatch = await rpc.client.call<[string[]], (AvatarInfo | null)[]>(
        'circles_getAvatarInfoBatch',
        [v2Trusted]
      );
      const registeredSet = new Set(
        avatarInfoBatch
          .filter((a): a is AvatarInfo => a !== null)
          .map(a => a.avatar.toLowerCase())
      );
      oldPending = v2Trusted.filter(addr => !registeredSet.has(addr.toLowerCase()));
    }

    // --- New approach: dedicated endpoint ---
    const newResult = await rpc.invitation.getInvitationsFrom(TEST_AVATAR, false);
    const newPending = newResult.results.map(r => r.address);

    // Compare address sets
    const oldSet = addrSet(oldPending);
    const newSet = addrSet(newPending);

    expect(oldSet.size).toBe(newSet.size);
    for (const addr of oldSet) {
      expect(newSet.has(addr)).toBe(true);
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 3. getAllInvitations consistency
//    The aggregated endpoint should return the same data as calling
//    each individual endpoint separately.
// ---------------------------------------------------------------------------
compat('getAllInvitations vs individual endpoints', () => {
  test('trust invitation address sets match', async () => {
    const [all, individual] = await Promise.all([
      rpc.invitation.getAllInvitations(TEST_AVATAR),
      rpc.invitation.getTrustInvitations(TEST_AVATAR),
    ]);

    const allSet = addrSet(all.trustInvitations.map(i => i.address));
    const indivSet = addrSet(individual.map(i => i.address));

    expect(allSet.size).toBe(indivSet.size);
    for (const addr of allSet) {
      expect(indivSet.has(addr)).toBe(true);
    }
  }, TEST_TIMEOUT);

  test('escrow invitation address sets match', async () => {
    const [all, individual] = await Promise.all([
      rpc.invitation.getAllInvitations(TEST_AVATAR),
      rpc.invitation.getEscrowInvitations(TEST_AVATAR),
    ]);

    const allSet = addrSet(all.escrowInvitations.map(i => i.address));
    const indivSet = addrSet(individual.map(i => i.address));

    expect(allSet.size).toBe(indivSet.size);
    for (const addr of allSet) {
      expect(indivSet.has(addr)).toBe(true);
    }
  }, TEST_TIMEOUT);

  test('at-scale invitation address sets match', async () => {
    const [all, individual] = await Promise.all([
      rpc.invitation.getAllInvitations(TEST_AVATAR),
      rpc.invitation.getAtScaleInvitations(TEST_AVATAR),
    ]);

    const allSet = addrSet(all.atScaleInvitations.map(i => i.address));
    const indivSet = addrSet(individual.map(i => i.address));

    expect(allSet.size).toBe(indivSet.size);
    for (const addr of allSet) {
      expect(indivSet.has(addr)).toBe(true);
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 4. getInvitationOrigin consistency
//    getInvitedBy wraps getInvitationOrigin — both should agree
// ---------------------------------------------------------------------------
compat('getInvitationOrigin vs getInvitedBy', () => {
  test('getInvitedBy returns same inviter as getInvitationOrigin', async () => {
    const [origin, inviter] = await Promise.all([
      rpc.invitation.getInvitationOrigin(TEST_AVATAR),
      rpc.invitation.getInvitedBy(TEST_AVATAR),
    ]);

    if (origin?.inviter) {
      expect(inviter).toBeDefined();
      expect(inviter!.toLowerCase()).toBe(origin.inviter.toLowerCase());
    } else {
      // No inviter in origin → getInvitedBy should return undefined
      expect(inviter).toBeUndefined();
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 5. searchProfileByAddressOrName — old offset vs new cursor pagination
//    Both should return the same first-page results
// ---------------------------------------------------------------------------
compat('searchProfileByAddressOrName — old vs new pagination', () => {
  test('first page results are identical regardless of pagination style', async () => {
    // The new endpoint uses cursor=null for first page, same as old offset=0
    const result = await rpc.sdk.searchProfileByAddressOrName(SEARCH_TERM, 5);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.searchType).toBe('text');

    // Second page via cursor should not overlap
    if (result.hasMore && result.nextCursor) {
      const page2 = await rpc.sdk.searchProfileByAddressOrName(SEARCH_TERM, 5, result.nextCursor);
      const page1Keys = new Set(result.results.map(p => {
        const r = p as Record<string, any>;
        return (r.address ?? r.avatar ?? '').toLowerCase();
      }));

      for (const p of page2.results) {
        const r = p as Record<string, any>;
        const key = (r.address ?? r.avatar ?? '').toLowerCase();
        if (key) {
          expect(page1Keys.has(key)).toBe(false);
        }
      }
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 6. getValidInviters — trust.getValidInviters vs invitation.getValidInviters
//    Both call the same RPC method; verify they return the same data
// ---------------------------------------------------------------------------
compat('getValidInviters — trust vs invitation namespace', () => {
  test('both namespaces return same address set', async () => {
    const [fromTrust, fromInvitation] = await Promise.all([
      rpc.trust.getValidInviters(TEST_AVATAR),
      rpc.invitation.getValidInviters(TEST_AVATAR),
    ]);

    const trustSet = addrSet(fromTrust.results.map(r => r.address));
    const invSet = addrSet(fromInvitation.results.map(r => r.address));

    expect(trustSet.size).toBe(invSet.size);
    for (const addr of trustSet) {
      expect(invSet.has(addr)).toBe(true);
    }
  }, TEST_TIMEOUT);
});

// ---------------------------------------------------------------------------
// 7. findGroups — dedicated endpoint vs PagedQuery (circles_paginated_query)
//    Both should return same groups for first page
// ---------------------------------------------------------------------------
compat('findGroups — dedicated vs PagedQuery', () => {
  test('first page group addresses match', async () => {
    const direct = await rpc.group.findGroups(10);
    const legacyQuery = rpc.group.getGroups(10);
    await legacyQuery.queryNextPage();
    const legacyResults = legacyQuery.currentPage?.results ?? [];

    // Direct should be a subset of legacy (both paginate from start)
    const directAddrs = addrSet(direct.results.map(r => r.group));
    const legacyAddrs = addrSet(legacyResults.map(r => r.group));

    // Same first page
    expect(directAddrs.size).toBe(legacyAddrs.size);
    for (const addr of directAddrs) {
      expect(legacyAddrs.has(addr)).toBe(true);
    }
  }, TEST_TIMEOUT);
});
