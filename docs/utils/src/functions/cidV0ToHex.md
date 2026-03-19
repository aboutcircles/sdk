[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / cidV0ToHex

# Function: cidV0ToHex()

```ts
function cidV0ToHex(cidV0): `0x${string}`;
```

Defined in: [packages/utils/src/cid.ts:25](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/utils/src/cid.ts#L25)

Convert a CIDv0 string to a bytes32 hex string for on-chain storage

CIDv0 format:
- Base58 encoded multihash
- Always uses SHA-256 hash algorithm
- Contains 32-byte hash digest

This function is browser-compatible using the modern `multiformats` library.

## Parameters

### cidV0

`string`

The CIDv0 string (e.g., "QmXxxx...")

## Returns

`` `0x${string}` ``

The 32-byte hash digest as a hex string

## Throws

Error if the CID is invalid or uses unsupported hash algorithm

## Example

```typescript
const hex = cidV0ToHex('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
// Returns: '0x...' (32 bytes / 64 hex characters)
```
