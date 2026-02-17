[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / Cursor

# Interface: Cursor

Defined in: [packages/types/src/query.ts:115](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L115)

A cursor is a sortable unique identifier for a specific log entry.
Used to paginate through query results efficiently.

## Extends

- [`EventRow`](EventRow.md)

## Properties

### blockNumber

```ts
blockNumber: number;
```

Defined in: [packages/types/src/query.ts:104](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L104)

#### Inherited from

[`EventRow`](EventRow.md).[`blockNumber`](EventRow.md#blocknumber)

***

### transactionIndex

```ts
transactionIndex: number;
```

Defined in: [packages/types/src/query.ts:105](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L105)

#### Inherited from

[`EventRow`](EventRow.md).[`transactionIndex`](EventRow.md#transactionindex)

***

### logIndex

```ts
logIndex: number;
```

Defined in: [packages/types/src/query.ts:106](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L106)

#### Inherited from

[`EventRow`](EventRow.md).[`logIndex`](EventRow.md#logindex)

***

### batchIndex?

```ts
optional batchIndex: number;
```

Defined in: [packages/types/src/query.ts:107](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L107)

#### Inherited from

[`EventRow`](EventRow.md).[`batchIndex`](EventRow.md#batchindex)

***

### timestamp?

```ts
optional timestamp: number;
```

Defined in: [packages/types/src/query.ts:108](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L108)

#### Inherited from

[`EventRow`](EventRow.md).[`timestamp`](EventRow.md#timestamp)
