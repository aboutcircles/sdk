[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / RunnerError

# Class: RunnerError

Defined in: [packages/runner/src/errors.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L20)

Runner and transaction execution errors

## Extends

- `CirclesError`\<[`RunnerErrorSource`](../type-aliases/RunnerErrorSource.md)\>

## Constructors

### Constructor

```ts
new RunnerError(message, options?): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:21](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L21)

#### Parameters

##### message

`string`

##### options?

###### code?

`string` \| `number`

###### source?

[`RunnerErrorSource`](../type-aliases/RunnerErrorSource.md)

###### cause?

`unknown`

###### context?

`Record`\<`string`, `any`\>

#### Returns

`RunnerError`

#### Overrides

```ts
CirclesError<RunnerErrorSource>.constructor
```

## Methods

### initializationFailed()

```ts
static initializationFailed(runnerType, cause?): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:36](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L36)

Create error for initialization failures

#### Parameters

##### runnerType

`string`

##### cause?

`unknown`

#### Returns

`RunnerError`

***

### executionFailed()

```ts
static executionFailed(reason, cause?): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:48](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L48)

Create error for transaction execution failures

#### Parameters

##### reason

`string`

##### cause?

`unknown`

#### Returns

`RunnerError`

***

### walletError()

```ts
static walletError(message, cause?): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:60](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L60)

Create error for wallet-related issues

#### Parameters

##### message

`string`

##### cause?

`unknown`

#### Returns

`RunnerError`

***

### safeError()

```ts
static safeError(
   message, 
   safeAddress, 
   cause?): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:71](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L71)

Create error for Safe-specific issues

#### Parameters

##### message

`string`

##### safeAddress

`string`

##### cause?

`unknown`

#### Returns

`RunnerError`

***

### missingSigner()

```ts
static missingSigner(): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:83](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L83)

Create error for missing signer

#### Returns

`RunnerError`

***

### timeout()

```ts
static timeout(txHash, timeout): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:93](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L93)

Create error for transaction timeout

#### Parameters

##### txHash

`string`

##### timeout

`number`

#### Returns

`RunnerError`

***

### transactionReverted()

```ts
static transactionReverted(
   txHash, 
   blockNumber, 
   gasUsed, 
   cause?): RunnerError;
```

Defined in: [packages/runner/src/errors.ts:104](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/errors.ts#L104)

Create error for reverted transactions

#### Parameters

##### txHash

`string`

##### blockNumber

`bigint`

##### gasUsed

`bigint`

##### cause?

`unknown`

#### Returns

`RunnerError`
