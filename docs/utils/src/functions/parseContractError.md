[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / parseContractError

# Function: parseContractError()

```ts
function parseContractError(error, abi): 
  | DecodedContractError
  | null;
```

Defined in: [packages/utils/src/contractErrors.ts:153](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/utils/src/contractErrors.ts#L153)

Parse contract error from a transaction error

## Parameters

### error

`any`

The error object from a failed transaction

### abi

`Abi`

The contract ABI to use for decoding

## Returns

  \| [`DecodedContractError`](../../../types/src/interfaces/DecodedContractError.md)
  \| `null`

Decoded error information or null if cannot be parsed

## Example

```typescript
try {
  await contract.someFunction();
} catch (error) {
  const decoded = parseContractError(error, hubV2Abi);
  if (decoded) {
    console.log(`Contract error: ${decoded.formattedMessage}`);
  }
}
```
