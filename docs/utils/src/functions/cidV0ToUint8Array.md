[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / cidV0ToUint8Array

# Function: cidV0ToUint8Array()

```ts
function cidV0ToUint8Array(cidV0): Uint8Array;
```

Defined in: [packages/utils/src/cid.ts:61](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/utils/src/cid.ts#L61)

Convert a CIDv0 string to a Uint8Array of the hash digest

This function is browser-compatible using the modern `multiformats` library.

## Parameters

### cidV0

`string`

The CIDv0 string (e.g., "QmXxxx...")

## Returns

`Uint8Array`

The 32-byte hash digest as a Uint8Array

## Throws

Error if the CID is invalid or uses unsupported hash algorithm

## Example

```typescript
const bytes = cidV0ToUint8Array('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
// Returns: Uint8Array(32) [...]
```
