# SDK Type Alignment — Breaking Changes Summary

**Commit**: `706c219` on `feature/new_rpc_methods`
**Date**: 2026-02-17
**Scope**: `@aboutcircles/sdk-types` + `@aboutcircles/sdk-rpc`

## Why

Integration testing against staging revealed 10 type definitions that didn't match actual RPC host responses. SDK consumers were either getting runtime errors (accessing undefined properties) or using `as any` workarounds. This commit aligns all types with what the RPC actually returns.

## Breaking Changes

### 1. `NetworkSnapshot` — structure completely changed

| Before | After |
|--------|-------|
| `blockNumber: number` | `BlockNumber: number` |
| `timestamp: number` | _(removed)_ |
| `trustRelations: TrustRelation[]` | _(removed)_ |
| `balances: TokenBalance[]` | _(removed)_ |
| — | `Addresses: string[]` |

**Impact**: Any code accessing `snapshot.blockNumber` or `snapshot.trustRelations` breaks.
**Migration**: Use `snapshot.BlockNumber` and `snapshot.Addresses`.
**Who**: Anyone using `rpc.avatar.getNetworkSnapshot()`.

### 2. `ValidInvitersResponse` — field renamed

| Before | After |
|--------|-------|
| `validInviters: InviterInfo[]` | `results: InviterInfo[]` |

**Impact**: `response.validInviters` → `response.results`.
**Who**: Anyone using `rpc.trust.getValidInviters()`, `rpc.sdk.getValidInviters()`, or `rpc.invitation.getValidInviters()`.

### 3. `AggregatedTrustRelationsResponse` — pre-categorized → flat list

| Before | After |
|--------|-------|
| `mutual: TrustRelationInfo[]` | _(removed)_ |
| `trusts: TrustRelationInfo[]` | _(removed)_ |
| `trustedBy: TrustRelationInfo[]` | _(removed)_ |
| — | `results: TrustRelationInfo[]` |

**Impact**: Must filter `results` by `relationType` client-side.
**Migration**:
```typescript
const mutual = response.results.filter(r => r.relationType === 'mutual');
const trusts = response.results.filter(r => r.relationType === 'trusts');
const trustedBy = response.results.filter(r => r.relationType === 'trustedBy');
```
**Who**: Anyone using `rpc.trust.getAggregatedTrustRelationsEnriched()`.

### 4. `TokenInfo` — field renamed + fields removed

| Before | After |
|--------|-------|
| `token: Address` | `tokenAddress: Address` |
| `blockNumber: number` | _(removed)_ |
| `timestamp: number` | _(removed)_ |
| `transactionIndex: number` | _(removed)_ |
| `logIndex: number` | _(removed)_ |
| `transactionHash: string` | _(removed)_ |

**Impact**: `info.token` → `info.tokenAddress`. Event metadata fields no longer available from this endpoint.
**Who**: Anyone using `rpc.token.getTokenInfo()` or `rpc.token.getTokenInfoBatch()`.

### 5. `EnrichedTransaction` — flat → nested structure

| Before | After |
|--------|-------|
| `from: Address` | _(inside `event`)_ |
| `to: Address` | _(inside `event`)_ |
| `circles: string` | _(inside `event`)_ |
| `value: string` | _(inside `event`)_ |
| `fromProfile?: Profile` | _(inside `participants`)_ |
| `toProfile?: Profile` | _(inside `participants`)_ |
| — | `event: Record<string, unknown>` |
| — | `participants: Record<string, ParticipantInfo>` |

**Impact**: All flat field access (`tx.from`, `tx.circles`) breaks. Data now in `tx.event` and `tx.participants`.
**Migration**:
```typescript
const from = tx.event.from as string;
const profile = tx.participants[from]?.profile;
```
**Who**: Anyone using `rpc.transaction.getTransactionHistoryEnriched()` or `rpc.sdk.getTransactionHistoryEnriched()`.

