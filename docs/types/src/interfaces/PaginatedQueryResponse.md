[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / PaginatedQueryResponse

# Interface: PaginatedQueryResponse

Defined in: [packages/types/src/rpc.ts:42](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L42)

Paginated query response from circles_paginated_query.
Server returns columns, rows, hasMore flag, and an opaque cursor for next page.

## Properties

### columns

```ts
columns: string[];
```

Defined in: [packages/types/src/rpc.ts:43](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L43)

***

### rows

```ts
rows: any[][];
```

Defined in: [packages/types/src/rpc.ts:44](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L44)

***

### hasMore

```ts
hasMore: boolean;
```

Defined in: [packages/types/src/rpc.ts:45](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L45)

***

### nextCursor

```ts
nextCursor: string | null;
```

Defined in: [packages/types/src/rpc.ts:46](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L46)
