[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / Contract

# Class: Contract\<TAbi\>

Defined in: [packages/core/src/contracts/contract.ts:8](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L8)

Generic Contract class for type-safe contract interactions

## Extended by

- [`HubV2Contract`](HubV2Contract.md)
- [`BaseGroupContract`](BaseGroupContract.md)
- [`BaseGroupFactoryContract`](BaseGroupFactoryContract.md)
- [`NameRegistryContract`](NameRegistryContract.md)
- [`LiftERC20Contract`](LiftERC20Contract.md)
- [`InvitationEscrowContract`](InvitationEscrowContract.md)
- [`InvitationFarmContract`](InvitationFarmContract.md)
- [`ReferralsModuleContract`](ReferralsModuleContract.md)

## Type Parameters

### TAbi

`TAbi` *extends* readonly `unknown`[] = `Abi`

## Constructors

### Constructor

```ts
new Contract<TAbi>(config): Contract<TAbi>;
```

Defined in: [packages/core/src/contracts/contract.ts:13](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L13)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### abi

`TAbi`

###### rpcUrl

`string`

#### Returns

`Contract`\<`TAbi`\>

## Properties

### address

```ts
readonly address: `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L9)

***

### abi

```ts
readonly abi: TAbi;
```

Defined in: [packages/core/src/contracts/contract.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L10)

***

### rpcUrl

```ts
protected rpcUrl: string;
```

Defined in: [packages/core/src/contracts/contract.ts:11](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L11)

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
