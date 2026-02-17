[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / QueryMethods

# Class: QueryMethods

Defined in: [packages/rpc/src/methods/query.ts:26](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/query.ts#L26)

Query and table RPC methods

## Constructors

### Constructor

```ts
new QueryMethods(client): QueryMethods;
```

Defined in: [packages/rpc/src/methods/query.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/query.ts#L27)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`QueryMethods`

## Methods

### query()

```ts
query<T>(params): Promise<T[]>;
```

Defined in: [packages/rpc/src/methods/query.ts:63](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/query.ts#L63)

Query tables with filters

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### params

`QueryParams`

Query parameters including namespace, table, columns, filters, and ordering

#### Returns

`Promise`\<`T`[]\>

Array of query results

#### Example

```typescript
const results = await rpc.query.query({
  Namespace: 'V_CrcV2',
  Table: 'TrustRelations',
  Columns: [],
  Filter: [{
    Type: 'Conjunction',
    ConjunctionType: 'Or',
    Predicates: [
      {
        Type: 'FilterPredicate',
        FilterType: 'Equals',
        Column: 'truster',
        Value: '0xae3a29a9ff24d0e936a5579bae5c4179c4dff565'
      },
      {
        Type: 'FilterPredicate',
        FilterType: 'Equals',
        Column: 'trustee',
        Value: '0xae3a29a9ff24d0e936a5579bae5c4179c4dff565'
      }
    ]
  }],
  Order: []
});
```

***

### tables()

```ts
tables(): Promise<TableInfo[]>;
```

Defined in: [packages/rpc/src/methods/query.ts:87](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/query.ts#L87)

Return all available namespaces and tables which can be queried

#### Returns

`Promise`\<`TableInfo`[]\>

Array of table information

#### Example

```typescript
const tables = await rpc.query.tables();
console.log(tables);
```

***

### events()

```ts
events<T>(
   address, 
   fromBlock, 
   toBlock, 
   eventTypes, 
   filterPredicates, 
   sortAscending, 
   limit, 
cursor): Promise<PagedEventsResponse<T>>;
```

Defined in: [packages/rpc/src/methods/query.ts:125](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/query.ts#L125)

Query events of specific types within a block range with pagination support.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### address

Optional address filter (null for all addresses)

`string` | `null`

##### fromBlock

Starting block number (null for genesis)

`number` | `null`

##### toBlock

Ending block number (null for latest)

`number` | `null`

##### eventTypes

Array of event types to filter (null for all)

`EventType`[] | `null`

##### filterPredicates

Advanced filter predicates (null for none)

`FilterPredicate`[] | `null`

##### sortAscending

`boolean` = `false`

Sort order (default: false = descending)

##### limit

`number` = `100`

Maximum events to return (default: 100, max: 1000)

##### cursor

Pagination cursor from previous response (null for first page)

`string` | `null`

#### Returns

`Promise`\<`PagedEventsResponse`\<`T`\>\>

Paginated events response with events array, hasMore flag, and nextCursor

#### Example

```typescript
// Basic usage - get first page of events for an address
const result = await rpc.query.events(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  38000000,
  null,
  ['CrcV1_Trust']
);
console.log(result.events);
console.log(result.hasMore, result.nextCursor);

// Paginate through results
let cursor: string | null = null;
do {
  const page = await rpc.query.events(address, fromBlock, null, null, null, false, 100, cursor);
  console.log(page.events);
  cursor = page.nextCursor;
} while (cursor);
```
