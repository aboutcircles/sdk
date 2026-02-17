[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / checksumAddress

# Function: checksumAddress()

```ts
function checksumAddress(address): string;
```

Defined in: [packages/utils/src/abi.ts:48](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/abi.ts#L48)

Convert an Ethereum address to EIP-55 checksummed format

## Parameters

### address

`string`

The address to checksum (with or without 0x prefix)

## Returns

`string`

The checksummed address with 0x prefix
