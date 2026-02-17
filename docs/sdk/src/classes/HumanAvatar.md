[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [sdk/src](../README.md) / HumanAvatar

# Class: HumanAvatar

Defined in: [packages/sdk/src/avatars/HumanAvatar.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/HumanAvatar.ts#L27)

HumanAvatar class implementation
Provides a simplified, user-friendly wrapper around Circles protocol for human avatars

This class represents a human avatar in the Circles ecosystem and provides
methods for managing trust relationships, personal token minting, transfers, and more.

## Extends

- `CommonAvatar`

## Constructors

### Constructor

```ts
new HumanAvatar(
   address, 
   core, 
   contractRunner?, 
   avatarInfo?): HumanAvatar;
```

Defined in: [packages/sdk/src/avatars/HumanAvatar.ts:28](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/HumanAvatar.ts#L28)

#### Parameters

##### address

`` `0x${string}` ``

##### core

`Core`

##### contractRunner?

`ContractRunner`

##### avatarInfo?

`AvatarRow`

#### Returns

`HumanAvatar`

#### Overrides

```ts
CommonAvatar.constructor
```

## Properties

### address

```ts
readonly address: `0x${string}`;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:51](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L51)

#### Inherited from

```ts
CommonAvatar.address
```

***

### avatarInfo

```ts
readonly avatarInfo: AvatarRow | undefined;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:52](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L52)

#### Inherited from

```ts
CommonAvatar.avatarInfo
```

***

### core

```ts
readonly core: Core;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:53](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L53)

#### Inherited from

```ts
CommonAvatar.core
```

***

### contractRunner?

```ts
readonly optional contractRunner: ContractRunner;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:54](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L54)

#### Inherited from

```ts
CommonAvatar.contractRunner
```

***

### events

```ts
events: Observable<CirclesEvent>;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:55](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L55)

#### Inherited from

```ts
CommonAvatar.events
```

***

### runner

```ts
protected readonly runner: ContractRunner;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:84](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L84)

#### Inherited from

```ts
CommonAvatar.runner
```

***

### profiles

```ts
protected readonly profiles: Profiles;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:85](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L85)

#### Inherited from

```ts
CommonAvatar.profiles
```

***

### rpc

```ts
protected readonly rpc: CirclesRpc;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:86](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L86)

#### Inherited from

```ts
CommonAvatar.rpc
```

***

### transferBuilder

```ts
protected readonly transferBuilder: TransferBuilder;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:87](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L87)

#### Inherited from

```ts
CommonAvatar.transferBuilder
```

***

### \_cachedProfile?

```ts
protected optional _cachedProfile: Profile;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:88](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L88)

#### Inherited from

```ts
CommonAvatar._cachedProfile
```

***

### \_cachedProfileCid?

```ts
protected optional _cachedProfileCid: string;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:89](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L89)

#### Inherited from

```ts
CommonAvatar._cachedProfileCid
```

***

### \_eventSubscription()?

```ts
protected optional _eventSubscription: () => void;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:90](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L90)

#### Returns

`void`

#### Inherited from

```ts
CommonAvatar._eventSubscription
```

***

### trust

```ts
readonly trust: object;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:166](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L166)

#### add()

```ts
add: (avatar, expiry?) => Promise<TransactionReceipt>;
```

Trust another avatar or multiple avatars

When using Safe runner, all trust operations are executed atomically in a single transaction.
When using EOA runner, only single avatars are supported (pass array length 1).

##### Parameters

###### avatar

Single avatar address or array of avatar addresses

`` `0x${string}` `` | `` `0x${string}` ``[]

###### expiry?

`bigint`

Trust expiry timestamp (in seconds since epoch). Defaults to max uint96 for indefinite trust

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
// Trust single avatar indefinitely
await avatar.trust.add('0x123...');

// Trust with custom expiry
const oneYear = BigInt(Date.now() / 1000 + 31536000);
await avatar.trust.add('0x123...', oneYear);

// Trust multiple avatars (Safe only - throws error with EOA)
await avatar.trust.add(['0x123...', '0x456...', '0x789...']);
```

#### remove()

