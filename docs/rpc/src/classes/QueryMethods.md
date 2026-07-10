[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / QueryMethods

# Class: QueryMethods

Defined in: [packages/rpc/src/methods/query.ts:8](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/query.ts#L8)

Query and table RPC methods

## Constructors

### Constructor

```ts
new QueryMethods(client): QueryMethods;
```

Defined in: [packages/rpc/src/methods/query.ts:9](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/query.ts#L9)

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

Defined in: [packages/rpc/src/methods/query.ts:45](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/query.ts#L45)

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

Defined in: [packages/rpc/src/methods/query.ts:61](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/query.ts#L61)

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
   fromBlock, 
   toBlock, 
   eventTypes, 
   address, 
includeTransactionData): Promise<T[]>;
```

Defined in: [packages/rpc/src/methods/query.ts:86](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/query.ts#L86)

Query events of specific types within a block range

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### fromBlock

Starting block number (null for genesis)

`number` | `null`

##### toBlock

Ending block number (null for latest)

`number` | `null`

##### eventTypes

Array of event types to filter (null for all)

`EventType`[] | `null`

##### address

Optional address filter

`string` | `null`

##### includeTransactionData

`boolean` = `false`

Whether to include transaction data

#### Returns

`Promise`\<`T`[]\>

Array of events

#### Example

```typescript
const events = await rpc.query.events(
  38000000,
  null,
  ['CrcV1_Trust'],
  null,
  false
);
```
