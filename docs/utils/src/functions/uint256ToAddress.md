[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / uint256ToAddress

# Function: uint256ToAddress()

```ts
function uint256ToAddress(uint256): `0x${string}`;
```

Defined in: [packages/utils/src/address.ts:10](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/utils/src/address.ts#L10)

Converts a uint256 value to an Ethereum address
Takes the last 20 bytes of the uint256

## Parameters

### uint256

`bigint`

The uint256 value as a bigint

## Returns

`` `0x${string}` ``

The address as a checksummed hex string
