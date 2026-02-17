[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / SafeContractRunner

# Class: SafeContractRunner

Defined in: [packages/runner/src/safe-runner.ts:84](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L84)

Safe contract runner implementation using Safe Protocol Kit
Executes transactions through a Safe multisig wallet

## Implements

- `ContractRunner`

## Constructors

### Constructor

```ts
new SafeContractRunner(
   publicClient, 
   privateKey, 
   rpcUrl, 
   safeAddress?): SafeContractRunner;
```

Defined in: [packages/runner/src/safe-runner.ts:101](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L101)

Creates a new SafeContractRunner

#### Parameters

##### publicClient

The viem public client for reading blockchain state

##### privateKey

`` `0x${string}` ``

The private key of one of the Safe signers

##### rpcUrl

`string`

The RPC URL to use for Safe operations

##### safeAddress?

`string`

The address of the Safe wallet (optional, can be set in init)

#### Returns

`SafeContractRunner`

## Properties

### address?

```ts
optional address: string;
```

Defined in: [packages/runner/src/safe-runner.ts:85](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L85)

The address of the account (if available)

#### Implementation of

```ts
ContractRunner.address
```

***

### publicClient

```ts
publicClient: object;
```

Defined in: [packages/runner/src/safe-runner.ts:86](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L86)

The public client for reading blockchain state

#### Implementation of

```ts
ContractRunner.publicClient
```

## Methods

### create()

```ts
static create(
   rpcUrl, 
   privateKey, 
   safeAddress, 
chain): Promise<SafeContractRunner>;
```

Defined in: [packages/runner/src/safe-runner.ts:143](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L143)

Create and initialize a SafeContractRunner in one step

#### Parameters

##### rpcUrl

`string`

The RPC URL to connect to

##### privateKey

`` `0x${string}` ``

The private key of one of the Safe signers

##### safeAddress

`string`

The address of the Safe wallet

##### chain

[`ChainLike`](../type-aliases/ChainLike.md)

Chain configuration (accepts viem Chain or ChainConfig object)

#### Returns

`Promise`\<`SafeContractRunner`\>

An initialized SafeContractRunner instance

#### Example

```typescript
import { gnosis } from 'viem/chains';
import { SafeContractRunner, chains } from '@aboutcircles/sdk-runner';

// Using viem chain (for backward compatibility)
const runner = await SafeContractRunner.create(
  'https://rpc.gnosischain.com',
  '0xYourPrivateKey...',
  '0xYourSafeAddress...',
  gnosis
);

// Using built-in chain config (no viem import needed)
const runner = await SafeContractRunner.create(
  'https://rpc.gnosischain.com',
  '0xYourPrivateKey...',
  '0xYourSafeAddress...',
  chains.gnosis
);
```

***

### init()

```ts
init(safeAddress?): Promise<void>;
```

Defined in: [packages/runner/src/safe-runner.ts:163](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L163)

Initialize the runner with a Safe address

#### Parameters

##### safeAddress?

`string`

The address of the Safe wallet (optional if provided in constructor)

#### Returns

`Promise`\<`void`\>

#### Implementation of

```ts
ContractRunner.init
```

***

### estimateGas()

```ts
estimateGas(tx): Promise<bigint>;
```

Defined in: [packages/runner/src/safe-runner.ts:195](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L195)

Estimate gas for a transaction

#### Parameters

##### tx

`TransactionRequest`

#### Returns

`Promise`\<`bigint`\>

#### Implementation of

```ts
ContractRunner.estimateGas
```

***

### call()

```ts
call(tx): Promise<string>;
```

Defined in: [packages/runner/src/safe-runner.ts:211](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L211)

Call a contract (read-only operation)

#### Parameters

##### tx

`TransactionRequest`

#### Returns

`Promise`\<`string`\>

#### Implementation of

```ts
ContractRunner.call
```

***

### resolveName()

```ts
resolveName(name): Promise<string | null>;
```

Defined in: [packages/runner/src/safe-runner.ts:229](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L229)

Resolve an ENS name to an address

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`string` \| `null`\>

#### Implementation of

```ts
ContractRunner.resolveName
```

***

### sendTransaction()

```ts
sendTransaction(txs): Promise<TransactionReceipt>;
```

Defined in: [packages/runner/src/safe-runner.ts:247](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L247)

Send one or more transactions through the Safe and wait for confirmation
All transactions are batched and executed atomically

#### Parameters

##### txs

`TransactionRequest`[]

#### Returns

`Promise`\<`TransactionReceipt`\>

#### Throws

If transaction reverts or execution fails

#### Implementation of

```ts
ContractRunner.sendTransaction
```

***

### sendBatchTransaction()

```ts
sendBatchTransaction(): SafeBatchRun;
```

Defined in: [packages/runner/src/safe-runner.ts:295](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-runner.ts#L295)

Create a batch transaction runner

#### Returns

[`SafeBatchRun`](SafeBatchRun.md)

A SafeBatchRun instance for batching multiple transactions

#### Implementation of

```ts
ContractRunner.sendBatchTransaction
```
