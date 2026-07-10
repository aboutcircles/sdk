[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / Cursor

# Interface: Cursor

Defined in: [packages/types/src/query.ts:103](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L103)

A cursor is a sortable unique identifier for a specific log entry.
Used to paginate through query results efficiently.

## Extends

- [`EventRow`](EventRow.md)

## Properties

### blockNumber

```ts
blockNumber: number;
```

Defined in: [packages/types/src/query.ts:92](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L92)

#### Inherited from

[`EventRow`](EventRow.md).[`blockNumber`](EventRow.md#blocknumber)

***

### transactionIndex

```ts
transactionIndex: number;
```

Defined in: [packages/types/src/query.ts:93](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L93)

#### Inherited from

[`EventRow`](EventRow.md).[`transactionIndex`](EventRow.md#transactionindex)

***

### logIndex

```ts
logIndex: number;
```

Defined in: [packages/types/src/query.ts:94](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L94)

#### Inherited from

[`EventRow`](EventRow.md).[`logIndex`](EventRow.md#logindex)

***

### batchIndex?

```ts
optional batchIndex: number;
```

Defined in: [packages/types/src/query.ts:95](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L95)

#### Inherited from

[`EventRow`](EventRow.md).[`batchIndex`](EventRow.md#batchindex)

***

### timestamp?

```ts
optional timestamp: number;
```

Defined in: [packages/types/src/query.ts:96](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L96)

#### Inherited from

[`EventRow`](EventRow.md).[`timestamp`](EventRow.md#timestamp)
