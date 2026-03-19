[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / FlexiblePagedResult

# Interface: FlexiblePagedResult\<TRow\>

Defined in: [packages/rpc/src/types.ts:79](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L79)

Flexible paged result that works with both event-based and custom cursors

## Type Parameters

### TRow

`TRow`

## Properties

### limit

```ts
limit: number;
```

Defined in: [packages/rpc/src/types.ts:80](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L80)

***

### size

```ts
size: number;
```

Defined in: [packages/rpc/src/types.ts:81](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L81)

***

### firstCursor?

```ts
optional firstCursor: Record<string, any>;
```

Defined in: [packages/rpc/src/types.ts:82](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L82)

***

### lastCursor?

```ts
optional lastCursor: Record<string, any>;
```

Defined in: [packages/rpc/src/types.ts:83](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L83)

***

### sortOrder

```ts
sortOrder: "ASC" | "DESC";
```

Defined in: [packages/rpc/src/types.ts:84](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L84)

***

### hasMore

```ts
hasMore: boolean;
```

Defined in: [packages/rpc/src/types.ts:85](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L85)

***

### results

```ts
results: TRow[];
```

Defined in: [packages/rpc/src/types.ts:86](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L86)
