[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / checksumAddress

# Function: checksumAddress()

```ts
function checksumAddress(address): string;
```

Defined in: [packages/utils/src/abi.ts:48](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/utils/src/abi.ts#L48)

Convert an Ethereum address to EIP-55 checksummed format

## Parameters

### address

`string`

The address to checksum (with or without 0x prefix)

## Returns

`string`

The checksummed address with 0x prefix
