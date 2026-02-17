[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / HubV2Contract

# Class: HubV2Contract

Defined in: [packages/core/src/contracts/hubV2.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L9)

HubV2 Contract Wrapper
Provides type-safe methods for interacting with Circles HubV2 contract

## Extends

- [`Contract`](Contract.md)\<*typeof* `hubV2Abi`\>

## Constructors

### Constructor

```ts
new HubV2Contract(config): HubV2Contract;
```

Defined in: [packages/core/src/contracts/hubV2.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L10)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`HubV2Contract`

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

### isHuman()

```ts
isHuman(address): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L20)

Check if an address is registered as a human

#### Parameters

##### address

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

***

### isGroup()

```ts
isGroup(address): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L27)

Check if an address is registered as a group

#### Parameters

##### address

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

***

### isOrganization()

```ts
isOrganization(address): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:34](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L34)

Check if an address is registered as an organization

#### Parameters

##### address

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

***

### balanceOf()

```ts
balanceOf(account, id): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:41](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L41)

Get balance of a specific token ID for an account

#### Parameters

##### account

`` `0x${string}` ``

##### id

`bigint`

#### Returns

`Promise`\<`bigint`\>

***

### balanceOfBatch()

```ts
balanceOfBatch(accounts, ids): Promise<readonly bigint[]>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:48](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L48)

Get balances of multiple token IDs for multiple accounts

#### Parameters

##### accounts

readonly `` `0x${string}` ``[]

##### ids

readonly `bigint`[]

#### Returns

`Promise`\<readonly `bigint`[]\>

***

### totalSupply()

```ts
totalSupply(id): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:55](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L55)

Get total supply of a specific token ID

#### Parameters

##### id

`bigint`

#### Returns

`Promise`\<`bigint`\>

***

### isTrusted()

```ts
isTrusted(truster, trustee): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:62](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L62)

Check if an address trusts another address

#### Parameters

##### truster

`` `0x${string}` ``

##### trustee

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

***

### isApprovedForAll()

```ts
isApprovedForAll(owner, operator): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:69](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L69)

Check if an operator is approved to manage all tokens for an owner

#### Parameters

##### owner

`` `0x${string}` ``

##### operator

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

***

### toTokenId()

```ts
toTokenId(avatar): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:76](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L76)

Convert token ID to avatar address

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`bigint`\>

***

### calculateIssuance()

```ts
calculateIssuance(human): Promise<readonly [bigint, bigint, bigint]>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:84](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L84)

Calculate issuance for a human avatar

#### Parameters

##### human

`` `0x${string}` ``

#### Returns

`Promise`\<readonly \[`bigint`, `bigint`, `bigint`\]\>

***

### day()

```ts
day(timestamp): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:91](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L91)

Get the current day based on timestamp

#### Parameters

##### timestamp

`bigint`

#### Returns

`Promise`\<`bigint`\>

***

### inflationDayZero()

```ts
inflationDayZero(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:98](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L98)

Get inflation day zero

#### Returns

`Promise`\<`bigint`\>

***

### stopped()

```ts
stopped(human, options?): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/hubV2.ts:107](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L107)

Check if a human has stopped their Circles minting

#### Parameters

##### human

`` `0x${string}` ``

The address to check

##### options?

Optional call options (e.g., { from: Address })

###### from?

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

***

### personalMint()

```ts
personalMint(): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:115](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L115)

Create a personal mint transaction
Mints personal Circles tokens for the caller

#### Returns

`TransactionRequest`

***

### groupMint()

```ts
groupMint(
   group, 
   collateralAvatars, 
   amounts, 
   data): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:132](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L132)

Create a group mint transaction
Mints group tokens backed by collateral from avatars

#### Parameters

##### group

`` `0x${string}` ``

The group address to mint tokens for

##### collateralAvatars

readonly `` `0x${string}` ``[]

Array of avatar addresses providing collateral

##### amounts

readonly `bigint`[]

Array of amounts corresponding to each collateral avatar

##### data

`` `0x${string}` `` = `'0x'`

Additional data to pass to the contract (use '0x' for no data)

#### Returns

`TransactionRequest`

***

### trust()

```ts
trust(trustReceiver, expiry): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:149](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L149)

