[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / SafeBrowserRunner

# Class: SafeBrowserRunner

Defined in: [packages/runner/src/safe-browser-runner.ts:18](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L18)

Safe browser contract runner implementation using Safe Protocol Kit
Executes transactions through a Safe multisig wallet using the browser's Web3 provider

This runner is designed for use in browser environments where the user has a Web3 wallet
extension installed (e.g., MetaMask, WalletConnect, etc.)

## Implements

- `ContractRunner`

## Constructors

### Constructor

```ts
new SafeBrowserRunner(
   publicClient, 
   eip1193Provider, 
   safeAddress?): SafeBrowserRunner;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:52](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L52)

Creates a new SafeBrowserRunner

#### Parameters

##### publicClient

The viem public client for reading blockchain state

##### eip1193Provider

`Eip1193Provider`

The EIP-1193 provider from the browser (e.g., window.ethereum)

##### safeAddress?

`string`

The address of the Safe wallet (optional, can be set in init)

#### Returns

`SafeBrowserRunner`

#### Example

```typescript
import { createPublicClient, http } from 'viem';
import { gnosis } from 'viem/chains';
import { SafeBrowserRunner } from '@aboutcircles/sdk-runner';

const publicClient = createPublicClient({
  chain: gnosis,
  transport: http('https://rpc.gnosischain.com')
});

const runner = new SafeBrowserRunner(
  publicClient,
  window.ethereum,
  '0xYourSafeAddress...'
);

await runner.init();
```

## Properties

### address?

```ts
optional address: string;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:19](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L19)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L20)

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
   eip1193Provider, 
   safeAddress, 
chain): Promise<SafeBrowserRunner>;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:92](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L92)

Create and initialize a SafeBrowserRunner in one step

#### Parameters

##### rpcUrl

`string`

The RPC URL to connect to

##### eip1193Provider

`Eip1193Provider`

The EIP-1193 provider from the browser (e.g., window.ethereum)

##### safeAddress

`string`

The address of the Safe wallet

##### chain

[`ChainLike`](../type-aliases/ChainLike.md)

Chain configuration (accepts viem Chain or ChainConfig object)

#### Returns

`Promise`\<`SafeBrowserRunner`\>

An initialized SafeBrowserRunner instance

#### Example

```typescript
import { gnosis } from 'viem/chains';
import { SafeBrowserRunner, chains } from '@aboutcircles/sdk-runner';

// Using viem chain (for backward compatibility)
const runner = await SafeBrowserRunner.create(
  'https://rpc.gnosischain.com',
  window.ethereum,
  '0xYourSafeAddress...',
  gnosis
);

// Using built-in chain config (no viem import needed)
const runner = await SafeBrowserRunner.create(
  'https://rpc.gnosischain.com',
  window.ethereum,
  '0xYourSafeAddress...',
  chains.gnosis
);
```

***

### init()

```ts
init(safeAddress?): Promise<void>;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:113](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L113)

Initialize the runner with a Safe address

#### Parameters

##### safeAddress?

`string`

The address of the Safe wallet (optional if provided in constructor)

#### Returns

`Promise`\<`void`\>

#### Throws

If no Safe address is provided and no EIP-1193 provider is available

#### Implementation of

```ts
ContractRunner.init
```

***

### estimateGas()

```ts
estimateGas(tx): Promise<bigint>;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:149](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L149)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:165](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L165)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:183](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L183)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:203](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L203)

Send one or more transactions through the Safe and wait for confirmation
All transactions are batched and executed atomically

The user will be prompted to sign the transaction through their Web3 wallet

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
sendBatchTransaction(): SafeBrowserBatchRun;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:251](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/safe-browser-runner.ts#L251)

Create a batch transaction runner

#### Returns

[`SafeBrowserBatchRun`](SafeBrowserBatchRun.md)

A SafeBrowserBatchRun instance for batching multiple transactions

#### Implementation of

```ts
ContractRunner.sendBatchTransaction
```
