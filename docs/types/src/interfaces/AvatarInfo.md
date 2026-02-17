[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / AvatarInfo

# Interface: AvatarInfo

Defined in: [packages/types/src/avatar.ts:11](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L11)

Avatar information
Contains basic information about a Circles avatar.

## Properties

### blockNumber

```ts
blockNumber: number;
```

Defined in: [packages/types/src/avatar.ts:15](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L15)

The block number of the event

***

### timestamp?

```ts
optional timestamp: number;
```

Defined in: [packages/types/src/avatar.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L20)

The timestamp of the last change to the avatar
Note: May be undefined for some avatars

***

### transactionIndex

```ts
transactionIndex: number;
```

Defined in: [packages/types/src/avatar.ts:24](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L24)

The transaction index

***

### logIndex

```ts
logIndex: number;
```

Defined in: [packages/types/src/avatar.ts:28](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L28)

The log index

***

### transactionHash

```ts
transactionHash: string;
```

Defined in: [packages/types/src/avatar.ts:32](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L32)

The hash of the transaction that last changed the avatar

***

### version

```ts
version: number;
```

Defined in: [packages/types/src/avatar.ts:37](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L37)

If the avatar is currently active in version 1 or 2
Note: An avatar that's active in v2 can still have a v1 token. See `hasV1` and `v1Token`.

***

### type

```ts
type: 
  | "CrcV2_RegisterHuman"
  | "CrcV2_RegisterGroup"
  | "CrcV2_RegisterOrganization"
  | "CrcV1_Signup"
  | "CrcV1_OrganizationSignup";
```

Defined in: [packages/types/src/avatar.ts:41](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L41)

The type of the avatar

***

### avatar

```ts
avatar: `0x${string}`;
```

Defined in: [packages/types/src/avatar.ts:50](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L50)

The address of the avatar

***

### tokenId?

```ts
optional tokenId: string;
```

Defined in: [packages/types/src/avatar.ts:56](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L56)

The personal or group token address (v1) or tokenId (v2)
Note: v1 tokens are erc20 and have a token address. v2 tokens are erc1155 and have a tokenId.
      The v2 tokenId is always an encoded version of the avatar address.

***

### hasV1

```ts
hasV1: boolean;
```

Defined in: [packages/types/src/avatar.ts:60](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L60)

If the avatar is signed up at v1

***

### v1Token?

```ts
optional v1Token: `0x${string}`;
```

Defined in: [packages/types/src/avatar.ts:64](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L64)

If the avatar has a v1 token, this is the token address

***

### cidV0Digest?

```ts
optional cidV0Digest: string;
```

Defined in: [packages/types/src/avatar.ts:68](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L68)

The bytes of the avatar's metadata cidv0

***

### cidV0?

```ts
optional cidV0: string;
```

Defined in: [packages/types/src/avatar.ts:72](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L72)

The CIDv0 of the avatar's metadata (profile)

***

### v1Stopped?

```ts
optional v1Stopped: boolean;
```

Defined in: [packages/types/src/avatar.ts:77](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L77)

If the avatar is stopped in v1
Note: This is only set during Avatar initialization.

***

### isHuman

```ts
isHuman: boolean;
```

Defined in: [packages/types/src/avatar.ts:81](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L81)

Indicates whether the entity is a human

***

### name?

```ts
optional name: string;
```

Defined in: [packages/types/src/avatar.ts:85](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L85)

Groups have a name

***

### symbol?

```ts
optional symbol: string;
```

Defined in: [packages/types/src/avatar.ts:89](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/avatar.ts#L89)

Groups have a symbol
