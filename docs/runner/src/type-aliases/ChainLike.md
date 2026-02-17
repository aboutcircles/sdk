[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / ChainLike

# Type Alias: ChainLike

```ts
type ChainLike = Chain | ChainConfig;
```

Defined in: [packages/runner/src/chain-types.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L27)

Type that accepts either a full viem Chain or our minimal ChainConfig.
This provides flexibility while maintaining type safety.