```ts
remove: (avatar) => Promise<TransactionReceipt>;
```

Remove trust from another avatar or multiple avatars
This is done by setting the trust expiry to 0

When using Safe runner, all operations are batched atomically.
When using EOA runner, only single avatars are supported (pass array length 1).

##### Parameters

###### avatar

Single avatar address or array of avatar addresses

`` `0x${string}` `` | `` `0x${string}` ``[]

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
// Remove trust from single avatar
await avatar.trust.remove('0x123...');

// Remove trust from multiple avatars (Safe only)
await avatar.trust.remove(['0x123...', '0x456...', '0x789...']);
```

#### isTrusting()

```ts
isTrusting: (otherAvatar) => Promise<boolean>;
```

Check if this avatar trusts another avatar

##### Parameters

###### otherAvatar

`` `0x${string}` ``

The avatar address to check

##### Returns

`Promise`\<`boolean`\>

True if this avatar trusts the other avatar

##### Example

```typescript
const trusting = await avatar.trust.isTrusting('0x123...');
if (trusting) {
  console.log('You trust this avatar');
}
```

#### isTrustedBy()

```ts
isTrustedBy: (otherAvatar) => Promise<boolean>;
```

Check if another avatar trusts this avatar

##### Parameters

###### otherAvatar

`` `0x${string}` ``

The avatar address to check

##### Returns

`Promise`\<`boolean`\>

True if the other avatar trusts this avatar

##### Example

```typescript
const trustedBy = await avatar.trust.isTrustedBy('0x123...');
if (trustedBy) {
  console.log('This avatar trusts you');
}
```

#### getAll()

```ts
getAll: () => Promise<AggregatedTrustRelation[]>;
```

Get all trust relations for this avatar

##### Returns

`Promise`\<`AggregatedTrustRelation`[]\>

#### Inherited from

```ts
CommonAvatar.trust
```

***

### profile

```ts
readonly profile: object;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:305](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L305)

#### get()

```ts
get: () => Promise<Profile | undefined>;
```

Get the profile for this avatar from IPFS
Uses caching to avoid redundant fetches for the same CID

##### Returns

`Promise`\<`Profile` \| `undefined`\>

The profile data, or undefined if no profile is set or fetch fails

##### Example

```typescript
const profile = await avatar.profile.get();
if (profile) {
  console.log('Name:', profile.name);
  console.log('Description:', profile.description);
}
```

#### update()

```ts
update: (profile) => Promise<string>;
```

Update the profile for this avatar
This will:
1. Pin the new profile data to IPFS via the profile service
2. Update the metadata digest in the name registry contract

##### Parameters

###### profile

`Profile`

The profile data to update

##### Returns

`Promise`\<`string`\>

The CID of the newly pinned profile

##### Example

```typescript
const profile = {
  name: 'Alice',
  description: 'Hello, Circles!',
  avatarUrl: 'https://example.com/avatar.png'
};

const cid = await avatar.profile.update(profile);
console.log('Profile updated with CID:', cid);
```

#### updateMetadata()

```ts
updateMetadata: (cid) => Promise<TransactionReceipt>;
```

Update the metadata digest (CID) in the name registry
This updates the on-chain pointer to the profile data stored on IPFS

##### Parameters

###### cid

`string`

