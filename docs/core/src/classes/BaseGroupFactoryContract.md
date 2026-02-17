[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / BaseGroupFactoryContract

# Class: BaseGroupFactoryContract

Defined in: [packages/core/src/contracts/baseGroupFactory.ts:11](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroupFactory.ts#L11)

BaseGroupFactory Contract Wrapper
Provides type-safe methods for creating and managing BaseGroup instances

This is a singleton contract deployed at a fixed address.

## Extends

- [`Contract`](Contract.md)\<*typeof* `baseGroupFactoryAbi`\>

## Constructors

### Constructor

```ts
new BaseGroupFactoryContract(config): BaseGroupFactoryContract;
```

Defined in: [packages/core/src/contracts/baseGroupFactory.ts:12](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroupFactory.ts#L12)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`BaseGroupFactoryContract`

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
readonly abi: (
  | {
}
  | {
}
  | {
})[];
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

### deployedByFactory()

```ts
deployedByFactory(group): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/baseGroupFactory.ts:23](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroupFactory.ts#L23)

Check if a group was deployed by this factory

#### Parameters

##### group

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

***

### createBaseGroup()

```ts
createBaseGroup(
   owner, 
   service, 
   feeCollection, 
   initialConditions, 
   name, 
   symbol, 
   metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseGroupFactory.ts:39](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/baseGroupFactory.ts#L39)

Create a new BaseGroup instance

#### Parameters

##### owner

`` `0x${string}` ``

The address that will own the newly created BaseGroup

##### service

`` `0x${string}` ``

The address of the service for the new BaseGroup

##### feeCollection

`` `0x${string}` ``

The address of the fee collection for the new BaseGroup

##### initialConditions

readonly `` `0x${string}` ``[]

An array of initial condition addresses

##### name

`string`

The group name (must be 19 characters or fewer)

##### symbol

`string`

The group symbol

##### metadataDigest

`` `0x${string}` ``

A hash containing additional metadata for the BaseGroup

#### Returns

`TransactionRequest`

Transaction request object

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
