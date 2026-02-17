[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [pathfinder/src](../README.md) / transformToFlowVertices

# Function: transformToFlowVertices()

```ts
function transformToFlowVertices(
   transfers, 
   from, 
   to): object;
```

Defined in: [packages/pathfinder/src/packing.ts:22](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/pathfinder/src/packing.ts#L22)

Build a sorted vertex list plus index lookup for quick coordinate mapping.

## Parameters

### transfers

`TransferStep`[]

### from

`string`

### to

`string`

## Returns

`object`

### sorted

```ts
sorted: string[];
```

### idx

```ts
idx: Record<string, number>;
```
