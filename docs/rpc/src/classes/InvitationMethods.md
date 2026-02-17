[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / InvitationMethods

# Class: InvitationMethods

Defined in: [packages/rpc/src/methods/invitation.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L20)

Invitation RPC methods

All methods delegate to dedicated RPC endpoints for server-side SQL optimization.

## Constructors

### Constructor

```ts
new InvitationMethods(client): InvitationMethods;
```

Defined in: [packages/rpc/src/methods/invitation.ts:21](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L21)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`InvitationMethods`

## Methods

### getInvitationOrigin()

```ts
getInvitationOrigin(address): Promise<InvitationOriginResponse | null>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:36](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L36)

Get the invitation origin for an address — how they were invited to Circles

#### Parameters

##### address

`` `0x${string}` ``

The address of the invited avatar

#### Returns

`Promise`\<`InvitationOriginResponse` \| `null`\>

Full invitation origin details or null if not registered

#### Example

```typescript
const origin = await rpc.invitation.getInvitationOrigin('0xde374ece6fa50e781e81aac78e811b33d16912c7');
console.log(origin?.invitationType); // 'v2_standard', 'v2_escrow', 'v2_at_scale', 'v1_signup'
console.log(origin?.inviter); // '0x...' or null
```

***

### getInvitedBy()

```ts
getInvitedBy(address): Promise<`0x${string}` | undefined>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:60](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L60)

Get the avatar that invited a specific avatar

Uses `circles_getInvitationOrigin` for a single optimized query that checks
all invitation mechanisms (at-scale, escrow, v2 standard, v1 signup).

#### Parameters

##### address

`` `0x${string}` ``

The address of the invited avatar

#### Returns

`Promise`\<`` `0x${string}` `` \| `undefined`\>

The address of the inviting avatar or undefined if not found

#### Example

```typescript
const inviter = await rpc.invitation.getInvitedBy('0xde374ece6fa50e781e81aac78e811b33d16912c7');
console.log(inviter); // '0x...'
```

***

### getTrustInvitations()

```ts
getTrustInvitations(address, minimumBalance?): Promise<TrustInvitation[]>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:77](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L77)

Get trust-based invitations (addresses that trust you with sufficient balance)

Uses dedicated `circles_getTrustInvitations` endpoint.

#### Parameters

##### address

`` `0x${string}` ``

The address to check for trust invitations

##### minimumBalance?

`string`

Optional minimum balance threshold (as CRC string)

#### Returns

`Promise`\<`TrustInvitation`[]\>

Array of trust invitations

***

### getInvitations()

```ts
getInvitations(address, minimumBalance?): Promise<AvatarInfo[]>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:101](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L101)

Get the list of avatars who have invited this avatar
Checks v2 trust relations and validates that inviters have enough balance

Uses the native RPC method for efficient server-side filtering and validation.

#### Parameters

##### address

`` `0x${string}` ``

The address to check for invitations

##### minimumBalance?

`string`

#### Returns

`Promise`\<`AvatarInfo`[]\>

Array of avatar info for valid inviters

#### Example

```typescript
const invitations = await rpc.invitation.getInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
console.log(invitations); // Array of AvatarInfo
```

***

### getValidInviters()

```ts
getValidInviters(address, minimumBalance?): Promise<ValidInvitersResponse>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:118](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L118)

Fetch valid inviters along with balances and avatar info

#### Parameters

##### address

`` `0x${string}` ``

Address to find inviters for

##### minimumBalance?

`string`

Optional minimum balance to filter inviters

#### Returns

`Promise`\<`ValidInvitersResponse`\>

Valid inviters response as provided by the RPC host

***

### getInvitationsFrom()

```ts
getInvitationsFrom(address, accepted): Promise<InvitationsFromResponse>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:154](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L154)

Get the list of accounts that were invited by a specific avatar

Uses dedicated `circles_getInvitationsFrom` endpoint with server-side SQL.

#### Parameters

##### address

`` `0x${string}` ``

The address of the inviter

##### accepted

`boolean` = `false`

If true, returns accepted invitations; if false, returns pending invitations

#### Returns

`Promise`\<`InvitationsFromResponse`\>

Enriched response with invited account info and avatar data

#### Example

```typescript
// Get accepted invitations
const accepted = await rpc.invitation.getInvitationsFrom(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  true
);
console.log(accepted.results); // [{address, status: 'accepted', avatarInfo, ...}]

// Get pending invitations
const pending = await rpc.invitation.getInvitationsFrom(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  false
);
console.log(pending.results); // [{address, status: 'pending'}]
```

***

### getEscrowInvitations()

```ts
getEscrowInvitations(address): Promise<EscrowInvitation[]>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:178](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L178)

Get escrow-based invitations for an address

Uses dedicated `circles_getEscrowInvitations` endpoint which handles all filtering
server-side (redeemed, revoked, refunded) in a single optimized SQL query.

#### Parameters

##### address

`` `0x${string}` ``

The address to check for escrow invitations

#### Returns

`Promise`\<`EscrowInvitation`[]\>

Array of active escrow invitations

#### Example

```typescript
const escrowInvites = await rpc.invitation.getEscrowInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
console.log(escrowInvites); // Array of EscrowInvitation
```

***

### getAtScaleInvitations()

```ts
getAtScaleInvitations(address): Promise<AtScaleInvitation[]>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:202](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L202)

Get at-scale invitations for an address

Uses dedicated `circles_getAtScaleInvitations` endpoint which checks for
unclaimed pre-created accounts in a single optimized SQL query.

#### Parameters

##### address

`` `0x${string}` ``

The address to check for at-scale invitations

#### Returns

`Promise`\<`AtScaleInvitation`[]\>

Array of at-scale invitations (unclaimed pre-created accounts)

#### Example

```typescript
const atScaleInvites = await rpc.invitation.getAtScaleInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
console.log(atScaleInvites); // Array of AtScaleInvitation
```

***

### getAllInvitations()

```ts
getAllInvitations(address, minimumBalance?): Promise<AllInvitationsResponse>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:230](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/invitation.ts#L230)

Get all invitations from all sources (trust, escrow, at-scale)
This is the recommended method to use for getting a complete view of available invitations

Uses the optimized `circles_getAllInvitations` RPC method which fetches all invitation
types in a single round-trip with server-side SQL JOINs for efficiency.

#### Parameters

##### address

`` `0x${string}` ``

The address to check for invitations

##### minimumBalance?

`string`

Optional minimum balance for trust-based invitations

#### Returns

`Promise`\<`AllInvitationsResponse`\>

All invitations from all sources

#### Example

```typescript
const allInvites = await rpc.invitation.getAllInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
console.log(`Trust invites: ${allInvites.trustInvitations.length}`);
console.log(`Escrow invites: ${allInvites.escrowInvitations.length}`);
console.log(`At-scale invites: ${allInvites.atScaleInvitations.length}`);
```
