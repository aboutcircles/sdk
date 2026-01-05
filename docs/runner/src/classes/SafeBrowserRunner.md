[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / SafeBrowserRunner

# Class: SafeBrowserRunner

Defined in: [packages/runner/src/safe-browser-runner.ts:23](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L23)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:57](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L57)

Creates a new SafeBrowserRunner

#### Parameters

##### publicClient

The viem public client for reading blockchain state

##### eip1193Provider

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

Defined in: [packages/runner/src/safe-browser-runner.ts:24](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L24)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:25](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L25)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:88](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L88)

Create and initialize a SafeBrowserRunner in one step

#### Parameters

##### rpcUrl

`string`

The RPC URL to connect to

##### eip1193Provider

The EIP-1193 provider from the browser (e.g., window.ethereum)

##### safeAddress

`string`

The address of the Safe wallet

##### chain

`Chain`

The viem chain configuration (e.g., gnosis from 'viem/chains')

#### Returns

`Promise`\<`SafeBrowserRunner`\>

An initialized SafeBrowserRunner instance

#### Example

```typescript
import { gnosis } from 'viem/chains';
import { SafeBrowserRunner } from '@aboutcircles/sdk-runner';

const runner = await SafeBrowserRunner.create(
  'https://rpc.gnosischain.com',
  window.ethereum,
  '0xYourSafeAddress...',
  gnosis
);
```

***

### init()

```ts
init(safeAddress?): Promise<void>;
```

Defined in: [packages/runner/src/safe-browser-runner.ts:109](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L109)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:145](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L145)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:161](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L161)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:179](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L179)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:199](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L199)

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

Defined in: [packages/runner/src/safe-browser-runner.ts:247](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/runner/src/safe-browser-runner.ts#L247)

Create a batch transaction runner

#### Returns

[`SafeBrowserBatchRun`](SafeBrowserBatchRun.md)

A SafeBrowserBatchRun instance for batching multiple transactions

#### Implementation of

```ts
ContractRunner.sendBatchTransaction
```
