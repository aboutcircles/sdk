[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / PagedQueryParams

# Interface: PagedQueryParams

Defined in: [packages/types/src/query.ts:142](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L142)

Parameters for a paginated query

## Properties

### namespace

```ts
namespace: string;
```

Defined in: [packages/types/src/query.ts:146](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L146)

The namespace of the table to query

***

### table

```ts
table: string;
```

Defined in: [packages/types/src/query.ts:150](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L150)

The name of the table to query

***

### sortOrder

```ts
sortOrder: SortOrder;
```

Defined in: [packages/types/src/query.ts:154](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L154)

The order to sort the results

***

### columns

```ts
columns: string[];
```

Defined in: [packages/types/src/query.ts:158](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L158)

The columns to return in the results

***

### filter?

```ts
optional filter: Filter[];
```

Defined in: [packages/types/src/query.ts:162](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L162)

The filters to apply to the query

***

### limit

```ts
limit: number;
```

Defined in: [packages/types/src/query.ts:166](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/query.ts#L166)

The number of results to return per page
