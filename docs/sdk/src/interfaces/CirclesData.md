[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [sdk/src](../README.md) / CirclesData

# Interface: CirclesData

Defined in: [packages/sdk/src/types.ts:14](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/types.ts#L14)

Circles data access layer
Provides read access to Circles protocol data

## Methods

### getAvatar()

```ts
getAvatar(address): Promise<AvatarInfo | undefined>;
```

Defined in: [packages/sdk/src/types.ts:15](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/types.ts#L15)

#### Parameters

##### address

`` `0x${string}` ``

#### Returns

`Promise`\<`AvatarInfo` \| `undefined`\>

***

### getTrustRelations()

```ts
getTrustRelations(address): Promise<AggregatedTrustRelation[]>;
```

Defined in: [packages/sdk/src/types.ts:16](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/types.ts#L16)

#### Parameters

##### address

`` `0x${string}` ``

#### Returns

`Promise`\<`AggregatedTrustRelation`[]\>

***

### getBalances()

```ts
getBalances(address): Promise<TokenBalance[]>;
```

Defined in: [packages/sdk/src/types.ts:17](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/types.ts#L17)

#### Parameters

##### address

`` `0x${string}` ``

#### Returns

`Promise`\<`TokenBalance`[]\>

***

### getAllInvitations()

```ts
getAllInvitations(address, minimumBalance?): Promise<AllInvitationsResponse>;
```

Defined in: [packages/sdk/src/types.ts:24](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/types.ts#L24)

Get all invitations from all sources (trust, escrow, at-scale)

#### Parameters

##### address

`` `0x${string}` ``

Address to check for invitations

##### minimumBalance?

`string`

Optional minimum balance for trust-based invitations

#### Returns

`Promise`\<`AllInvitationsResponse`\>

All invitations from all sources
