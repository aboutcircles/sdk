[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / PagedQuery

# Class: PagedQuery\<TRow\>

Defined in: [packages/rpc/src/pagedQuery.ts:50](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/pagedQuery.ts#L50)

A class for querying Circles RPC nodes with cursor-based pagination.
Supports both event-based pagination (default) and custom cursor pagination (for view tables).

## Example

```typescript
// Event-based pagination
const query = new PagedQuery<GroupMembershipRow>(rpc.client, {
  namespace: 'V_CrcV2',
  table: 'GroupMemberships',
  sortOrder: 'DESC',
  columns: ['blockNumber', 'transactionIndex', 'logIndex', 'group', 'member'],
  filter: [{ Type: 'FilterPredicate', FilterType: 'Equals', Column: 'group', Value: '0x...' }],
  limit: 100
});

// Custom cursor pagination (for view tables)
const viewQuery = new PagedQuery<GroupTokenHolderRow>(rpc.client, {
  namespace: 'V_CrcV2',
  table: 'GroupTokenHoldersBalance',
  sortOrder: 'ASC',
  columns: ['group', 'holder', 'totalBalance'],
  cursorColumns: [{ name: 'holder', sortOrder: 'ASC' }],
  filter: [{ Type: 'FilterPredicate', FilterType: 'Equals', Column: 'group', Value: '0x...' }],
  limit: 100
});
```

## Type Parameters

### TRow

`TRow` = `any`

The type of the rows returned by the query.

## Constructors

### Constructor

```ts
new PagedQuery<TRow>(
   client, 
   params, 
rowTransformer?): PagedQuery<TRow>;
```

Defined in: [packages/rpc/src/pagedQuery.ts:67](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/pagedQuery.ts#L67)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

##### params

`PagedQueryParams` & `object`

##### rowTransformer?

(`row`) => `TRow`

#### Returns

`PagedQuery`\<`TRow`\>

## Accessors

### currentPage

#### Get Signature

```ts
get currentPage(): 
  | FlexiblePagedResult<TRow>
  | undefined;
```

Defined in: [packages/rpc/src/pagedQuery.ts:61](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/pagedQuery.ts#L61)

##### Returns

  \| [`FlexiblePagedResult`](../interfaces/FlexiblePagedResult.md)\<`TRow`\>
  \| `undefined`

## Methods

### queryNextPage()

```ts
queryNextPage(): Promise<boolean>;
```

Defined in: [packages/rpc/src/pagedQuery.ts:271](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/pagedQuery.ts#L271)

Queries the next page of results.

#### Returns

`Promise`\<`boolean`\>

True if results were found, false otherwise

***

### reset()

```ts
reset(): void;
```

Defined in: [packages/rpc/src/pagedQuery.ts:304](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/pagedQuery.ts#L304)

Resets the query to start from the beginning

#### Returns

`void`
