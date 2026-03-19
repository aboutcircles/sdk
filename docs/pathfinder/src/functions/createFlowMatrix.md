[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [pathfinder/src](../README.md) / createFlowMatrix

# Function: createFlowMatrix()

```ts
function createFlowMatrix(
   from, 
   to, 
   value, 
   transfers): FlowMatrix;
```

Defined in: [packages/pathfinder/src/flowMatrix.ts:7](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/pathfinder/src/flowMatrix.ts#L7)

Create an ABI‑ready FlowMatrix object from a list of TransferSteps.

## Parameters

### from

`` `0x${string}` ``

### to

`` `0x${string}` ``

### value

`bigint`

### transfers

`TransferStep`[]

## Returns

`FlowMatrix`