The IPFS CIDv0 to set as the metadata digest (e.g., "QmXxxx...")

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
const receipt = await avatar.profile.updateMetadata('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
console.log('Metadata updated, tx hash:', receipt.hash);
```

#### registerShortName()

```ts
registerShortName: (nonce) => Promise<TransactionReceipt>;
```

Register a short name for this avatar using a specific nonce
Short names are numeric identifiers that can be used instead of addresses

##### Parameters

###### nonce

`number`

The nonce to use for generating the short name

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
// Find available nonce first
const [shortName, nonce] = await core.nameRegistry.searchShortName(avatar.address);
console.log('Available short name:', shortName.toString());

// Register it
const receipt = await avatar.profile.registerShortName(Number(nonce));
console.log('Short name registered, tx hash:', receipt.hash);
```

#### Inherited from

```ts
CommonAvatar.profile
```

***

### history

```ts
readonly history: object;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:443](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L443)

#### getTransactions()

```ts
getTransactions: (limit) => Promise<PagedResponse<TransactionHistoryRow>>;
```

Get transaction history for this avatar using cursor-based pagination
Returns incoming/outgoing transactions and minting events

##### Parameters

###### limit

`number` = `50`

Number of transactions per page (default: 50)

##### Returns

`Promise`\<`PagedResponse`\<`TransactionHistoryRow`\>\>

PagedQuery instance for iterating through transactions

##### Example

```typescript
const query = avatar.history.getTransactions(20);

// Get first page
await query.queryNextPage();
query.currentPage.results.forEach(tx => {
  console.log(`${tx.from} -> ${tx.to}: ${tx.circles} CRC`);
});

// Get next page if available
if (query.currentPage.hasMore) {
  await query.queryNextPage();
}
```

#### Inherited from

```ts
CommonAvatar.history
```

***

### transfer

```ts
readonly transfer: object;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:477](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L477)

#### direct()

```ts
direct: (to, amount, tokenAddress?, txData?) => Promise<TransactionReceipt>;
```

Send Circles tokens directly to another address
This is a simple direct transfer without pathfinding

Supports both ERC1155 (personal/group tokens) and ERC20 (wrapped tokens) transfers.
The token type is automatically detected and the appropriate transfer method is used.

For transfers using pathfinding (which can use trust network and multiple token types),
use transfer.advanced() instead.

##### Parameters

###### to

`` `0x${string}` ``

Recipient address

###### amount

`bigint`

Amount to transfer (in atto-circles)

###### tokenAddress?

`` `0x${string}` ``

