[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / EventRow

# Interface: EventRow

Defined in: [packages/types/src/query.ts:103](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L103)

Defines the minimum columns any event row must have for cursor-based pagination.
These values are important for determining cursor position in result sets.

## Extended by

- [`Cursor`](Cursor.md)

## Properties

### blockNumber

```ts
blockNumber: number;
```

Defined in: [packages/types/src/query.ts:104](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L104)

***

### transactionIndex

```ts
transactionIndex: number;
```

Defined in: [packages/types/src/query.ts:105](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L105)

***

### logIndex

```ts
logIndex: number;
```

Defined in: [packages/types/src/query.ts:106](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L106)

***

### batchIndex?

```ts
optional batchIndex: number;
```

Defined in: [packages/types/src/query.ts:107](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L107)

***

### timestamp?

```ts
optional timestamp: number;
```

Defined in: [packages/types/src/query.ts:108](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L108)
