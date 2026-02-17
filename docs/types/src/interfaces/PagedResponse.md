[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / PagedResponse

# Interface: PagedResponse\<TResult\>

Defined in: [packages/types/src/rpc-responses.ts:7](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L7)

Generic cursor-based paged response (mirrors Circles RPC PagedResponse)

## Type Parameters

### TResult

`TResult`

## Properties

### results

```ts
results: TResult[];
```

Defined in: [packages/types/src/rpc-responses.ts:8](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L8)

***

### hasMore

```ts
hasMore: boolean;
```

Defined in: [packages/types/src/rpc-responses.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L9)

***

### nextCursor

```ts
nextCursor: string | null;
```

Defined in: [packages/types/src/rpc-responses.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L10)
