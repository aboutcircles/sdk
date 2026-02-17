[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / InvitationInfo

# Interface: InvitationInfo

Defined in: [packages/types/src/rpc-responses.ts:106](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L106)

Base invitation info with source tracking

## Extended by

- [`TrustInvitation`](TrustInvitation.md)
- [`EscrowInvitation`](EscrowInvitation.md)
- [`AtScaleInvitation`](AtScaleInvitation.md)

## Properties

### address

```ts
address: `0x${string}`;
```

Defined in: [packages/types/src/rpc-responses.ts:108](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L108)

The inviter's address

***

### source

```ts
source: InvitationSource;
```

Defined in: [packages/types/src/rpc-responses.ts:110](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L110)

How the invitation was created

***

### avatarInfo?

```ts
optional avatarInfo: AvatarInfo;
```

Defined in: [packages/types/src/rpc-responses.ts:112](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L112)

Avatar info for the inviter (if available)
