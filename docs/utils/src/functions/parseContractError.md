[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / parseContractError

# Function: parseContractError()

```ts
function parseContractError(error, abi): 
  | DecodedContractError
  | null;
```

Defined in: [packages/utils/src/contractErrors.ts:153](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/contractErrors.ts#L153)

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
