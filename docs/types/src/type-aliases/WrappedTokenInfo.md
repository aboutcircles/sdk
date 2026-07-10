[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / WrappedTokenInfo

# Type Alias: WrappedTokenInfo

```ts
type WrappedTokenInfo = object;
```

Defined in: [packages/types/src/wrapper.ts:18](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/wrapper.ts#L18)

Information about a wrapped token found in a transfer path
Maps wrapper address to [amount used in path, wrapper type]

## Properties

### amount

```ts
amount: bigint;
```

Defined in: [packages/types/src/wrapper.ts:20](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/wrapper.ts#L20)

Amount of the wrapped token used in the path

***

### tokenType

```ts
tokenType: string;
```

Defined in: [packages/types/src/wrapper.ts:22](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/types/src/wrapper.ts#L22)

The type of wrapper (e.g., 'CrcV2_ERC20WrapperDeployed_Demurraged' or 'CrcV2_ERC20WrapperDeployed_Inflationary')
