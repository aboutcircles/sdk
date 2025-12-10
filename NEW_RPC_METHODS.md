# New RPC Methods Migration Guide

This guide explains how to update existing Circles SDK integrations to the new RPC host that ships with the standalone Pathfinder/RPC refactor. It focuses on three themes:

1. **Fewer round-trips** – dedicated aggregation endpoints replace bundles of legacy calls.
2. **Cursor-based pagination** – every list method now returns `results`, `hasMore`, and `nextCursor`.
3. **SDK ergonomics** – the RPC client exposes typed helpers that map 1:1 to the new endpoints.

---

## At-a-glance mapping

| Use Case          | Legacy Flow                                                                                 | Replacement                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Profile screen    | `getAvatarInfo` + `getProfileByAddress` + two `getTotalBalance` calls + `getTrustRelations` | `circles_getProfileView` (single call)                                           |
| Trust graph tiles | Fetch trust matrix + manual avatar lookups                                                  | `circles_getAggregatedTrustRelationsEnriched` + `circles_getTrustNetworkSummary` |
| Invitation flows  | `getTrustRelations` + `getTotalBalance` per counterparty                                    | `circles_getValidInviters`                                                       |
| Activity feeds    | `circles_events` + `getProfileByAddress` batch                                              | `circles_getTransactionHistoryEnriched`                                          |
| Transaction lists | `circles_query` on transfer views                                                           | `circles_getTransactionHistory` (SDK-calculated circle amounts)                  |
| Group discovery   | Manual SQL or `circles_query`                                                               | `circles_findGroups`, `circles_getGroupMembers`, `circles_getGroupMemberships`   |
| Profile search    | `circles_searchProfiles` (text only)                                                        | `circles_searchProfileByAddressOrName` (address prefix + full-text)              |

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

inviters.validInviters.forEach(({ address: inviter, balance, avatarInfo }) => {
  console.log(inviter, balance, avatarInfo?.name)
})
```

`minimumBalance` is optional (pass `null` to list every counterparty that trusts the user).

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

### Pagination format

All transaction/group pagination cursors are Base64-encoded strings of `blockNumber:transactionIndex:logIndex` (plus `:batchIndex` for transaction history). Always treat `nextCursor` as opaque and echo it back unchanged.

---

## Groups & memberships

```ts
const groups = await rpc.sdk.findGroups(50, { nameStartsWith: "Com" })
const members = await rpc.sdk.getGroupMembers(
  groupAddress,
  100,
  groups.nextCursor
)
const memberships = await rpc.sdk.getGroupMemberships(memberAddress)
```

- Every response is a `PagedResponse` – check `hasMore` and send `nextCursor` to continue.
- `getGroupMembers`/`getGroupMemberships` now return canonical rows: block/timestamp/tx/log hashes + expiry time. Historical `memberType`/`groupInfo` must be re-derived client-side.

---

## Search improvements

`circles_searchProfileByAddressOrName(query, limit?, offset?, types?)` automatically decides whether to run an address-prefix query or a full-text search.

```ts
const search = await rpc.sdk.searchProfileByAddressOrName("0xde37", 5)
const suggestions = await rpc.sdk.searchProfileByAddressOrName(
  "berlin",
  10,
  0,
  ["CrcV2_RegisterHuman"]
)
```

`results` is an array of raw profile JSON blobs (same shape as `getProfileByAddress`).

---

## Checklist

- [x] Replace multi-call profile code with `getProfileView` when possible.
- [x] Adopt `PagedResponse` helpers (`results`, `hasMore`, `nextCursor`).
- [x] Treat pagination cursors as opaque Base64 strings.
- [x] Update invitation flows to use `getValidInviters` for balance-filtered lists.
- [x] Switch group/transaction list views to `circles_findGroups` + `circles_getGroupMembers` + `circles_getTransactionHistory`.
- [x] Use `searchProfileByAddressOrName` for address autocomplete inputs.

All items now ship in `sdk-v2` (packages `rpc`, `sdk`, and supporting docs/examples). Recent additions also brought in the remaining SDK enablement endpoints—`circles_getTrustNetworkSummary`, `circles_getAggregatedTrustRelationsEnriched`, `circles_getTransactionHistoryEnriched`, `circles_getTokenHolders`, and `circles_searchProfileByAddressOrName`—so the migration guide reflects the full surface of the current implementation.

Following the checklist keeps SDK consumers API-compatible before and after the RPC refactor.
