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

Defined in: [packages/utils/src/abi.ts:568](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/abi.ts#L568)

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