Token address to transfer (defaults to sender's personal token)

###### txData?

`Uint8Array`\<`ArrayBufferLike`\>

Optional transaction data (only used for ERC1155 transfers)

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
// Send 100 of your personal CRC directly
const receipt = await avatar.transfer.direct('0x123...', BigInt(100e18));

// Send wrapped tokens
const receipt = await avatar.transfer.direct('0x123...', BigInt(100e18), '0xWrappedTokenAddress...');
```

#### advanced()

```ts
advanced: (to, amount, options?) => Promise<TransactionReceipt>;
```

Send tokens using pathfinding through the trust network
This enables transfers even when you don't have the recipient's token

##### Parameters

###### to

`` `0x${string}` ``

Recipient address

###### amount

Amount to transfer (in atto-circles or CRC)

`number` | `bigint`

###### options?

`AdvancedTransferOptions`

Advanced transfer options (pathfinding parameters)

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
// Send 100 CRC using pathfinding
await avatar.transfer.advanced('0x123...', BigInt(100e18));

// With custom options
await avatar.transfer.advanced('0x123...', 100, {
  maxTransfers: 5,
  maxDistance: 3
});
```

#### getMaxAmount()

```ts
getMaxAmount: (to) => Promise<bigint>;
```

Get the maximum amount that can be transferred to an address using pathfinding

##### Parameters

###### to

`` `0x${string}` ``

Recipient address

##### Returns

`Promise`\<`bigint`\>

Maximum transferable amount (in atto-circles)

##### Example

```typescript
const maxAmount = await avatar.transfer.getMaxAmount('0x123...');
console.log(`Can transfer up to: ${maxAmount}`);
```

#### getMaxAmountAdvanced()

```ts
getMaxAmountAdvanced: (to, options?) => Promise<bigint>;
```

Get the maximum amount that can be transferred with custom pathfinding options

##### Parameters

###### to

`` `0x${string}` ``

Recipient address

###### options?

[`PathfindingOptions`](../type-aliases/PathfindingOptions.md)

Pathfinding options (maxTransfers, maxDistance, etc.)

##### Returns

`Promise`\<`bigint`\>

Maximum transferable amount (in atto-circles)

##### Example

```typescript
const maxAmount = await avatar.transfer.getMaxAmountAdvanced('0x123...', {
  maxTransfers: 3,
  maxDistance: 2
});
```

#### Inherited from

```ts
CommonAvatar.transfer
```

***

### wrap

```ts
readonly wrap: object;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:637](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L637)

#### asDemurraged()

```ts
asDemurraged: (avatarAddress, amount) => Promise<TransactionReceipt>;
```

Wrap personal CRC tokens as demurraged ERC20 tokens

##### Parameters

###### avatarAddress

`` `0x${string}` ``

The avatar whose tokens to wrap

###### amount

`bigint`

Amount to wrap (in atto-circles)

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
// Wrap 100 CRC as demurraged ERC20
const receipt = await avatar.wrap.asDemurraged(avatar.address, BigInt(100e18));
```

#### asInflationary()

```ts
asInflationary: (avatarAddress, amount) => Promise<TransactionReceipt>;
```

Wrap personal CRC tokens as inflationary ERC20 tokens

##### Parameters

###### avatarAddress

`` `0x${string}` ``

The avatar whose tokens to wrap

###### amount

`bigint`

Amount to wrap (in atto-circles)

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
// Wrap 100 CRC as inflationary ERC20
const receipt = await avatar.wrap.asInflationary(avatar.address, BigInt(100e18));
```

#### unwrapDemurraged()

```ts
unwrapDemurraged: (tokenAddress, amount) => Promise<TransactionReceipt>;
```

Unwrap demurraged ERC20 tokens back to personal CRC

##### Parameters

###### tokenAddress

`` `0x${string}` ``

The demurraged token address to unwrap

###### amount

`bigint`

Amount to unwrap (in atto-circles)

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
const receipt = await avatar.wrap.unwrapDemurraged('0xTokenAddress...', BigInt(100e18));
```

#### unwrapInflationary()

```ts
unwrapInflationary: (tokenAddress, amount) => Promise<TransactionReceipt>;
```

Unwrap inflationary ERC20 tokens back to personal CRC

##### Parameters

###### tokenAddress

`` `0x${string}` ``

The inflationary token address to unwrap

###### amount

`bigint`

Amount to unwrap (in atto-circles)

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
const receipt = await avatar.wrap.unwrapInflationary('0xTokenAddress...', BigInt(100e18));
```

#### Inherited from

```ts
CommonAvatar.wrap
```

***

### balances

```ts
readonly balances: object;
```

Defined in: [packages/sdk/src/avatars/HumanAvatar.ts:41](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/HumanAvatar.ts#L41)

#### getTotal()

```ts
getTotal: () => Promise<bigint>;
```

##### Returns

`Promise`\<`bigint`\>

#### getTokenBalances()

```ts
getTokenBalances: () => Promise<TokenBalanceRow[]>;
```

##### Returns

`Promise`\<`TokenBalanceRow`[]\>

#### getTotalSupply()

```ts
getTotalSupply: () => Promise<bigint>;
```

##### Returns

`Promise`\<`bigint`\>

#### getMaxReplenishable()

```ts
getMaxReplenishable: (options?) => Promise<bigint>;
```

Get the maximum amount that can be replenished (converted to unwrapped personal CRC)
This calculates how much of your wrapped tokens and other tokens can be converted
into your own unwrapped ERC1155 personal CRC tokens using pathfinding

##### Parameters

###### options?

[`PathfindingOptions`](../type-aliases/PathfindingOptions.md)

Optional pathfinding options

##### Returns

`Promise`\<`bigint`\>

Maximum replenishable amount in atto-circles

##### Example

```typescript
const maxReplenishable = await avatar.balances.getMaxReplenishable();
console.log('Can replenish:', CirclesConverter.attoCirclesToCircles(maxReplenishable), 'CRC');
```

#### replenish()

```ts
replenish: (options?) => Promise<TransactionReceipt>;
```

Replenish unwrapped personal CRC tokens by converting wrapped/other tokens

This method uses pathfinding to find the best way to convert your available tokens
(including wrapped tokens) into unwrapped ERC1155 personal CRC tokens.

Useful when you have wrapped tokens or other people's tokens and want to
convert them to your own personal unwrapped tokens for transfers.

##### Parameters

###### options?

[`PathfindingOptions`](../type-aliases/PathfindingOptions.md)

Optional pathfinding options

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
// Convert all available wrapped/other tokens to unwrapped personal CRC
const receipt = await avatar.balances.replenish();
console.log('Replenished personal tokens, tx hash:', receipt.hash);
```

#### Overrides

```ts
CommonAvatar.balances
```

***

### invite

```ts
readonly invite: object;
```

Defined in: [packages/sdk/src/avatars/HumanAvatar.ts:135](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/HumanAvatar.ts#L135)

#### send()

```ts
send: (invitee) => Promise<TransactionReceipt>;
```

Invite someone to Circles by escrowing 100 CRC tokens

This batches two transactions atomically:
1. Establishes trust with the invitee (with indefinite expiry)
2. Transfers 100 of your personal CRC tokens to the InvitationEscrow contract

The tokens are held in escrow until the invitee redeems the invitation by registering.

Requirements:
- You must have at least 100 CRC available
- Invitee must not be already registered in Circles
- You can only have one active invitation per invitee

##### Parameters

###### invitee

`` `0x${string}` ``

The address to invite

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
// Invite someone with 100 CRC (automatically establishes trust)
await avatar.invite.send('0x123...');
```

#### revoke()

```ts
revoke: (invitee) => Promise<TransactionReceipt>;
```

Revoke a previously sent invitation

This returns the escrowed tokens (with demurrage applied) back to you
as wrapped ERC20 tokens.

##### Parameters

###### invitee

`` `0x${string}` ``

The address whose invitation to revoke

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
await avatar.invite.revoke('0x123...');
```

#### revokeAll()

```ts
revokeAll: () => Promise<TransactionReceipt>;
```

Revoke all active invitations at once

This returns all escrowed tokens (with demurrage applied) back to you
as wrapped ERC20 tokens in a single transaction.

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
await avatar.invite.revokeAll();
```

#### redeem()

```ts
redeem: (inviter) => Promise<TransactionReceipt>;
```

Redeem an invitation received from an inviter

This claims the escrowed tokens from a specific inviter and refunds
all other inviters' escrows back to them.

##### Parameters

###### inviter

`` `0x${string}` ``

The address of the inviter whose invitation to redeem

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
// Get all inviters first
const inviters = await avatar.invite.getInviters();

// Redeem invitation from the first inviter
await avatar.invite.redeem(inviters[0]);
```

#### getInviters()

```ts
getInviters: () => Promise<`0x${string}`[]>;
```

Get all addresses that have sent invitations to you

##### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of inviter addresses

##### Example

```typescript
const inviters = await avatar.invite.getInviters();
console.log(`You have ${inviters.length} pending invitations`);
```

#### getInvitees()

```ts
getInvitees: () => Promise<`0x${string}`[]>;
```

Get all addresses you have invited

##### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of invitee addresses

##### Example

```typescript
const invitees = await avatar.invite.getInvitees();
console.log(`You have invited ${invitees.length} people`);
```

#### getEscrowedAmount()

```ts
getEscrowedAmount: (inviter, invitee) => Promise<EscrowedAmountAndDays>;
```

Get the escrowed amount and days since escrow for a specific invitation

The amount returned has demurrage applied, so it decreases over time.

##### Parameters

###### inviter

`` `0x${string}` ``

The inviter address (when checking invitations you received)

###### invitee

`` `0x${string}` ``

The invitee address (when checking invitations you sent)

##### Returns

`Promise`\<`EscrowedAmountAndDays`\>

Object with escrowedAmount (in atto-circles) and days since escrow

##### Example

```typescript
// Check an invitation you sent
const { escrowedAmount, days_ } = await avatar.invite.getEscrowedAmount(
  avatar.address,
  '0xinvitee...'
);
console.log(`Escrowed: ${CirclesConverter.attoCirclesToCircles(escrowedAmount)} CRC`);
console.log(`Days since escrow: ${days_}`);

// Check an invitation you received
const { escrowedAmount, days_ } = await avatar.invite.getEscrowedAmount(
  '0xinviter...',
  avatar.address
);
```

#### generateInvites()

```ts
generateInvites: (numberOfInvites) => Promise<{
  secrets: `0x${string}`[];
  signers: `0x${string}`[];
  transactionReceipt: TransactionReceipt;
}>;
```

Generate new invitations and return associated secrets and signer addresses

This function:
1. Calls invitationFarm.claimInvites() to get invitation IDs via eth_call
2. Generates random secrets for each invitation
3. Derives signer addresses from the secrets using ECDSA
4. Batches the claimInvites write call with safeBatchTransferFrom to transfer
   invitation tokens (96 CRC each) to the invitation module
5. Returns the list of secrets and corresponding signers

The data field in the batch transfer contains the count of generated secrets,
which the contract uses to validate the transfer.

##### Parameters

###### numberOfInvites

`bigint`

The number of invitations to generate

##### Returns

`Promise`\<\{
  `secrets`: `` `0x${string}` ``[];
  `signers`: `` `0x${string}` ``[];
  `transactionReceipt`: `TransactionReceipt`;
\}\>

Promise containing arrays of secrets and signers for each generated invitation

##### Throws

If the transaction fails or invitations cannot be claimed

##### Example

```typescript
// Generate 5 invitations
const result = await avatar.invite.generateInvites(5n);

console.log('Generated invitations:');
result.secrets.forEach((secret, index) => {
  console.log(`Invitation ${index + 1}:`);
  console.log(`  Secret: ${secret}`);
  console.log(`  Signer: ${result.signers[index]}`);
});
```

***

### personalToken

```ts
readonly personalToken: object;
```

Defined in: [packages/sdk/src/avatars/HumanAvatar.ts:440](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/HumanAvatar.ts#L440)

#### getMintableAmount()

```ts
getMintableAmount: () => Promise<{
  amount: bigint;
  startPeriod: bigint;
  endPeriod: bigint;
}>;
```

Get the available amount of personal tokens that can be minted

This method calls the HubV2 contract's calculateIssuance function which returns:
- Total issuance amount: The total amount of tokens that can be minted
- Start period: The period when minting started
- End period: The current period

##### Returns

`Promise`\<\{
  `amount`: `bigint`;
  `startPeriod`: `bigint`;
  `endPeriod`: `bigint`;
\}\>

Object containing issuance amount (in atto-circles), start period, and end period

##### Example

```typescript
const { amount, startPeriod, endPeriod } = await avatar.personalToken.getMintableAmount();
console.log('Mintable amount:', CirclesConverter.attoCirclesToCircles(amount), 'CRC');
console.log('Start period:', startPeriod.toString());
console.log('End period:', endPeriod.toString());
```

#### mint()

```ts
mint: () => Promise<TransactionReceipt>;
```

Mint personal Circles tokens
This claims all available personal tokens that have accrued since last mint

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
const receipt = await avatar.personalToken.mint();
console.log('Minted tokens, tx hash:', receipt.hash);
```

#### stop()

```ts
stop: () => Promise<TransactionReceipt>;
```

Stop personal token minting
This permanently stops the ability to mint new personal tokens

WARNING: This action is irreversible!

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
const receipt = await avatar.personalToken.stop();
console.log('Stopped minting, tx hash:', receipt.hash);
```

***

### groupToken

```ts
readonly groupToken: object;
```

Defined in: [packages/sdk/src/avatars/HumanAvatar.ts:520](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/HumanAvatar.ts#L520)

#### mint()

```ts
mint: (group, amount) => Promise<TransactionReceipt>;
```

Mint group tokens by transferring collateral to the group's mint handler
Uses pathfinding to transfer tokens along the trust network, including wrapped tokens

##### Parameters

###### group

`` `0x${string}` ``

The group address to mint tokens from

###### amount

`bigint`

Amount of tokens to transfer to the mint handler (in atto-circles)

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction receipt

##### Example

```typescript
// Mint group tokens by sending 100 CRC to the group's mint handler
const receipt = await avatar.groupToken.mint('0xGroupAddress...', BigInt(100e18));
```

#### getMaxMintableAmount()

```ts
getMaxMintableAmount: (group) => Promise<bigint>;
```

Get the maximum amount that can be minted for a group
This calculates the maximum transferable amount to the group's mint handler
including wrapped token balances

##### Parameters

###### group

`` `0x${string}` ``

The group address

##### Returns

`Promise`\<`bigint`\>

Maximum mintable amount in atto-circles

##### Example

```typescript
const maxMintable = await avatar.groupToken.getMaxMintableAmount('0xGroupAddress...');
console.log('Can mint up to:', maxMintable.toString(), 'atto-circles');
```

#### redeem()

```ts
redeem: (group, amount) => Promise<TransactionReceipt>;
```

Automatically redeem collateral tokens from a Base Group's treasury

Performs automatic redemption by determining trusted collaterals and using pathfinder for optimal flow.
Only supports Base Group types. The function uses pathfinder to determine the optimal redemption path
and validates that sufficient liquidity exists before attempting redemption.

##### Parameters

###### group

`` `0x${string}` ``

The address of the Base Group from which to redeem collateral tokens

###### amount

`bigint`

The amount of group tokens to redeem for collateral (must be > 0 and <= max redeemable)

##### Returns

`Promise`\<`TransactionReceipt`\>

A Promise resolving to the transaction receipt upon successful automatic redemption

##### Example

```typescript
// Redeem 100 group tokens for collateral
const receipt = await avatar.groupToken.redeem('0xGroupAddress...', BigInt(100e18));
```

#### properties

```ts
properties: object;
```

##### properties.owner()

```ts
owner: (group) => Promise<`0x${string}`>;
```

Get the owner of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The owner address of the group

##### properties.mintHandler()

```ts
mintHandler: (group) => Promise<`0x${string}`>;
```

Get the mint handler address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The mint handler address

##### properties.treasury()

```ts
treasury: (group) => Promise<`0x${string}`>;
```

Get the treasury (redemption handler) address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The treasury address where redemptions are handled

##### properties.service()

```ts
service: (group) => Promise<`0x${string}`>;
```

Get the service address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The service address

##### properties.feeCollection()

```ts
feeCollection: (group) => Promise<`0x${string}`>;
```

Get the fee collection address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The fee collection address

##### properties.getMembershipConditions()

```ts
getMembershipConditions: (group) => Promise<`0x${string}`[]>;
```

Get all membership conditions for a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of membership condition addresses

***

### group

```ts
readonly group: object;
```

Defined in: [packages/sdk/src/avatars/HumanAvatar.ts:784](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/HumanAvatar.ts#L784)

#### properties

```ts
properties: object;
```

##### properties.owner()

```ts
owner: (group) => Promise<`0x${string}`>;
```

Get the owner of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The owner address of the group

##### properties.mintHandler()

```ts
mintHandler: (group) => Promise<`0x${string}`>;
```

Get the mint handler address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The mint handler address

##### properties.treasury()

```ts
treasury: (group) => Promise<`0x${string}`>;
```

Get the treasury (redemption handler) address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The treasury address where redemptions are handled

##### properties.service()

```ts
service: (group) => Promise<`0x${string}`>;
```

Get the service address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The service address

##### properties.feeCollection()

```ts
feeCollection: (group) => Promise<`0x${string}`>;
```

Get the fee collection address of a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``\>

The fee collection address

##### properties.getMembershipConditions()

```ts
getMembershipConditions: (group) => Promise<`0x${string}`[]>;
```

Get all membership conditions for a specific group

###### Parameters

###### group

`` `0x${string}` ``

The group address

###### Returns

`Promise`\<`` `0x${string}` ``[]\>

Array of membership condition addresses

#### getGroupMemberships()

```ts
getGroupMemberships: (limit) => Promise<PagedResponse<GroupMembershipRow>>;
```

Get group memberships for this avatar using cursor-based pagination

Returns a PagedQuery instance for iterating through all groups that this avatar is a member of,
including membership details such as expiry time and when the membership was created.

##### Parameters

###### limit

`number` = `50`

Number of memberships per page (default: 50)

##### Returns

`Promise`\<`PagedResponse`\<`GroupMembershipRow`\>\>

PagedQuery instance for iterating through memberships

##### Example

```typescript
const query = avatar.group.getGroupMemberships();

// Get first page
await query.queryNextPage();
console.log(`Member of ${query.currentPage.size} groups (page 1)`);

// Iterate through all memberships
while (await query.queryNextPage()) {
  query.currentPage.results.forEach(membership => {
    console.log(`Group: ${membership.group}`);
    console.log(`Expiry: ${new Date(membership.expiryTime * 1000).toLocaleDateString()}`);
  });
}
```

#### getGroupMembershipsWithDetails()

```ts
getGroupMembershipsWithDetails: (limit) => Promise<GroupRow[]>;
```

Get detailed information about all groups this avatar is a member of

This method fetches group memberships and enriches them with full group details including
name, symbol, owner, treasury, mint handler, member count, and other properties.

##### Parameters

###### limit

`number` = `50`

Maximum number of memberships to return (default: 50)

##### Returns

`Promise`\<`GroupRow`[]\>

Array of group detail rows

##### Example

```typescript
// Get detailed information about all group memberships
const groups = await avatar.group.getGroupMembershipsWithDetails();

groups.forEach(group => {
  console.log(`Group: ${group.name} (${group.symbol})`);
  console.log(`Owner: ${group.owner}`);
  console.log(`Member count: ${group.memberCount}`);
  console.log(`Treasury: ${group.treasury}`);
});
```

## Accessors

### sdk

#### Get Signature

```ts
get sdk(): SdkReference;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:68](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L68)

Get the parent SDK instance.
Throws if the avatar was not created via Sdk.getAvatar().

##### Returns

`SdkReference`

#### Inherited from

```ts
CommonAvatar.sdk
```

## Methods

### setSdk()

```ts
setSdk(sdk): void;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:80](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L80)

**`Internal`**

Set the parent SDK reference.
Called internally by Sdk.getAvatar().

#### Parameters

##### sdk

`SdkReference`

#### Returns

`void`

#### Inherited from

```ts
CommonAvatar.setSdk
```

***

### subscribeToEvents()

```ts
subscribeToEvents(): Promise<void>;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:748](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L748)

Subscribe to Circles events for this avatar
Events are filtered to only include events related to this avatar's address
This method is idempotent - calling it multiple times will not create duplicate subscriptions

#### Returns

`Promise`\<`void`\>

Promise that resolves when subscription is established

#### Example

```typescript
await avatar.subscribeToEvents();

// Listen for events
avatar.events.subscribe((event) => {
  console.log('Event received:', event.$event, event);

  if (event.$event === 'CrcV2_PersonalMint') {
    console.log('Minted:', event.amount);
  }
});
```

#### Inherited from

```ts
CommonAvatar.subscribeToEvents
```

***

### unsubscribeFromEvents()

```ts
unsubscribeFromEvents(): void;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:774](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L774)

Unsubscribe from events
Cleans up the WebSocket connection and event listeners

#### Returns

`void`

#### Inherited from

```ts
CommonAvatar.unsubscribeFromEvents
```

***

### \_transferErc1155()

```ts
protected _transferErc1155(
   tokenAddress, 
   to, 
   amount, 
txData?): Promise<TransactionReceipt>;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:789](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L789)

Transfer ERC1155 tokens using safeTransferFrom

#### Parameters

##### tokenAddress

`` `0x${string}` ``

##### to

`` `0x${string}` ``

##### amount

`bigint`

##### txData?

`Uint8Array`\<`ArrayBufferLike`\>

#### Returns

`Promise`\<`TransactionReceipt`\>

#### Inherited from

```ts
CommonAvatar._transferErc1155
```

***

### \_transferErc20()

```ts
protected _transferErc20(
   to, 
   amount, 
tokenAddress): Promise<TransactionReceipt>;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:818](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/sdk/src/avatars/CommonAvatar.ts#L818)

Transfer ERC20 tokens using the standard transfer function

#### Parameters

##### to

`` `0x${string}` ``

##### amount

`bigint`

##### tokenAddress

`` `0x${string}` ``

#### Returns

`Promise`\<`TransactionReceipt`\>

#### Inherited from

```ts
CommonAvatar._transferErc20
```
