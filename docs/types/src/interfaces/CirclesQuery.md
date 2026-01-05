[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / CirclesQuery

# Interface: CirclesQuery\<T\>

Defined in: [packages/types/src/sdk.ts:39](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/sdk.ts#L39)

Circles query result with pagination

## Type Parameters

### T

`T`

## Properties

### rows

```ts
rows: T[];
```

Defined in: [packages/types/src/sdk.ts:40](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/sdk.ts#L40)

***

### hasMore

```ts
hasMore: boolean;
```

Defined in: [packages/types/src/sdk.ts:41](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/sdk.ts#L41)

## Methods

### nextPage()

```ts
nextPage(): Promise<CirclesQuery<T>>;
```

Defined in: [packages/types/src/sdk.ts:42](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/sdk.ts#L42)

#### Returns

`Promise`\<`CirclesQuery`\<`T`\>\>
