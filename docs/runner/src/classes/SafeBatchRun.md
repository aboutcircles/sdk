[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / SafeBatchRun

# Class: SafeBatchRun

Defined in: [packages/runner/src/safe-runner.ts:15](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L15)

Batch transaction runner for Safe
Allows multiple transactions to be batched and executed together

## Implements

- `BatchRun`

## Constructors

### Constructor

```ts
new SafeBatchRun(safe, publicClient): SafeBatchRun;
```

Defined in: [packages/runner/src/safe-runner.ts:18](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L18)

#### Parameters

##### safe

`Safe`

##### publicClient

#### Returns

`SafeBatchRun`

## Methods

### addTransaction()

```ts
addTransaction(tx): void;
```

Defined in: [packages/runner/src/safe-runner.ts:26](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L26)

Add a transaction to the batch

#### Parameters

##### tx

`TransactionRequest`

#### Returns

`void`

#### Implementation of

```ts
BatchRun.addTransaction
```

***

### getSafeTransaction()

```ts
getSafeTransaction(): Promise<SafeTransaction>;
```

Defined in: [packages/runner/src/safe-runner.ts:33](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L33)

Get the Safe transaction data for all batched transactions

#### Returns

`Promise`\<`SafeTransaction`\>

***

### run()

```ts
run(): Promise<TransactionReceipt>;
```

Defined in: [packages/runner/src/safe-runner.ts:52](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L52)

Execute all batched transactions and wait for confirmation

#### Returns

`Promise`\<`TransactionReceipt`\>

#### Throws

If transaction reverts or execution fails

#### Implementation of

```ts
BatchRun.run
```
