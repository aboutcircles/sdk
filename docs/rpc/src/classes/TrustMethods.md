[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / TrustMethods

# Class: TrustMethods

Defined in: [packages/rpc/src/methods/trust.ts:9](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L9)

Trust relation RPC methods

## Constructors

### Constructor

```ts
new TrustMethods(client): TrustMethods;
```

Defined in: [packages/rpc/src/methods/trust.ts:10](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L10)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`TrustMethods`

## Methods

### getCommonTrust()

```ts
getCommonTrust(address1, address2): Promise<`0x${string}`[]>;
```

Defined in: [packages/rpc/src/methods/trust.ts:40](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L40)

Query the common trust relations of two addresses
(only common outgoing trust relations are considered)

#### Parameters

##### address1

`` `0x${string}` ``

First address

##### address2

`` `0x${string}` ``

Second address

#### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of common trusted addresses

#### Example

```typescript
const commonTrust = await rpc.trust.getCommonTrust(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  '0xe8fc7a2d0573e5164597b05f14fa9a7fca7b215c'
);
```

***

### getTrustRelations()

```ts
getTrustRelations(
   avatar, 
   limit, 
sortOrder): PagedQuery<TrustRelation>;
```

Defined in: [packages/rpc/src/methods/trust.ts:69](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L69)

Get trust relations for an address using cursor-based pagination

Returns a PagedQuery instance for iterating through all v2 trust relations for the given avatar.

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query trust relations for

##### limit

`number` = `100`

Number of trust relations per page (default: 100)

##### sortOrder

Sort order for results (default: 'DESC')

`"ASC"` | `"DESC"`

#### Returns

[`PagedQuery`](PagedQuery.md)\<`TrustRelation`\>

PagedQuery instance for iterating through trust relations

#### Example

```typescript
const query = rpc.trust.getTrustRelations('0xAvatar...', 100);

// Get first page
await query.queryNextPage();
query.currentPage.results.forEach(relation => {
  console.log(`${relation.truster} trusts ${relation.trustee}`);
});
```

***

### getAggregatedTrustRelations()

```ts
getAggregatedTrustRelations(avatar): Promise<AggregatedTrustRelation[]>;
```

Defined in: [packages/rpc/src/methods/trust.ts:153](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L153)

Get aggregated trust relations for an address
Groups trust relations by counterpart and determines relationship type

Note: This method fetches ALL trust relations for aggregation.

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query trust relations for

#### Returns

`Promise`\<`AggregatedTrustRelation`[]\>

Aggregated trust relations with relationship types

#### Example

```typescript
const aggregated = await rpc.trust.getAggregatedTrustRelations(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7'
);
// Returns: [
//   { subjectAvatar: '0x...', relation: 'mutuallyTrusts', objectAvatar: '0x...', timestamp: 123 },
//   { subjectAvatar: '0x...', relation: 'trusts', objectAvatar: '0x...', timestamp: 456 }
// ]
```

***

### getTrustedBy()

```ts
getTrustedBy(avatar): Promise<AggregatedTrustRelation[]>;
```

Defined in: [packages/rpc/src/methods/trust.ts:221](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L221)

Get addresses that trust the given avatar (incoming trust)

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query

#### Returns

`Promise`\<`AggregatedTrustRelation`[]\>

Array of trust relations where others trust this avatar

#### Example

```typescript
const trustedBy = await rpc.trust.getTrustedBy(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7'
);
```

***

### getTrusts()

```ts
getTrusts(avatar): Promise<AggregatedTrustRelation[]>;
```

Defined in: [packages/rpc/src/methods/trust.ts:241](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L241)

Get addresses that the given avatar trusts (outgoing trust)

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query

#### Returns

`Promise`\<`AggregatedTrustRelation`[]\>

Array of trust relations where this avatar trusts others

#### Example

```typescript
const trusts = await rpc.trust.getTrusts(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7'
);
```

***

### getMutualTrusts()

```ts
getMutualTrusts(avatar): Promise<AggregatedTrustRelation[]>;
```

Defined in: [packages/rpc/src/methods/trust.ts:261](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/trust.ts#L261)

Get mutual trust relations for the given avatar

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query

#### Returns

`Promise`\<`AggregatedTrustRelation`[]\>

Array of trust relations where both parties trust each other

#### Example

```typescript
const mutualTrusts = await rpc.trust.getMutualTrusts(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7'
);
```
