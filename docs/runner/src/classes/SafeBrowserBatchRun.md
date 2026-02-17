[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / SafeBrowserBatchRun

# Class: SafeBrowserBatchRun

Defined in: [packages/runner/src/safe-browser-runner.ts:261](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L261)

Batch transaction runner for Safe browser operations
Allows multiple transactions to be batched and executed together

## Implements

- `BatchRun`

## Constructors

### Constructor

```ts
new SafeBrowserBatchRun(safe, publicClient): SafeBrowserBatchRun;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:264](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L264)

#### Parameters

##### safe

`Safe`

##### publicClient

#### Returns

`SafeBrowserBatchRun`

## Methods

### addTransaction()

```ts
addTransaction(tx): void;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:272](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L272)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:279](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L279)

Get the Safe transaction data for all batched transactions

#### Returns

`Promise`\<`SafeTransaction`\>

***

### run()

```ts
run(): Promise<TransactionReceipt>;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:300](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L300)

Execute all batched transactions and wait for confirmation
The user will be prompted to sign the transaction through their Web3 wallet

#### Returns

`Promise`\<`TransactionReceipt`\>

#### Throws

If transaction reverts or execution fails

#### Implementation of

```ts
BatchRun.run
```
