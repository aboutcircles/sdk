[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / EscrowInvitation

# Interface: EscrowInvitation

Defined in: [packages/types/src/rpc-responses.ts:127](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L127)

Escrow-based invitation - CRC tokens escrowed for you

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
source: "escrow";
```

Defined in: [packages/types/src/rpc-responses.ts:128](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L128)

How the invitation was created

#### Overrides

[`InvitationInfo`](InvitationInfo.md).[`source`](InvitationInfo.md#source)

***

### escrowedAmount

```ts
escrowedAmount: string;
```

Defined in: [packages/types/src/rpc-responses.ts:130](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L130)

Amount escrowed (in atto-circles)

***

### escrowDays

```ts
escrowDays: number;
```

Defined in: [packages/types/src/rpc-responses.ts:132](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L132)

Number of days the escrow has been active

***

### blockNumber

```ts
blockNumber: number;
```

Defined in: [packages/types/src/rpc-responses.ts:134](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L134)

Block number when escrow was created

***

### timestamp

```ts
timestamp: number;
```

Defined in: [packages/types/src/rpc-responses.ts:136](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L136)

Timestamp when escrow was created
