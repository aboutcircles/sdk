[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / LiftERC20Contract

# Class: LiftERC20Contract

Defined in: [packages/core/src/contracts/liftERC20.ts:15](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L15)

LiftERC20 Contract Wrapper
Provides type-safe methods for interacting with the Circles Lift (ERC20Lift) contract

This contract is responsible for deploying and managing ERC20 wrappers for Circles tokens.
It creates either demurraged or inflationary ERC20 versions of Circles.

This is a singleton contract deployed at a fixed address.

## Extends

- [`Contract`](Contract.md)\<*typeof* `liftERC20Abi`\>

## Constructors

### Constructor

```ts
new LiftERC20Contract(config): LiftERC20Contract;
```

Defined in: [packages/core/src/contracts/liftERC20.ts:16](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L16)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`LiftERC20Contract`

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

### ERC20\_WRAPPER\_SETUP\_CALLPREFIX()

```ts
ERC20_WRAPPER_SETUP_CALLPREFIX(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/liftERC20.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L27)

Get the ERC20 wrapper setup call prefix constant

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### hub()

```ts
hub(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/liftERC20.ts:34](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L34)

Get the Hub contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### nameRegistry()

```ts
nameRegistry(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/liftERC20.ts:41](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L41)

Get the NameRegistry contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### masterCopyERC20Wrapper()

```ts
masterCopyERC20Wrapper(circlesType): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/liftERC20.ts:49](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L49)

Get the master copy address for a specific CirclesType

#### Parameters

##### circlesType

`CirclesType`

0 for Demurrage, 1 for Inflation

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### erc20Circles()

```ts
erc20Circles(circlesType, avatar): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/liftERC20.ts:59](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L59)

Get the ERC20 wrapper address for a specific avatar and CirclesType

#### Parameters

##### circlesType

`CirclesType`

0 for Demurrage, 1 for Inflation

##### avatar

`` `0x${string}` ``

The avatar address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The ERC20 wrapper address, or zero address if not deployed

***

### ensureERC20()

```ts
ensureERC20(avatar, circlesType): TransactionRequest;
```

Defined in: [packages/core/src/contracts/liftERC20.ts:71](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/liftERC20.ts#L71)

Ensure an ERC20 wrapper exists for an avatar
Creates a new wrapper if it doesn't exist, or returns the existing one

#### Parameters

##### avatar

`` `0x${string}` ``

The avatar address (must be a registered human or group)

##### circlesType

`CirclesType`

The type of wrapper to create (Demurrage or Inflation)

#### Returns

`TransactionRequest`

Transaction request that will return the wrapper address when executed
