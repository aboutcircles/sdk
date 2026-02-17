[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / FlexiblePagedResult

# Interface: FlexiblePagedResult\<TRow\>

Defined in: [packages/rpc/src/types.ts:79](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L79)

Flexible paged result using server-side opaque cursors

## Type Parameters

### TRow

`TRow`

## Properties

### limit

```ts
limit: number;
```

Defined in: [packages/rpc/src/types.ts:80](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L80)

***

### size

```ts
size: number;
```

Defined in: [packages/rpc/src/types.ts:81](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L81)

***

### sortOrder

```ts
sortOrder: "ASC" | "DESC";
```

Defined in: [packages/rpc/src/types.ts:82](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L82)

***

### hasMore

```ts
hasMore: boolean;
```

Defined in: [packages/rpc/src/types.ts:83](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L83)

***

### nextCursor?

```ts
optional nextCursor: string;
```

Defined in: [packages/rpc/src/types.ts:84](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L84)

***

### results

```ts
results: TRow[];
```

Defined in: [packages/rpc/src/types.ts:85](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L85)
