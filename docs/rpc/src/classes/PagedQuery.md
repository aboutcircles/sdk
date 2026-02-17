[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / PagedQuery

# Class: PagedQuery\<TRow\>

Defined in: [packages/rpc/src/pagedQuery.ts:42](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/pagedQuery.ts#L42)

A class for querying Circles RPC nodes with server-side cursor-based pagination.
Uses circles_paginated_query which returns {columns, rows, hasMore, nextCursor}.

## Example

```typescript
const query = new PagedQuery<GroupMembershipRow>(rpc.client, {
  namespace: 'V_CrcV2',
  table: 'GroupMemberships',
  sortOrder: 'DESC',
  columns: ['blockNumber', 'transactionIndex', 'logIndex', 'group', 'member'],
  filter: [{ Type: 'FilterPredicate', FilterType: 'Equals', Column: 'group', Value: '0x...' }],
  limit: 100
});

while (await query.queryNextPage()) {
  console.log(query.currentPage!.results);
  if (!query.currentPage!.hasMore) break;
}
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

Defined in: [packages/rpc/src/pagedQuery.ts:59](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/pagedQuery.ts#L59)

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

Defined in: [packages/rpc/src/pagedQuery.ts:53](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/pagedQuery.ts#L53)

##### Returns

  \| [`FlexiblePagedResult`](../interfaces/FlexiblePagedResult.md)\<`TRow`\>
  \| `undefined`

## Methods

### queryNextPage()

```ts
queryNextPage(): Promise<boolean>;
```

Defined in: [packages/rpc/src/pagedQuery.ts:129](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/pagedQuery.ts#L129)

Queries the next page of results using server-side cursor pagination.

#### Returns

`Promise`\<`boolean`\>

True if results were found, false otherwise

***

### reset()

```ts
reset(): void;
```

Defined in: [packages/rpc/src/pagedQuery.ts:166](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/pagedQuery.ts#L166)

Resets the query to start from the beginning

#### Returns

`void`
