[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / BaseGroupContract

# Class: BaseGroupContract

Defined in: [packages/core/src/contracts/baseGroup.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L20)

BaseGroup Contract Wrapper
Provides type-safe methods for interacting with Circles BaseGroup contracts

Note: BaseGroup contracts have multiple instances (not a singleton).
Create instances with specific contract addresses.

## Example

```typescript
const baseGroup = new BaseGroupContract({
  address: '0x...', // specific BaseGroup instance address
  rpcUrl: 'https://rpc.gnosischain.com'
});
```

## Extends

- [`Contract`](Contract.md)\<*typeof* `baseGroupAbi`\>

## Constructors

### Constructor

```ts
new BaseGroupContract(config): BaseGroupContract;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:21](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L21)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`BaseGroupContract`

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
readonly abi: [{
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

### BASE\_MINT\_HANDLER()

```ts
BASE_MINT_HANDLER(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:32](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L32)

Get the BaseMintHandler contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### BASE\_MINT\_POLICY()

```ts
BASE_MINT_POLICY(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:39](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L39)

Get the base mint policy address (constant)

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### BASE\_TREASURY()

```ts
BASE_TREASURY(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:46](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L46)

Get the BaseTreasury contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### MAX\_CONDITIONS()

```ts
MAX_CONDITIONS(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:53](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L53)

Get the maximum number of membership conditions allowed (constant)

#### Returns

`Promise`\<`bigint`\>

***

### owner()

```ts
owner(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:60](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L60)

Get the current owner address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### service()

```ts
service(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:67](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L67)

Get the current service address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### feeCollection()

```ts
feeCollection(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:74](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L74)

Get the current fee collection address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### getMembershipConditions()

```ts
getMembershipConditions(): Promise<readonly `0x${string}`[]>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:81](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L81)

Get all membership condition addresses

#### Returns

`Promise`\<readonly `` `0x${string}` ``[]\>

***

### membershipConditions()

```ts
membershipConditions(index): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:88](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L88)

Get a membership condition address by index

#### Parameters

##### index

`bigint`

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### setOwner()

```ts
setOwner(newOwner): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:95](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L95)

Create a transaction to set a new owner

#### Parameters

##### newOwner

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### setService()

```ts
setService(newService): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:106](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L106)

Create a transaction to set a new service address

#### Parameters

##### newService

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### setFeeCollection()

```ts
setFeeCollection(newFeeCollection): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:117](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L117)

Create a transaction to set a new fee collection address

#### Parameters

##### newFeeCollection

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### setMembershipCondition()

```ts
setMembershipCondition(condition, enabled): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:128](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L128)

Create a transaction to enable or disable a membership condition

#### Parameters

##### condition

`` `0x${string}` ``

##### enabled

`boolean`

#### Returns

`TransactionRequest`

***

### trust()

```ts
trust(trustReceiver, expiry): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:142](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L142)

Create a transaction to trust a member (without membership checks)

#### Parameters

##### trustReceiver

`` `0x${string}` ``

##### expiry

`bigint`

#### Returns

`TransactionRequest`

***

### trustBatchWithConditions()

```ts
trustBatchWithConditions(members, expiry): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:153](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L153)

Create a transaction to trust or untrust a batch of members with membership condition checks

#### Parameters

##### members

readonly `` `0x${string}` ``[]

##### expiry

`bigint`

#### Returns

`TransactionRequest`

***

### updateMetadataDigest()

```ts
updateMetadataDigest(metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:167](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L167)

Create a transaction to update the metadata digest

#### Parameters

##### metadataDigest

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### registerShortNameWithNonce()

```ts
registerShortNameWithNonce(nonce): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroup.ts:178](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroup.ts#L178)

Create a transaction to register a short name with a specific nonce

#### Parameters

##### nonce

`bigint`

#### Returns

`TransactionRequest`

***

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
