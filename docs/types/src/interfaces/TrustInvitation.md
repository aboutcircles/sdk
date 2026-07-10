[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / TrustInvitation

# Interface: TrustInvitation

Defined in: [packages/types/src/rpc-responses.ts:118](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L118)

Trust-based invitation - someone trusts you and has sufficient balance

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
source: "trust";
```

Defined in: [packages/types/src/rpc-responses.ts:119](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L119)

How the invitation was created

#### Overrides

[`InvitationInfo`](InvitationInfo.md).[`source`](InvitationInfo.md#source)

***

### balance

```ts
balance: string;
```

Defined in: [packages/types/src/rpc-responses.ts:121](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L121)

Inviter's current CRC balance
