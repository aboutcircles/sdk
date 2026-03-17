[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / PathfinderMethods

# Class: PathfinderMethods

Defined in: [packages/rpc/src/methods/pathfinder.ts:8](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/pathfinder.ts#L8)

Circles V1 and V2 balance and pathfinding methods

## Constructors

### Constructor

```ts
new PathfinderMethods(client): PathfinderMethods;
```

Defined in: [packages/rpc/src/methods/pathfinder.ts:9](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/pathfinder.ts#L9)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`PathfinderMethods`

## Methods

### findPath()

```ts
findPath(params): Promise<PathfindingResult>;
```

Defined in: [packages/rpc/src/methods/pathfinder.ts:26](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/pathfinder.ts#L26)

Calculate a path between two addresses with a target flow

#### Parameters

##### params

`FindPathParams`

Path finding parameters

#### Returns

`Promise`\<`PathfindingResult`\>

The computed path with transfers (amounts as bigint)

#### Example

```typescript
const path = await rpc.pathfinder.findPath({
  from: '0x749c930256b47049cb65adcd7c25e72d5de44b3b',
  to: '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  targetFlow: 99999999999999999999999999999999999n
});
```

***

### findMaxFlow()

```ts
findMaxFlow(params): Promise<bigint>;
```

Defined in: [packages/rpc/src/methods/pathfinder.ts:52](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/pathfinder.ts#L52)

Find the maximum flow between two addresses

#### Parameters

##### params

`Omit`\<`FindPathParams`, `"targetFlow"`\>

Path finding parameters (without targetFlow)

#### Returns

`Promise`\<`bigint`\>

The maximum flow as bigint

#### Example

```typescript
const maxFlow = await rpc.pathfinder.findMaxFlow({
  from: '0x749c930256b47049cb65adcd7c25e72d5de44b3b',
  to: '0xde374ece6fa50e781e81aac78e811b33d16912c7'
});
```
