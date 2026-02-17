# SDK Type vs RPC Host Response Mismatches

Discovered during integration testing against staging (`https://staging.circlesubi.network/`).
Date: 2026-02-17.

## Type Mismatches — ALL RESOLVED (commit `706c219`)

### 1. ~~`NetworkSnapshot` — `circles_getNetworkSnapshot`~~ FIXED
- ~~**SDK type**: `{blockNumber, timestamp, trustRelations: TrustRelation[], balances: TokenBalance[]}`~~
- **RPC returns**: `{BlockNumber, Addresses: string[]}` (PascalCase, no trustRelations/balances)
- **Fix applied**: Updated `NetworkSnapshot` type to `{BlockNumber: number, Addresses: string[]}`

### 2. ~~`ValidInvitersResponse` — `circles_getValidInviters`~~ FIXED
- ~~**SDK type**: `{address, validInviters: InviterInfo[]}`~~
- **RPC returns**: `{address, results: [{address, balance, avatarInfo}]}`
- **Fix applied**: Renamed `validInviters` → `results`

### 3. ~~`AggregatedTrustRelationsResponse` — `circles_getAggregatedTrustRelationsEnriched`~~ FIXED
- ~~**SDK type**: `{address, mutual, trusts, trustedBy}`~~
- **RPC returns**: `{address, results: [{address, relationType, avatarInfo?}]}`
- **Fix applied**: Changed to flat `{address, results: TrustRelationInfo[]}`

### 4. ~~`TokenInfo` — `circles_getTokenInfoBatch`~~ FIXED
- ~~**SDK type**: `{token: Address, blockNumber, timestamp, ...}`~~
- **RPC returns**: `{tokenAddress: Address, tokenOwner, tokenType, version}`
- **Fix applied**: Renamed `token` → `tokenAddress`, removed absent event fields

### 5. ~~`EnrichedTransaction` — `circles_getTransactionHistoryEnriched`~~ FIXED
- ~~**SDK type**: flat `{from, to, circles, attoCircles, ...}`~~
- **RPC returns**: `{transactionHash, event: {...}, participants: {...}}`
- **Fix applied**: Updated to nested `{event, participants}` structure

### 6. ~~`TableInfo` — `circles_tables`~~ FIXED
- ~~**SDK type**: `{Namespace, Table, Columns: [{Name, Type}]}`~~
- **RPC returns**: `[{namespace, tables: [{table, columns: [{column, type}]}]}]`
- **Fix applied**: New nested structure with `TableDefinition` + `TableColumnInfo`

### 7. ~~`QueryMethods.query()` — `circles_query`~~ FIXED
- ~~**SDK declares**: returns `T[]` but actually returned raw `{columns, rows}`~~
- **Fix applied**: Added column-to-object transformation in `query()` method

### 8. ~~`AllInvitationsResponse` — `circles_getAllInvitations`~~ FIXED
- ~~**SDK type**: included `all: Invitation[]`~~
- **RPC returns**: `{trustInvitations, escrowInvitations, atScaleInvitations}` (no `all`)
- **Fix applied**: Removed `all` field from type

### 9. ~~`SdkMethods.getAggregatedTrustRelations()` — wrong return type~~ FIXED
- ~~**SDK declares**: `AggregatedTrustRelationsResponse`~~
- **Actually returns**: `AggregatedTrustRelation[]` (flat array)
- **Fix applied**: Return type changed to `AggregatedTrustRelation[]`

### 10. ~~`ProfileSearchResponse.totalCount`~~ FIXED
- ~~**SDK type**: included `totalCount: number`~~
- **RPC returns**: no `totalCount`
- **Fix applied**: Removed `totalCount` from type

### Bonus: `InvitationMethods.getInvitedBy()` — FIXED
- **Bug**: Method typed `circles_query` response as `InviterRow[]` but RPC returns `{columns, rows}`. Silently returned `undefined` for all addresses.
- **Fix applied**: Properly transforms `CirclesQueryResponse` via `transformQueryResponse()`

## RPC Host Bugs — ALL RESOLVED

### ~~`circles_searchProfileByAddressOrName` offset parameter ignored~~ FIXED (SDK-side, commit `4d37b6e`)
- **Not an RPC bug** — the RPC uses cursor-based pagination (`string? cursor`), but SDK was sending `offset: number`
- **Fix applied**: Changed `offset: number` → `cursor?: string | null` in `profile.ts` and `sdk.ts`
- Added `hasMore`/`nextCursor` to `ProfileSearchResponse`, pagination now works correctly

## SDK Methods That Could Benefit From Dedicated RPC Methods — MOSTLY RESOLVED

### ~~`invitation.getInvitedBy()` — 1 `circles_query` call~~ FIXED (commit `67ccc88`)
Now uses `circles_getInvitationOrigin` (already existed, 1 round-trip with rich response).

### ~~`invitation.getEscrowInvitations()` — 4 `circles_query` calls + 1 `circles_getAvatarInfoBatch`~~ FIXED (commit `67ccc88`)
Now uses `circles_getEscrowInvitations` (new endpoint, 1 round-trip with server-side SQL filtering).

### ~~`invitation.getAtScaleInvitations()` — 2 `circles_query` calls~~ FIXED (commit `67ccc88`)
Now uses `circles_getAtScaleInvitations` (new endpoint, 1 round-trip).

### `invitation.getInvitationsFrom()` — 2 `circles_query` calls + 1 `circles_getAvatarInfoBatch` (OPEN)
For accepted: queries RegisterHuman. For pending: queries TrustRelations + getAvatarInfoBatch + client-side filtering. A dedicated `circles_getInvitationsFrom(address, accepted)` would consolidate.

**New dedicated RPC endpoints added** (RPC commit `4ca7a7ec`):
- `circles_getTrustInvitations(address, minimumBalance?)` — exposed private helper
- `circles_getEscrowInvitations(address)` — exposed private helper
- `circles_getAtScaleInvitations(address)` — exposed private helper
