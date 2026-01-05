[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / AvatarMethods

# Class: AvatarMethods

Defined in: [packages/rpc/src/methods/avatar.ts:8](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/avatar.ts#L8)

Avatar and network RPC methods

## Constructors

### Constructor

```ts
new AvatarMethods(client): AvatarMethods;
```

Defined in: [packages/rpc/src/methods/avatar.ts:9](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/avatar.ts#L9)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`AvatarMethods`

## Methods

### getAvatarInfo()

```ts
getAvatarInfo(address): Promise<AvatarInfo | undefined>;
```

Defined in: [packages/rpc/src/methods/avatar.ts:23](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/avatar.ts#L23)

Get information about a specific avatar

#### Parameters

##### address

`` `0x${string}` ``

The avatar address to query

#### Returns

`Promise`\<`AvatarInfo` \| `undefined`\>

Avatar information

#### Example

```typescript
const info = await rpc.avatar.getAvatarInfo('0xde374ece6fa50e781e81aac78e811b33d16912c7');
console.log(info);
```

***

### getAvatarInfoBatch()

```ts
getAvatarInfoBatch(addresses): Promise<AvatarInfo[]>;
```

Defined in: [packages/rpc/src/methods/avatar.ts:42](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/avatar.ts#L42)

Get information about multiple avatars in batch

#### Parameters

##### addresses

`` `0x${string}` ``[]

Array of avatar addresses to query

#### Returns

`Promise`\<`AvatarInfo`[]\>

Array of avatar information objects

#### Example

```typescript
const infos = await rpc.avatar.getAvatarInfoBatch([
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7'
]);
```

***

### getNetworkSnapshot()

```ts
getNetworkSnapshot(): Promise<NetworkSnapshot>;
```

Defined in: [packages/rpc/src/methods/avatar.ts:68](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/avatar.ts#L68)

Download a full snapshot of the Circles network state
(current trust relations and balances)

#### Returns

`Promise`\<`NetworkSnapshot`\>

Network snapshot with trust relations and balances

#### Example

```typescript
const snapshot = await rpc.avatar.getNetworkSnapshot();
console.log(snapshot);
```
