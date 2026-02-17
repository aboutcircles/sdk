[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / ProfileMethods

# Class: ProfileMethods

Defined in: [packages/rpc/src/methods/profile.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L9)

Profile RPC methods

## Constructors

### Constructor

```ts
new ProfileMethods(client): ProfileMethods;
```

Defined in: [packages/rpc/src/methods/profile.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L10)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`ProfileMethods`

## Methods

### getProfileByCid()

```ts
getProfileByCid(cid): Promise<Profile | null>;
```

Defined in: [packages/rpc/src/methods/profile.ts:24](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L24)

Get a profile by its CID

#### Parameters

##### cid

`string`

The CID of the profile

#### Returns

`Promise`\<`Profile` \| `null`\>

Profile information or null if not found

#### Example

```typescript
const profile = await rpc.profile.getProfileByCid('Qmb2s3hjxXXcFqWvDDSPCd1fXXa9gcFJd8bzdZNNAvkq9W');
console.log(profile);
```

***

### getProfileByCidBatch()

```ts
getProfileByCidBatch(cids): Promise<(Profile | null)[]>;
```

Defined in: [packages/rpc/src/methods/profile.ts:43](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L43)

Get many profiles by CID in batch

#### Parameters

##### cids

(`string` \| `null`)[]

Array of CIDs (null values are allowed in the array)

#### Returns

`Promise`\<(`Profile` \| `null`)[]\>

Array of profiles (null for not found)

#### Example

```typescript
const profiles = await rpc.profile.getProfileByCidBatch([
  'Qmb2s3hjxXXcFqWvDDSPCd1fXXa9gcFJd8bzdZNNAvkq9W',
  null,
  'QmZuR1Jkhs9RLXVY28eTTRSnqbxLTBSoggp18Yde858xCM'
]);
```

***

### getProfileByAddress()

```ts
getProfileByAddress(address): Promise<Profile | null>;
```

Defined in: [packages/rpc/src/methods/profile.ts:62](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L62)

Query the profile for an avatar address

#### Parameters

##### address

`` `0x${string}` ``

The avatar address

#### Returns

`Promise`\<`Profile` \| `null`\>

Profile information or null if not found

#### Example

```typescript
const profile = await rpc.profile.getProfileByAddress('0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7');
console.log(profile);
```

***

### getProfileByAddressBatch()

```ts
getProfileByAddressBatch(addresses): Promise<(Profile | null)[]>;
```

Defined in: [packages/rpc/src/methods/profile.ts:83](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L83)

Query profiles by address in batch

#### Parameters

##### addresses

(`` `0x${string}` `` \| `null`)[]

Array of addresses (null values are allowed in the array)

#### Returns

`Promise`\<(`Profile` \| `null`)[]\>

Array of profiles (null for not found)

#### Example

```typescript
const profiles = await rpc.profile.getProfileByAddressBatch([
  '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7',
  null,
  '0xf712d3b31de494b5c0ea51a6a407460ca66b12e8'
]);
```

***

### searchProfiles()

```ts
searchProfiles(
   query, 
   limit, 
   offset, 
avatarTypes?): Promise<SearchResultProfile[]>;
```

Defined in: [packages/rpc/src/methods/profile.ts:108](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L108)

Search profiles by name, description or address

#### Parameters

##### query

`string`

Search query string

##### limit

`number` = `10`

Maximum number of results (default: 10)

##### offset

`number` = `0`

Offset for pagination (default: 0)

##### avatarTypes?

`string`[]

Optional array of avatar types to filter by (e.g., ['CrcV2_RegisterHuman', 'CrcV2_RegisterGroup'])

#### Returns

`Promise`\<[`SearchResultProfile`](../interfaces/SearchResultProfile.md)[]\>

Array of matching profiles

#### Example

```typescript
const results = await rpc.profile.searchProfiles('alice', 10, 0);
console.log(results);

// Search only humans
const humans = await rpc.profile.searchProfiles('alice', 10, 0, ['CrcV2_RegisterHuman']);
```

***

### searchByAddressOrName()

```ts
searchByAddressOrName(
   query, 
   limit, 
   cursor?, 
avatarTypes?): Promise<ProfileSearchResponse>;
```

Defined in: [packages/rpc/src/methods/profile.ts:145](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L145)

Search profiles by address or username
If the query is a valid address, it will search by address first,
otherwise it will search by name/description

#### Parameters

##### query

`string`

Search query (address or username)

##### limit

`number` = `10`

Maximum number of results (default: 10)

##### cursor?

Pagination cursor from previous response (null for first page)

`string` | `null`

##### avatarTypes?

`string`[]

Optional array of avatar types to filter by

#### Returns

`Promise`\<`ProfileSearchResponse`\>

Search results with profiles and search type indicator

#### Example

```typescript
// Search by username
const results = await rpc.profile.searchByAddressOrName('alice', 20);

// Search by address
const results = await rpc.profile.searchByAddressOrName('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 20);
```

***

### getProfileView()

```ts
getProfileView(address): Promise<ProfileView>;
```

Defined in: [packages/rpc/src/methods/profile.ts:163](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/profile.ts#L163)

Get a consolidated profile view
Combines avatar info, profile data, trust stats, and balances in a single call

#### Parameters

##### address

`` `0x${string}` ``

The address to get the view for

#### Returns

`Promise`\<`ProfileView`\>

Profile view data
