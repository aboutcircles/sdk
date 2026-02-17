# New RPC Methods Migration Guide

This guide explains how to update existing Circles SDK integrations to the new RPC host that ships with the standalone Pathfinder/RPC refactor. It focuses on three themes:

1. **Fewer round-trips** – dedicated aggregation endpoints replace bundles of legacy calls.
2. **Cursor-based pagination** – every list method now returns `results`, `hasMore`, and `nextCursor`.
3. **SDK ergonomics** – the RPC client exposes typed helpers that map 1:1 to the new endpoints.

---

## At-a-glance mapping

| Use Case            | Legacy Flow                                                                                 | Replacement                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Profile screen      | `getAvatarInfo` + `getProfileByAddress` + two `getTotalBalance` calls + `getTrustRelations` | `circles_getProfileView` (single call)                                           |
| Trust graph tiles   | Fetch trust matrix + manual avatar lookups                                                  | `circles_getAggregatedTrustRelationsEnriched` + `circles_getTrustNetworkSummary` |
| Invitation flows    | `getTrustRelations` + `getTotalBalance` per counterparty                                    | `circles_getValidInviters`                                                       |
| All invitations     | Multiple `circles_query` calls to escrow/at-scale tables                                    | `circles_getAllInvitations` (single call)                                         |
| Individual invites  | 2-5 `circles_query` calls + `circles_getAvatarInfoBatch`                                    | `circles_getTrustInvitations` / `circles_getEscrowInvitations` / `circles_getAtScaleInvitations` |
| Invitations from    | 2-3 `circles_query` + `circles_getAvatarInfoBatch` + client filtering                      | `circles_getInvitationsFrom` (single call)                                       |
| Invitation origin   | Manual queries across 4+ tables                                                             | `circles_getInvitationOrigin`                                                    |
| Activity feeds      | `circles_events` + `getProfileByAddress` batch                                              | `circles_getTransactionHistoryEnriched`                                          |
| Transaction lists   | `circles_query` on transfer views                                                           | `circles_getTransactionHistory` (SDK-calculated circle amounts)                  |
| Group discovery     | Manual SQL or `circles_query`                                                               | `circles_findGroups`, `circles_getGroupMembers`, `circles_getGroupMemberships`   |
| Profile search      | `circles_searchProfiles` (text only)                                                        | `circles_searchProfileByAddressOrName` (address prefix + full-text, cursor pagination) |

---

## Profile & dashboard surfaces

### Before

```ts
const [avatar, profile, v1, v2, trusts] = await Promise.all([
  rpc.circles.getAvatarInfo(address),
  rpc.circles.getProfileByAddress(address),
  rpc.circles.getTotalBalance(address, 1),
  rpc.circlesV2.getTotalBalance(address, 2),
  rpc.circles.getTrustRelations(address),
])
```

### After

```ts
const view = await rpc.sdk.getProfileView(address)

console.log(view.avatarInfo?.name)
console.log(view.profile?.name, view.profile?.description)
console.log(view.trustStats.trustsCount)
console.log(view.v1Balance, view.v2Balance)
```

---

## Trust relations & invitations

### Aggregated trust lists

- `circles_getAggregatedTrustRelationsEnriched` categorizes relations into `mutual`, `trusts`, and `trustedBy` arrays and preloads `AvatarInfo` for each address.
- Use `circles_getAggregatedTrustRelations` when you additionally need timestamps/expiry times.
- `circles_getTrustNetworkSummary` exposes direct counts + mutual reach for lightweight stats cards.

### Invitation helpers

```ts
const inviters = await rpc.sdk.getValidInviters(address, "25")

inviters.results.forEach(({ address: inviter, balance, avatarInfo }) => {
  console.log(inviter, balance, avatarInfo?.name)
})
```

`minimumBalance` is optional (pass `null` to list every counterparty that trusts the user).

### All invitation types

`circles_getAllInvitations` aggregates invitations from all three sources in a single call:

1. **Trust-based** – avatars that trust you and have sufficient CRC balance
2. **Escrow-based** – CRC tokens escrowed for you in the InvitationEscrow contract
3. **At-scale** – pre-created accounts via the referral system

```ts
const allInvites = await rpc.invitation.getAllInvitations(address, "96");

console.log(`Trust invites: ${allInvites.trustInvitations.length}`);
console.log(`Escrow invites: ${allInvites.escrowInvitations.length}`);
console.log(`At-scale invites: ${allInvites.atScaleInvitations.length}`);

// Each invitation type has specific fields:
allInvites.trustInvitations.forEach(inv => {
  console.log(`Trust from ${inv.address}, balance: ${inv.balance}`);
});

allInvites.escrowInvitations.forEach(inv => {
  console.log(`Escrow from ${inv.address}, amount: ${inv.escrowedAmount}, days: ${inv.escrowDays}`);
});

allInvites.atScaleInvitations.forEach(inv => {
  console.log(`At-scale account: ${inv.address}, created at block: ${inv.blockNumber}`);
});
```

