[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / ContractError

# Class: ContractError

Defined in: [packages/core/src/errors.ts:20](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L20)

Contract and transaction errors

## Extends

- `CirclesError`\<[`CoreErrorSource`](../type-aliases/CoreErrorSource.md)\>

## Constructors

### Constructor

```ts
new ContractError(message, options?): ContractError;
```

Defined in: [packages/core/src/errors.ts:21](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L21)

#### Parameters

##### message

`string`

##### options?

###### code?

`string` \| `number`

###### source?

[`CoreErrorSource`](../type-aliases/CoreErrorSource.md)

###### cause?

`unknown`

###### context?

`Record`\<`string`, `any`\>

#### Returns

`ContractError`

#### Overrides

```ts
CirclesError<CoreErrorSource>.constructor
```

## Methods

### transactionFailed()

```ts
static transactionFailed(
   txHash, 
   reason, 
   cause?): ContractError;
```

Defined in: [packages/core/src/errors.ts:36](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L36)

Create error for transaction failures

#### Parameters

##### txHash

`string`

##### reason

`string`

##### cause?

`unknown`

#### Returns

`ContractError`

***

### revert()

```ts
static revert(
   method, 
   reason?, 
   cause?): ContractError;
```

Defined in: [packages/core/src/errors.ts:48](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L48)

Create error for contract reverts

#### Parameters

##### method

`string`

##### reason?

`string`

##### cause?

`unknown`

#### Returns

`ContractError`

***

### insufficientGas()

```ts
static insufficientGas(estimated, provided?): ContractError;
```

Defined in: [packages/core/src/errors.ts:63](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L63)

Create error for insufficient gas

#### Parameters

##### estimated

`bigint`

##### provided?

`bigint`

#### Returns

`ContractError`

***

### gasEstimationFailed()

```ts
static gasEstimationFailed(method, cause?): ContractError;
```

Defined in: [packages/core/src/errors.ts:74](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L74)

Create error for gas estimation failures

#### Parameters

##### method

`string`

##### cause?

`unknown`

#### Returns

`ContractError`

***

### encodingError()

```ts
static encodingError(method, cause?): ContractError;
```

Defined in: [packages/core/src/errors.ts:86](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L86)

Create error for encoding failures

#### Parameters

##### method

`string`

##### cause?

`unknown`

#### Returns

`ContractError`

***

### notFound()

```ts
static notFound(address, contractType): ContractError;
```

Defined in: [packages/core/src/errors.ts:98](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/errors.ts#L98)

Create error for contract not found

#### Parameters

##### address

`string`

##### contractType

`string`

#### Returns

`ContractError`
