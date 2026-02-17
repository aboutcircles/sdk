[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / PagedQueryParams

# Interface: PagedQueryParams

Defined in: [packages/types/src/query.ts:154](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L154)

Parameters for a paginated query

## Properties

### namespace

```ts
namespace: string;
```

Defined in: [packages/types/src/query.ts:158](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L158)

The namespace of the table to query

***

### table

```ts
table: string;
```

Defined in: [packages/types/src/query.ts:162](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L162)

The name of the table to query

***

### sortOrder

```ts
sortOrder: SortOrder;
```

Defined in: [packages/types/src/query.ts:166](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L166)

The order to sort the results

***

### columns

```ts
columns: string[];
```

Defined in: [packages/types/src/query.ts:170](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L170)

The columns to return in the results

***

### filter?

```ts
optional filter: Filter[];
```

Defined in: [packages/types/src/query.ts:174](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L174)

The filters to apply to the query

***

### limit

```ts
limit: number;
```

Defined in: [packages/types/src/query.ts:178](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/query.ts#L178)

The number of results to return per page