### Individual invitation type endpoints

When you only need one type, use the dedicated endpoints to avoid fetching all three:

```ts
// Trust invitations only
const trustInvites = await rpc.invitation.getTrustInvitations(address, "50");

// Escrow invitations only (server-side filters redeemed/revoked/refunded)
const escrowInvites = await rpc.invitation.getEscrowInvitations(address);

// At-scale invitations only
const atScaleInvites = await rpc.invitation.getAtScaleInvitations(address);
```

### Invitations sent by an avatar

Find who this avatar has invited (accepted or pending):

```ts
// Accepted: accounts that registered using this avatar as inviter
const accepted = await rpc.invitation.getInvitationsFrom(address, true);
accepted.results.forEach(r => {
  console.log(`${r.address} accepted, registered at block ${r.blockNumber}`);
});

// Pending: accounts trusted by this avatar that haven't registered yet
const pending = await rpc.invitation.getInvitationsFrom(address, false);
pending.results.forEach(r => {
  console.log(`${r.address} pending`);
});
```

### Invitation origin

To find out how a registered user was invited, use `circles_getInvitationOrigin`:

```ts
const origin = await rpc.invitation.getInvitationOrigin(address);

// Returns one of four invitation types:
// - "v1_signup" – V1 self-signup (no inviter required)
// - "v2_standard" – Standard V2 invitation via trust
// - "v2_escrow" – V2 invitation via escrowed CRC
// - "v2_at_scale" – V2 invitation via at-scale referral system

console.log(origin?.invitationType);
console.log(origin?.inviter);          // Who invited them
console.log(origin?.proxyInviter);     // For at-scale: the proxy inviter
console.log(origin?.escrowAmount);     // For escrow: amount escrowed
console.log(origin?.blockNumber);
console.log(origin?.transactionHash);

// Shorthand for just the inviter address:
const inviter = await rpc.invitation.getInvitedBy(address);
```

---

## Transaction history

### Enriched feed

- `circles_getTransactionHistoryEnriched(address, fromBlock, toBlock?, limit?, cursor?)`
- Returns `PagedResponse<EnrichedTransaction>` with:
  - `event`: raw transfer or trust event payload
  - `participants`: dictionary keyed by address containing `{ avatarInfo, profile }`

Use this for UI components that need names/avatars alongside each transfer.

### Lightweight list

- `circles_getTransactionHistory(address, limit?, cursor?)`
- Provides SDK-computed `value`, `circles`, `crc`, `staticCircles`, etc. All numeric fields are returned as strings.

### Raw events (paginated)

- `circles_events(address?, fromBlock?, toBlock?, eventTypes?, filterPredicates?, sortAscending?, limit?, cursor?)`
- Now returns `PagedEventsResponse` with:
  - `events`: array of event objects
  - `hasMore`: boolean indicating more results available
  - `nextCursor`: Base64 cursor for next page

```ts
// Paginate through all events for an address
let cursor: string | null = null;
do {
  const page = await rpc.query.events(address, fromBlock, null, null, null, false, 100, cursor);
  console.log(page.events);
  cursor = page.nextCursor;
} while (cursor);
```

### Pagination format

All transaction/group/event pagination cursors are Base64-encoded strings of `blockNumber:transactionIndex:logIndex` (plus `:batchIndex` for transaction history). Always treat `nextCursor` as opaque and echo it back unchanged.

---

## Groups & memberships

```ts
const groups = await rpc.group.findGroups(50)
const members = await rpc.group.getGroupMembers(groupAddress, 100, groups.nextCursor)
const memberships = await rpc.group.getGroupMemberships(memberAddress)
```

- Every response is a `PagedResponse` – check `hasMore` and send `nextCursor` to continue.
- `getGroupMembers`/`getGroupMemberships` now return canonical rows: block/timestamp/tx/log hashes + expiry time.

---

## Search improvements

`circles_searchProfileByAddressOrName(query, limit?, cursor?, types?)` automatically decides whether to run an address-prefix query or a full-text search. Uses **cursor-based pagination** (not offset).

