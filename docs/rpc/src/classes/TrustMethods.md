[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / TrustMethods

# Class: TrustMethods

Defined in: [packages/rpc/src/methods/trust.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L9)

Trust relation RPC methods

## Constructors

### Constructor

```ts
new TrustMethods(client): TrustMethods;
```

Defined in: [packages/rpc/src/methods/trust.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L10)

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

Defined in: [packages/rpc/src/methods/trust.ts:40](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L40)

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

Defined in: [packages/rpc/src/methods/trust.ts:69](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L69)

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

Defined in: [packages/rpc/src/methods/trust.ts:151](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L151)

Get aggregated trust relations for an address
Uses the native RPC method for efficient server-side aggregation

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
//   { subjectAvatar: '0x...', relation: 'mutuallyTrusts', objectAvatar: '0x...', timestamp: 123, expiryTime: 0, objectAvatarType: 'Human' },
//   { subjectAvatar: '0x...', relation: 'trusts', objectAvatar: '0x...', timestamp: 456, expiryTime: 0, objectAvatarType: 'Group' }
// ]
```

***

### getTrustedBy()

```ts
getTrustedBy(avatar): Promise<AggregatedTrustRelation[]>;
```

Defined in: [packages/rpc/src/methods/trust.ts:176](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L176)

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

Defined in: [packages/rpc/src/methods/trust.ts:196](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L196)

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

Defined in: [packages/rpc/src/methods/trust.ts:216](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L216)

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

***

### getTrustNetworkSummary()

```ts
getTrustNetworkSummary(avatar, maxDepth): Promise<TrustNetworkSummary>;
```

Defined in: [packages/rpc/src/methods/trust.ts:231](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L231)

Get trust network summary
Includes counts of direct trusts, trusted by, and mutual trusts

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query

##### maxDepth

`number` = `2`

Maximum depth for network calculation (default: 2)

#### Returns

`Promise`\<`TrustNetworkSummary`\>

Trust network summary

***

### getAggregatedTrustRelationsEnriched()

```ts
getAggregatedTrustRelationsEnriched(avatar): Promise<AggregatedTrustRelationsResponse>;
```

Defined in: [packages/rpc/src/methods/trust.ts:245](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L245)

Get enriched aggregated trust relations
Returns classified trust relations (mutual, trusts, trustedBy) with avatar info

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query

#### Returns

`Promise`\<`AggregatedTrustRelationsResponse`\>

Enriched aggregated trust relations

***

### getValidInviters()

```ts
getValidInviters(avatar, minimumBalance?): Promise<ValidInvitersResponse>;
```

Defined in: [packages/rpc/src/methods/trust.ts:259](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/trust.ts#L259)

Get valid inviters for an address
Returns addresses that trust the given address and have sufficient balance

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query

##### minimumBalance?

`string`

Minimum balance required (optional)

#### Returns

`Promise`\<`ValidInvitersResponse`\>

List of valid inviters
