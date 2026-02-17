[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / WrappedTokenInfo

# Type Alias: WrappedTokenInfo

```ts
type WrappedTokenInfo = object;
```

Defined in: [packages/types/src/wrapper.ts:18](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/wrapper.ts#L18)

Information about a wrapped token found in a transfer path
Maps wrapper address to [amount used in path, wrapper type]

## Properties

### amount

```ts
amount: bigint;
```

Defined in: [packages/types/src/wrapper.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/wrapper.ts#L20)

Amount of the wrapped token used in the path

***

### tokenType

```ts
tokenType: string;
```

Defined in: [packages/types/src/wrapper.ts:22](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/wrapper.ts#L22)

The type of wrapper (e.g., 'CrcV2_ERC20WrapperDeployed_Demurraged' or 'CrcV2_ERC20WrapperDeployed_Inflationary')