```ts
const search = await rpc.sdk.searchProfileByAddressOrName("0xde37", 5)

// Paginate through results
const page1 = await rpc.sdk.searchProfileByAddressOrName("berlin", 10);
const page2 = await rpc.sdk.searchProfileByAddressOrName("berlin", 10, page1.nextCursor);

// Filter by avatar type
const humans = await rpc.profile.searchByAddressOrName(
  "berlin",
  10,
  null,
  ["CrcV2_RegisterHuman"]
)
```

`results` is an array of profile JSON blobs (same shape as `getProfileByAddress`). Response includes `hasMore` and `nextCursor` for pagination.

---

## Complete RPC method reference

### SDK Enablement (aggregation endpoints)
| Method | Parameters | Returns |
|--------|-----------|---------|
| `circles_getProfileView` | `address` | `ProfileView` |
| `circles_getTrustNetworkSummary` | `address, maxDepth?` | `TrustNetworkSummary` |
| `circles_getAggregatedTrustRelationsEnriched` | `address` | `AggregatedTrustRelation[]` |
| `circles_getValidInviters` | `address, minimumBalance?` | `ValidInvitersResponse` |
| `circles_getTransactionHistoryEnriched` | `address, fromBlock?, toBlock?, limit?, cursor?` | `PagedResponse<EnrichedTransaction>` |
| `circles_searchProfileByAddressOrName` | `query, limit?, cursor?, types?` | `ProfileSearchResponse` |

### Invitation endpoints
| Method | Parameters | Returns |
|--------|-----------|---------|
| `circles_getAllInvitations` | `address, minimumBalance?` | `AllInvitationsResponse` |
| `circles_getTrustInvitations` | `address, minimumBalance?` | `TrustInvitation[]` |
| `circles_getEscrowInvitations` | `address` | `EscrowInvitation[]` |
| `circles_getAtScaleInvitations` | `address` | `AtScaleInvitation[]` |
| `circles_getInvitationsFrom` | `address, accepted?` | `InvitationsFromResponse` |
| `circles_getInvitationOrigin` | `address` | `InvitationOriginResponse?` |

### Paginated list endpoints
| Method | Parameters | Returns |
|--------|-----------|---------|
| `circles_findGroups` | `limit?, cursor?` | `PagedResponse<GroupRow>` |
| `circles_getGroupMembers` | `group, limit?, cursor?` | `PagedResponse<GroupMembershipRow>` |
| `circles_getGroupMemberships` | `address, limit?, cursor?` | `PagedResponse<GroupMembershipRow>` |
| `circles_getTransactionHistory` | `address, limit?, cursor?` | `PagedResponse<TransactionHistoryRow>` |
| `circles_getTokenHolders` | `token, limit?, cursor?` | `PagedResponse<TokenHolderRow>` |

---

## WebSocket endpoints

| Path | Purpose | Method |
|------|---------|--------|
| `/ws/subscribe` | Circles event stream (PostgreSQL LISTEN/NOTIFY) | `circles_subscribe` |
| `/ws/chain` | Ethereum subscriptions (via Nethermind) | `eth_subscribe` (`newHeads`, `logs`, `newPendingTransactions`) |

```ts
// Circles events
const circlesWs = new WebSocket('wss://rpc.circlesubi.network/ws/subscribe');
circlesWs.send(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'circles_subscribe', params: [] }));

// Ethereum new blocks
const chainWs = new WebSocket('wss://rpc.circlesubi.network/ws/chain');
chainWs.send(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_subscribe', params: ['newHeads'] }));
```

---

## Checklist

- [x] Replace multi-call profile code with `getProfileView` when possible.
- [x] Adopt `PagedResponse` helpers (`results`, `hasMore`, `nextCursor`).
- [x] Treat pagination cursors as opaque Base64 strings.
- [x] Update invitation flows to use `getValidInviters` for balance-filtered lists.
- [x] Use `getAllInvitations()` to show all invitation types (trust, escrow, at-scale).
- [x] Use individual invitation endpoints when only one type is needed.
- [x] Use `getInvitationsFrom()` for accepted/pending invitation tracking.
- [x] Use `circles_getInvitationOrigin` to determine how a user was invited.
- [x] Switch group/transaction list views to `circles_findGroups` + `circles_getGroupMembers` + `circles_getTransactionHistory`.
- [x] Use `searchProfileByAddressOrName` with cursor pagination for address autocomplete inputs.
- [x] Update `circles_events` usage to handle paginated `PagedEventsResponse` (returns `events`, `hasMore`, `nextCursor`).

All items ship in `sdk-v2` (packages `rpc`, `types`, `sdk`). Following the checklist keeps SDK consumers API-compatible before and after the RPC refactor.