### 6. `TableInfo` — PascalCase flat → lowercase nested

| Before | After |
|--------|-------|
| `Namespace: string` | `namespace: string` |
| `Table: string` | _(removed — now array)_ |
| `Columns: {Name, Type}[]` | _(removed — now nested)_ |
| — | `tables: TableDefinition[]` |

New types added: `TableDefinition` (`{table, columns}`), `TableColumnInfo` (`{column, type}`).

**Impact**: Complete restructure. Each `TableInfo` is a namespace containing multiple tables.
**Migration**:
```typescript
for (const ns of tables) {
  for (const tbl of ns.tables) {
    console.log(`${ns.namespace}.${tbl.table}: ${tbl.columns.length} cols`);
  }
}
```
**Who**: Anyone using `rpc.query.tables()`.

### 7. `ProfileSearchResponse` — `totalCount` removed

| Before | After |
|--------|-------|
| `totalCount: number` | _(removed)_ |

**Impact**: `response.totalCount` no longer available (RPC never returned it).
**Who**: Anyone using `rpc.profile.searchByAddressOrName()` or `rpc.sdk.searchProfileByAddressOrName()`.

### 8. `AllInvitationsResponse` — `all` field removed

| Before | After |
|--------|-------|
| `all: Invitation[]` | _(removed)_ |

**Impact**: Must combine arrays client-side if needed.
**Migration**:
```typescript
const all = [
  ...response.trustInvitations,
  ...response.escrowInvitations,
  ...response.atScaleInvitations
];
```
**Who**: Anyone using `rpc.invitation.getAllInvitations()`.

### 9. `SdkMethods.getAggregatedTrustRelations()` — return type changed

| Before | After |
|--------|-------|
| `Promise<AggregatedTrustRelationsResponse>` | `Promise<AggregatedTrustRelation[]>` |

**Impact**: Returns flat array of `{subjectAvatar, relation, objectAvatar}` instead of `{address, mutual, trusts, trustedBy}`.
**Who**: Anyone using `rpc.sdk.getAggregatedTrustRelations()`.

### 10. `QueryMethods.query()` — now transforms response

| Before | After |
|--------|-------|
| Returns raw `{columns, rows}` | Returns `T[]` (array of objects) |

**Impact**: Previously returned `CirclesQueryResponse` despite typing as `T[]`. Now actually transforms columns/rows into typed objects as documented.
**Who**: Anyone using `rpc.query.query()`. If you were using `(result as any).columns` / `(result as any).rows`, you now get proper objects instead.

## Bug Fixes

### `InvitationMethods.getInvitedBy()` — was silently broken

The method called `circles_query` expecting `InviterRow[]` but the RPC returns `{columns, rows}`. The response didn't have `.length`, so the check `results.length > 0` was always falsy, and the method always returned `undefined`. Now properly transforms the query response.

## Non-Breaking

- `EnrichedTransactionEvent` type removed (was never exported or used)
- New types exported: `TableColumnInfo`, `TableDefinition`

## Consumer Impact Assessment

| Consumer | Impact Level | Actions Needed |
|----------|-------------|----------------|
| **Circles app frontend** | HIGH | Update `EnrichedTransaction`, `TokenInfo`, `ValidInvitersResponse` field access |
| **Circles SDK (`packages/sdk`)** | LOW | `AllInvitationsResponse.all` removed, but `packages/sdk/src/types.ts` only references the response type (doesn't access `.all`) |
| **Third-party integrators** | MEDIUM | Any direct type imports need updating |
| **Internal tests** | DONE | Integration tests already updated, all 52 pass |

## Remaining Issues (not fixed here)

- **RPC bug**: `circles_searchProfileByAddressOrName` ignores `offset` parameter — pagination broken
- **Optimization opportunities**: Several invitation methods use 2-5 round-trips where dedicated RPC methods would be 1 (tracked in task #3)
- **docs/_media stale**: Example files contain old type shapes (tracked in task #2)
