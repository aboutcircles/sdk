[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / AllInvitationsResponse

# Interface: AllInvitationsResponse

Defined in: [packages/types/src/rpc-responses.ts:180](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L180)

Response containing all available invitations from all sources

## Properties

### address

```ts
address: `0x${string}`;
```

Defined in: [packages/types/src/rpc-responses.ts:181](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L181)

***

### trustInvitations

```ts
trustInvitations: TrustInvitation[];
```

Defined in: [packages/types/src/rpc-responses.ts:183](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L183)

Trust-based invitations (people who trust you with sufficient balance)

***

### escrowInvitations

```ts
escrowInvitations: EscrowInvitation[];
```

Defined in: [packages/types/src/rpc-responses.ts:185](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L185)

Escrow-based invitations (CRC escrowed for you)

***

### atScaleInvitations

```ts
atScaleInvitations: AtScaleInvitation[];
```

Defined in: [packages/types/src/rpc-responses.ts:187](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc-responses.ts#L187)

At-scale invitations (pre-created accounts)
