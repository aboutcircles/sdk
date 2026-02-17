[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / CirclesQuery

# Interface: CirclesQuery\<T\>

Defined in: [packages/types/src/sdk.ts:59](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L59)

Circles query result with pagination

## Type Parameters

### T

`T`

## Properties

### rows

```ts
rows: T[];
```

Defined in: [packages/types/src/sdk.ts:60](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L60)

***

### hasMore

```ts
hasMore: boolean;
```

Defined in: [packages/types/src/sdk.ts:61](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L61)

## Methods

### nextPage()

```ts
nextPage(): Promise<CirclesQuery<T>>;
```

Defined in: [packages/types/src/sdk.ts:62](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L62)

#### Returns

`Promise`\<`CirclesQuery`\<`T`\>\>
