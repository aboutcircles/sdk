[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / AtScaleInvitation

# Interface: AtScaleInvitation

Defined in: [packages/types/src/rpc-responses.ts:142](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L142)

At-scale invitation - pre-created account via referral system

## Extends

- [`InvitationInfo`](InvitationInfo.md)

## Properties

### address

```ts
address: `0x${string}`;
```

Defined in: [packages/types/src/rpc-responses.ts:108](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L108)

The inviter's address

#### Inherited from

[`InvitationInfo`](InvitationInfo.md).[`address`](InvitationInfo.md#address)

***

### avatarInfo?

```ts
optional avatarInfo: AvatarInfo;
```

Defined in: [packages/types/src/rpc-responses.ts:112](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L112)

Avatar info for the inviter (if available)

#### Inherited from

[`InvitationInfo`](InvitationInfo.md).[`avatarInfo`](InvitationInfo.md#avatarinfo)

***

### source

```ts
source: "atScale";
```

Defined in: [packages/types/src/rpc-responses.ts:143](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L143)

How the invitation was created

#### Overrides

[`InvitationInfo`](InvitationInfo.md).[`source`](InvitationInfo.md#source)

***

### originInviter?

```ts
optional originInviter: `0x${string}`;
```

Defined in: [packages/types/src/rpc-responses.ts:145](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L145)

The original inviter who funded the invitation

***

### blockNumber

```ts
blockNumber: number;
```

Defined in: [packages/types/src/rpc-responses.ts:147](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L147)

Block number when account was created

***

### timestamp

```ts
timestamp: number;
```

Defined in: [packages/types/src/rpc-responses.ts:149](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L149)

Timestamp when account was created
