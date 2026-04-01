[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / asViemChain

# Function: asViemChain()

```ts
function asViemChain(chain): Chain;
```

Defined in: [packages/runner/src/chain-types.ts:37](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L37)

Validates that a ChainLike object has the required fields for viem's createPublicClient.
Throws an error if required fields are missing, making failures explicit.

## Parameters

### chain

[`ChainLike`](../type-aliases/ChainLike.md)

The chain configuration to validate

## Returns

`Chain`

The chain cast to viem's expected type

## Throws

Error if required fields are missing
