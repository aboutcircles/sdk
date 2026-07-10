[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / decodeErrorResult

# Function: decodeErrorResult()

```ts
function decodeErrorResult(config): 
  | {
  errorName: string;
  args?: any[];
}
  | null;
```

Defined in: [packages/utils/src/abi.ts:568](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/utils/src/abi.ts#L568)

Decode error data from a contract revert

## Parameters

### config

Configuration with ABI and error data

#### abi

`Abi`

#### data

`string`

## Returns

  \| \{
  `errorName`: `string`;
  `args?`: `any`[];
\}
  \| `null`

Decoded error with name and arguments
