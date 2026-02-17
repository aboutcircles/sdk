[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / PagedResult

# Interface: PagedResult\<TRow\>

Defined in: [packages/types/src/query.ts:120](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L120)

Result of a paginated query

## Type Parameters

### TRow

`TRow` *extends* [`EventRow`](EventRow.md)

## Properties

### limit

```ts
limit: number;
```

Defined in: [packages/types/src/query.ts:124](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L124)

The number of results that were requested

***

### size

```ts
size: number;
```

Defined in: [packages/types/src/query.ts:128](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L128)

The number of results that were returned

***

### firstCursor?

```ts
optional firstCursor: Cursor;
```

Defined in: [packages/types/src/query.ts:132](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L132)

If the query returned results, this will be the cursor for the first result

***

### lastCursor?

```ts
optional lastCursor: Cursor;
```

Defined in: [packages/types/src/query.ts:136](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L136)

If the query returned results, this will be the cursor for the last result

***

### sortOrder

```ts
sortOrder: SortOrder;
```

Defined in: [packages/types/src/query.ts:140](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L140)

The sort order of the results

***

### hasMore

```ts
hasMore: boolean;
```

Defined in: [packages/types/src/query.ts:144](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L144)

Whether there are more results available

***

### results

```ts
results: TRow[];
```

Defined in: [packages/types/src/query.ts:148](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L148)

The results of the query
