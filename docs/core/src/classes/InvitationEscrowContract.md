[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / InvitationEscrowContract

# Class: InvitationEscrowContract

Defined in: [packages/core/src/contracts/invitationEscrow.ts:12](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L12)

InvitationEscrow Contract Wrapper
Provides type-safe methods for interacting with the InvitationEscrow contract

This contract manages invitation escrows of CRC tokens between inviters and invitees,
applying demurrage over time and allowing redemption or revocation of invitations.

## Extends

- [`Contract`](Contract.md)\<*typeof* `invitationEscrowAbi`\>

## Constructors

### Constructor

```ts
new InvitationEscrowContract(config): InvitationEscrowContract;
```

Defined in: [packages/core/src/contracts/invitationEscrow.ts:13](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L13)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`InvitationEscrowContract`

#### Overrides

[`Contract`](Contract.md).[`constructor`](Contract.md#constructor)

## Properties

### address

```ts
readonly address: `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L9)

#### Inherited from

[`Contract`](Contract.md).[`address`](Contract.md#address)

***

### abi

```ts
readonly abi: readonly [{
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}];
```

Defined in: [packages/core/src/contracts/contract.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L10)

#### Inherited from

[`Contract`](Contract.md).[`abi`](Contract.md#abi)

***

### rpcUrl

```ts
protected rpcUrl: string;
```

Defined in: [packages/core/src/contracts/contract.ts:11](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L11)

#### Inherited from

[`Contract`](Contract.md).[`rpcUrl`](Contract.md#rpcurl)

## Methods

### read()

```ts
read(
   functionName, 
   args?, 
options?): Promise<unknown>;
```

Defined in: [packages/core/src/contracts/contract.ts:29](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L29)

Read from contract (view/pure functions) using direct JSON-RPC call

#### Parameters

##### functionName

`string`

The contract function to call

##### args?

readonly `unknown`[]

Function arguments

##### options?

Optional call options

###### from?

`` `0x${string}` ``

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[`Contract`](Contract.md).[`read`](Contract.md#read)

***

### encodeWrite()

```ts
encodeWrite(functionName, args?): `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:81](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L81)

Encode transaction data for write functions

#### Parameters

##### functionName

`string`

##### args?

readonly `unknown`[]

#### Returns

`` `0x${string}` ``

#### Inherited from

[`Contract`](Contract.md).[`encodeWrite`](Contract.md#encodewrite)

***

### redeemInvitation()

```ts
redeemInvitation(inviter): TransactionRequest;
```

Defined in: [packages/core/src/contracts/invitationEscrow.ts:26](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L26)

Redeem the invitation escrow from a specific inviter

#### Parameters

##### inviter

`` `0x${string}` ``

The address of the inviter whose escrowed invitation is being redeemed

#### Returns

`TransactionRequest`

Transaction request

***

### revokeInvitation()

```ts
revokeInvitation(invitee): TransactionRequest;
```

Defined in: [packages/core/src/contracts/invitationEscrow.ts:39](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L39)

Revoke a single invitation escrow

#### Parameters

##### invitee

`` `0x${string}` ``

The address of the invitee whose escrow is being revoked

#### Returns

`TransactionRequest`

Transaction request

***

### revokeAllInvitations()

```ts
revokeAllInvitations(): TransactionRequest;
```

Defined in: [packages/core/src/contracts/invitationEscrow.ts:51](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L51)

Revoke all active invitation escrows

#### Returns

`TransactionRequest`

Transaction request

***

### getInviters()

```ts
getInviters(invitee): Promise<`0x${string}`[]>;
```

Defined in: [packages/core/src/contracts/invitationEscrow.ts:64](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L64)

Get all active inviters for a given invitee

#### Parameters

##### invitee

`` `0x${string}` ``

The address whose inviter list is requested

#### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of inviter addresses

***

### getInvitees()

```ts
getInvitees(inviter): Promise<`0x${string}`[]>;
```

Defined in: [packages/core/src/contracts/invitationEscrow.ts:73](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L73)

Get all active invitees for a given inviter

#### Parameters

##### inviter

`` `0x${string}` ``

The address whose invitee list is requested

#### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of invitee addresses

***

### getEscrowedAmountAndDays()

```ts
getEscrowedAmountAndDays(inviter, invitee): Promise<EscrowedAmountAndDays>;
```

Defined in: [packages/core/src/contracts/invitationEscrow.ts:83](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/invitationEscrow.ts#L83)

Get the current escrowed amount (after demurrage) and days since last update

#### Parameters

##### inviter

`` `0x${string}` ``

The address of the inviter in the pair

##### invitee

`` `0x${string}` ``

The address of the invitee in the pair

#### Returns

`Promise`\<`EscrowedAmountAndDays`\>

Object containing escrowedAmount (after demurrage) and days_ since last update
