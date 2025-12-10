[**Circles SDK**](../../../README.md)

---

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / InvitationMethods

# Class: InvitationMethods

Defined in: [packages/rpc/src/methods/invitation.ts:12](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/invitation.ts#L12)

Invitation RPC methods

## Constructors

### Constructor

```ts
new InvitationMethods(client): InvitationMethods;
```

Defined in: [packages/rpc/src/methods/invitation.ts:13](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/invitation.ts#L13)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`InvitationMethods`

## Methods

### getInvitedBy()

```ts
getInvitedBy(address): Promise<`0x${string}` | undefined>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:38](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/invitation.ts#L38)

Get the avatar that invited a specific avatar

#### Parameters

##### address

`` `0x${string}` ``

The address of the invited avatar

#### Returns

`Promise`\<`` `0x${string}` `` \| `undefined`\>

The address of the inviting avatar or undefined if not found

#### Example

```typescript
const inviter = await rpc.invitation.getInvitedBy(
  "0xde374ece6fa50e781e81aac78e811b33d16912c7"
)
console.log(inviter) // '0x...'
```

---

### getInvitations()

```ts
getInvitations(address): Promise<AvatarInfo[]>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:83](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/invitation.ts#L83)

Get the list of avatars who have invited this avatar
Checks v2 trust relations and validates that inviters have enough balance

Uses the native RPC method for efficient server-side filtering and validation.
Replaces 6-7 separate RPC calls with a single optimized query.

#### Parameters

##### address

`` `0x${string}` ``

The address to check for invitations

#### Returns

`Promise`\<`AvatarInfo`[]\>

Array of avatar info for valid inviters

#### Example

```typescript
const invitations = await rpc.invitation.getInvitations(
  "0xde374ece6fa50e781e81aac78e811b33d16912c7"
)
console.log(invitations) // Array of AvatarInfo
```

---

### getInvitationsFrom()

```ts
getInvitationsFrom(address, accepted): Promise<`0x${string}`[]>;
```

Defined in: [packages/rpc/src/methods/invitation.ts:190](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/invitation.ts#L190)

Get the list of accounts that were invited by a specific avatar

#### Parameters

##### address

`` `0x${string}` ``

The address of the inviter

##### accepted

`boolean` = `false`

If true, returns accepted invitations; if false, returns pending invitations

#### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of invited addresses

#### Example

```typescript
// Get accepted invitations
const accepted = await rpc.invitation.getInvitationsFrom(
  "0xde374ece6fa50e781e81aac78e811b33d16912c7",
  true
)

// Get pending invitations
const pending = await rpc.invitation.getInvitationsFrom(
  "0xde374ece6fa50e781e81aac78e811b33d16912c7",
  false
)
```
