[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [profiles/src](../README.md) / Profiles

# Class: Profiles

Defined in: [packages/profiles/src/index.ts:5](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/profiles/src/index.ts#L5)

## Constructors

### Constructor

```ts
new Profiles(profileServiceUrl): Profiles;
```

Defined in: [packages/profiles/src/index.ts:6](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/profiles/src/index.ts#L6)

#### Parameters

##### profileServiceUrl

`string`

#### Returns

`Profiles`

## Methods

### create()

```ts
create(profile): Promise<string>;
```

Defined in: [packages/profiles/src/index.ts:19](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/profiles/src/index.ts#L19)

Creates and pins a new profile, returning its CID.

#### Parameters

##### profile

`Profile`

The profile data to pin.

#### Returns

`Promise`\<`string`\>

The CID of the pinned profile.

***

### get()

```ts
get(cid): Promise<Profile | undefined>;
```

Defined in: [packages/profiles/src/index.ts:41](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/profiles/src/index.ts#L41)

Retrieves a profile by its CID.

#### Parameters

##### cid

`string`

The CID of the profile to retrieve.

#### Returns

`Promise`\<`Profile` \| `undefined`\>

The profile data, or undefined if not found.
