[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [sdk/src](../README.md) / BaseGroupAvatar

# Class: BaseGroupAvatar

Defined in: [packages/sdk/src/avatars/BaseGroupAvatar.ts:22](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/BaseGroupAvatar.ts#L22)

BaseGroupAvatar class implementation
Provides a simplified wrapper around Circles protocol for base group avatars

This class represents a base group avatar in the Circles ecosystem and provides
methods for managing trust relationships, group properties, and metadata.

## Extends

- `CommonAvatar`

## Constructors

### Constructor

```ts
new BaseGroupAvatar(
   address, 
   core, 
   contractRunner?, 
   avatarInfo?): BaseGroupAvatar;
```

Defined in: [packages/sdk/src/avatars/BaseGroupAvatar.ts:25](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/BaseGroupAvatar.ts#L25)

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

`BaseGroupAvatar`

#### Overrides

```ts
CommonAvatar.constructor
```

## Properties

### balances

```ts
readonly balances: object;
```

Defined in: [packages/sdk/src/avatars/BaseGroupAvatar.ts:44](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/BaseGroupAvatar.ts#L44)

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

Get total supply of this group's token

##### Returns

`Promise`\<`bigint`\>

#### Overrides

```ts
CommonAvatar.balances
```

***

### trust

```ts
readonly trust: object;
```

Defined in: [packages/sdk/src/avatars/BaseGroupAvatar.ts:68](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/BaseGroupAvatar.ts#L68)

#### add()

```ts
add: (avatar, expiry?) => Promise<TransactionReceipt>;
```

##### Parameters

###### avatar

`` `0x${string}` `` | `` `0x${string}` ``[]

###### expiry?

`bigint`

##### Returns

`Promise`\<`TransactionReceipt`\>

#### remove()

```ts
remove: (avatar) => Promise<TransactionReceipt>;
```

##### Parameters

###### avatar

`` `0x${string}` `` | `` `0x${string}` ``[]

##### Returns

`Promise`\<`TransactionReceipt`\>

#### isTrusting()

```ts
isTrusting: (otherAvatar) => Promise<boolean>;
```

##### Parameters

###### otherAvatar

`` `0x${string}` ``

##### Returns

`Promise`\<`boolean`\>

#### isTrustedBy()

```ts
isTrustedBy: (otherAvatar) => Promise<boolean>;
```

##### Parameters

###### otherAvatar

`` `0x${string}` ``

##### Returns

`Promise`\<`boolean`\>

#### getAll()

```ts
getAll: () => Promise<AggregatedTrustRelation[]>;
```

##### Returns

`Promise`\<`AggregatedTrustRelation`[]\>

#### addBatchWithConditions()

```ts
addBatchWithConditions: (members, expiry?) => Promise<TransactionReceipt>;
```

Trust a batch of members with membership condition checks

This is a group-specific method that validates members against membership conditions
before establishing trust.

##### Parameters

###### members

`` `0x${string}` ``[]

Array of member addresses

###### expiry?

`bigint`

Trust expiry timestamp. Defaults to 0

##### Returns

`Promise`\<`TransactionReceipt`\>

Transaction response

##### Example

```typescript
// Trust multiple members with condition checks
await groupAvatar.trust.addBatchWithConditions(
  ['0x123...', '0x456...', '0x789...'],
  BigInt(Date.now() / 1000 + 31536000) // 1 year expiry
);
```

#### Overrides

```ts
CommonAvatar.trust
```

***

### profile

```ts
readonly profile: object;
```

Defined in: [packages/sdk/src/avatars/BaseGroupAvatar.ts:151](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/BaseGroupAvatar.ts#L151)

#### get()

```ts
get: () => Promise<Profile | undefined>;
```

##### Returns

`Promise`\<`Profile` \| `undefined`\>

#### update()

```ts
update: (profile) => Promise<string>;
```

##### Parameters

###### profile

`Profile`

##### Returns

`Promise`\<`string`\>

#### updateMetadata()

```ts
updateMetadata: (cid) => Promise<TransactionReceipt>;
```

##### Parameters

###### cid

`string`

##### Returns

`Promise`\<`TransactionReceipt`\>

#### registerShortName()

```ts
registerShortName: (nonce) => Promise<TransactionReceipt>;
```

##### Parameters

###### nonce

`number`

##### Returns

`Promise`\<`TransactionReceipt`\>

#### Overrides

```ts
CommonAvatar.profile
```

***

### properties

```ts
readonly properties: object;
```

Defined in: [packages/sdk/src/avatars/BaseGroupAvatar.ts:214](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/BaseGroupAvatar.ts#L214)

#### owner()

```ts
owner: () => Promise<`0x${string}`>;
```

Get the owner of this group

##### Returns

`Promise`\<`` `0x${string}` ``\>

#### mintHandler()

```ts
mintHandler: () => Promise<`0x${string}`>;
```

Get the mint handler address

##### Returns

`Promise`\<`` `0x${string}` ``\>

#### service()

```ts
service: () => Promise<`0x${string}`>;
```

Get the service address

##### Returns

`Promise`\<`` `0x${string}` ``\>

#### feeCollection()

```ts
feeCollection: () => Promise<`0x${string}`>;
```

Get the fee collection address

##### Returns

`Promise`\<`` `0x${string}` ``\>

#### getMembershipConditions()

```ts
getMembershipConditions: () => Promise<`0x${string}`[]>;
```

Get all membership conditions

##### Returns

`Promise`\<`` `0x${string}` ``[]\>

***

### setProperties

```ts
readonly setProperties: object;
```

Defined in: [packages/sdk/src/avatars/BaseGroupAvatar.ts:256](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/BaseGroupAvatar.ts#L256)

#### owner()

```ts
owner: (newOwner) => Promise<TransactionReceipt>;
```

Set a new owner for this group

##### Parameters

###### newOwner

`` `0x${string}` ``

##### Returns

`Promise`\<`TransactionReceipt`\>

#### service()

```ts
service: (newService) => Promise<TransactionReceipt>;
```

Set a new service address

##### Parameters

###### newService

`` `0x${string}` ``

##### Returns

`Promise`\<`TransactionReceipt`\>

#### feeCollection()

```ts
feeCollection: (newFeeCollection) => Promise<TransactionReceipt>;
```

Set a new fee collection address

##### Parameters

###### newFeeCollection

`` `0x${string}` ``

##### Returns

`Promise`\<`TransactionReceipt`\>

#### membershipCondition()

```ts
membershipCondition: (condition, enabled) => Promise<TransactionReceipt>;
```

Enable or disable a membership condition

##### Parameters

###### condition

`` `0x${string}` ``

###### enabled

`boolean`

##### Returns

`Promise`\<`TransactionReceipt`\>

***

### address

```ts
readonly address: `0x${string}`;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:42](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L42)

#### Inherited from

```ts
CommonAvatar.address
```

***

### avatarInfo

```ts
readonly avatarInfo: AvatarRow | undefined;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:43](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L43)

#### Inherited from

```ts
CommonAvatar.avatarInfo
```

***

### core

```ts
readonly core: Core;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:44](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L44)

#### Inherited from

```ts
CommonAvatar.core
```

***

### contractRunner?

```ts
readonly optional contractRunner: ContractRunner;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:45](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L45)

#### Inherited from

```ts
CommonAvatar.contractRunner
```

***

### events

```ts
events: Observable<CirclesEvent>;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:46](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L46)

#### Inherited from

```ts
CommonAvatar.events
```

***

### runner

```ts
protected readonly runner: ContractRunner;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:48](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L48)

#### Inherited from

```ts
CommonAvatar.runner
```

***

### profiles

```ts
protected readonly profiles: Profiles;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:49](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L49)

#### Inherited from

```ts
CommonAvatar.profiles
```

***

### rpc

```ts
protected readonly rpc: CirclesRpc;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:50](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L50)

#### Inherited from

```ts
CommonAvatar.rpc
```

***

### transferBuilder

```ts
protected readonly transferBuilder: TransferBuilder;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:51](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L51)

#### Inherited from

```ts
CommonAvatar.transferBuilder
```

***

### \_cachedProfile?

```ts
protected optional _cachedProfile: Profile;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:52](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L52)

#### Inherited from

```ts
CommonAvatar._cachedProfile
```

***

### \_cachedProfileCid?

```ts
protected optional _cachedProfileCid: string;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:53](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L53)

#### Inherited from

```ts
CommonAvatar._cachedProfileCid
```

***

### \_eventSubscription()?

```ts
protected optional _eventSubscription: () => void;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:54](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L54)

#### Returns

`void`

#### Inherited from

```ts
CommonAvatar._eventSubscription
```

***

### history

```ts
readonly history: object;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:407](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L407)

#### getTransactions()

```ts
getTransactions: (limit, sortOrder) => PagedQuery<TransactionHistoryRow>;
```

Get transaction history for this avatar using cursor-based pagination
Returns incoming/outgoing transactions and minting events

##### Parameters

###### limit

`number` = `50`

Number of transactions per page (default: 50)

###### sortOrder

Sort order for results (default: 'DESC')

`"ASC"` | `"DESC"`

##### Returns

`PagedQuery`\<`TransactionHistoryRow`\>

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

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:441](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L441)

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

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:601](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L601)

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

## Methods

### subscribeToEvents()

```ts
subscribeToEvents(): Promise<void>;
```

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:712](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L712)

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

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:738](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L738)

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

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:753](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L753)

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

Defined in: [packages/sdk/src/avatars/CommonAvatar.ts:782](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/sdk/src/avatars/CommonAvatar.ts#L782)

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
