[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / InvitationFarmContract

# Class: InvitationFarmContract

Defined in: [packages/core/src/contracts/invitationFarm.ts:12](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L12)

InvitationFarm Contract Wrapper
Provides type-safe methods for interacting with the InvitationFarm contract

This contract manages a farm of InvitationBot instances, distributes/claims invite capacity,
and grows the farm. Users can claim invites from the farm using their allocated quota.

## Extends

- [`Contract`](Contract.md)\<*typeof* `invitationFarmAbi`\>

## Constructors

### Constructor

```ts
new InvitationFarmContract(config): InvitationFarmContract;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:13](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L13)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`InvitationFarmContract`

#### Overrides

[`Contract`](Contract.md).[`constructor`](Contract.md#constructor)

## Properties

### address

```ts
readonly address: `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:9](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L9)

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

Defined in: [packages/core/src/contracts/contract.ts:10](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L10)

#### Inherited from

[`Contract`](Contract.md).[`abi`](Contract.md#abi)

***

### rpcUrl

```ts
protected rpcUrl: string;
```

Defined in: [packages/core/src/contracts/contract.ts:11](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L11)

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

Defined in: [packages/core/src/contracts/contract.ts:29](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L29)

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

Defined in: [packages/core/src/contracts/contract.ts:81](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L81)

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

### claimInvites()

```ts
claimInvites(numberOfInvites): TransactionRequest;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:26](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L26)

Claims multiple invites for the caller, consuming their quota

#### Parameters

##### numberOfInvites

`bigint`

Number of invites to claim

#### Returns

`TransactionRequest`

Transaction request

***

### claimInvite()

```ts
claimInvite(): TransactionRequest;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:38](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L38)

Claims a single invite for the caller, consuming their quota by 1

#### Returns

`TransactionRequest`

Transaction request

***

### invitationFee()

```ts
invitationFee(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:50](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L50)

Get the invitation fee amount in CRC (cost per invite)

#### Returns

`Promise`\<`bigint`\>

The invitation fee constant

***

### inviterQuota()

```ts
inviterQuota(inviter): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:59](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L59)

Get the remaining invite quota for a specific inviter

#### Parameters

##### inviter

`` `0x${string}` ``

The address of the inviter

#### Returns

`Promise`\<`bigint`\>

The remaining quota

***

### totalBots()

```ts
totalBots(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:67](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L67)

Get the total number of bots in the farm

#### Returns

`Promise`\<`bigint`\>

The total number of bots

***

### admin()

```ts
admin(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:75](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L75)

Get the admin address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The admin address

***

### maintainer()

```ts
maintainer(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:83](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L83)

Get the maintainer address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The maintainer address

***

### seeder()

```ts
seeder(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:91](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L91)

Get the seeder address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The seeder address

***

### invitationModule()

```ts
invitationModule(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:99](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L99)

Get the invitation module address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The invitation module address

***

### lastUsedBot()

```ts
lastUsedBot(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:107](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L107)

Get the last used bot in the round-robin allocation

#### Returns

`Promise`\<`` `0x${string}` ``\>

The address of the last used bot

***

### bots()

```ts
bots(bot): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/invitationFarm.ts:116](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/invitationFarm.ts#L116)

Get the next bot in the linked list for a given bot

#### Parameters

##### bot

`` `0x${string}` ``

The bot address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The next bot address