Create a trust transaction
Trust another address until the specified expiry time

#### Parameters

##### trustReceiver

`` `0x${string}` ``

##### expiry

`bigint`

#### Returns

`TransactionRequest`

***

### registerHuman()

```ts
registerHuman(inviter, metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:160](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L160)

Create a register human transaction

#### Parameters

##### inviter

`` `0x${string}` ``

##### metadataDigest

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### registerOrganization()

```ts
registerOrganization(name, metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:171](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L171)

Create a register organization transaction

#### Parameters

##### name

`string`

##### metadataDigest

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### registerGroup()

```ts
registerGroup(
   mint, 
   name, 
   symbol, 
   metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:182](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L182)

Create a register group transaction

#### Parameters

##### mint

`` `0x${string}` ``

##### name

`string`

##### symbol

`string`

##### metadataDigest

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### safeTransferFrom()

```ts
safeTransferFrom(
   from, 
   to, 
   id, 
   amount, 
   data): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:198](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L198)

Create a safe transfer transaction

#### Parameters

##### from

`` `0x${string}` ``

##### to

`` `0x${string}` ``

##### id

`bigint`

##### amount

`bigint`

##### data

`` `0x${string}` `` = `'0x'`

#### Returns

`TransactionRequest`

***

### safeBatchTransferFrom()

```ts
safeBatchTransferFrom(
   from, 
   to, 
   ids, 
   amounts, 
   data): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:215](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L215)

Create a batch transfer transaction

#### Parameters

##### from

`` `0x${string}` ``

##### to

`` `0x${string}` ``

##### ids

readonly `bigint`[]

##### amounts

readonly `bigint`[]

##### data

`` `0x${string}` `` = `'0x'`

#### Returns

`TransactionRequest`

***

### setApprovalForAll()

```ts
setApprovalForAll(operator, approved): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:232](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L232)

Create an approval for all transaction

#### Parameters

##### operator

`` `0x${string}` ``

##### approved

`boolean`

#### Returns

`TransactionRequest`

***

### burn()

```ts
burn(
   id, 
   amount, 
   data): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:243](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L243)

Create a burn transaction

#### Parameters

##### id

`bigint`

##### amount

`bigint`

##### data

`` `0x${string}` `` = `'0x'`

#### Returns

`TransactionRequest`

***

### stop()

```ts
stop(): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:256](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L256)

Create a stop transaction
Permanently stops the ability to mint new personal tokens
WARNING: This action is irreversible!

#### Returns

`TransactionRequest`

***

### wrap()

```ts
wrap(
   avatar, 
   amount, 
   circlesType): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:273](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L273)

Create a wrap transaction
Wraps ERC1155 Circles tokens into ERC20 format

#### Parameters

##### avatar

`` `0x${string}` ``

The avatar address whose tokens to wrap

##### amount

`bigint`

The amount to wrap

##### circlesType

`number`

The type of wrapper (0 for Demurrage, 1 for Inflationary)

#### Returns

`TransactionRequest`

Transaction request that will return the wrapper address when executed

***

### operateFlowMatrix()

```ts
operateFlowMatrix(
   flowVertices, 
   flowEdges, 
   streams, 
   packedCoordinates): TransactionRequest;
```

Defined in: [packages/core/src/contracts/hubV2.ts:294](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/hubV2.ts#L294)

Create an operateFlowMatrix transaction
Executes a batch of token transfers based on the flow matrix

#### Parameters

##### flowVertices

readonly `` `0x${string}` ``[]

Array of addresses involved in the transfer

##### flowEdges

readonly `object`[]

Array of flow edges with stream sink IDs and amounts

##### streams

readonly `object`[]

Array of streams defining the transfer paths

##### packedCoordinates

`` `0x${string}` ``

Packed coordinate data

#### Returns

`TransactionRequest`
