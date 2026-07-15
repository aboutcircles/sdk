# @aboutcircles/sdk-runner

Safe multisig wallet integration for executing blockchain operations with the Circles SDK.

## Overview

This package provides the `SafeContractRunner`, `SafeBrowserRunner`, and `MiniappRunner` implementations for executing transactions. `SafeContractRunner` covers server-side use with a private key, `SafeBrowserRunner` wraps an EIP-1193 wallet extension, and `MiniappRunner` adapts the Circles miniapps iframe host's `sendTransactions` bridge to the SDK's `ContractRunner` interface so embedded mini-apps can use `core.hubV2.*` and the rest of the typed SDK without hand-rolling calldata.

## Installation

```bash
npm install @aboutcircles/sdk-runner
```

## Usage

### SafeContractRunner

The `SafeContractRunner` executes transactions through a Safe multisig wallet.

```typescript
import { createPublicClient, http } from 'viem';
import { gnosis } from 'viem/chains';
import { SafeContractRunner } from '@aboutcircles/sdk-runner';

// Create a public client
const publicClient = createPublicClient({
  chain: gnosis,
  transport: http('https://rpc.gnosischain.com'),
});

// Create the runner
const runner = new SafeContractRunner(
  publicClient,
  '0x...', // private key of Safe signer
  'https://rpc.gnosischain.com',
  '0x...' // Safe address
);

// Initialize the runner
await runner.init();

// Send a single transaction
const receipt = await runner.sendTransaction([{
  to: '0x...',
  data: '0x...',
  value: 0n,
}]);

console.log('Transaction hash:', receipt.transactionHash);
console.log('Status:', receipt.status);
console.log('Gas used:', receipt.gasUsed);

// Batch multiple transactions atomically
const batchReceipt = await runner.sendTransaction([
  { to: '0x...', data: '0x...', value: 0n },
  { to: '0x...', data: '0x...', value: 0n },
  { to: '0x...', data: '0x...', value: 0n },
]);
```

### MiniappRunner

The `MiniappRunner` adapts the Circles miniapps host (`circles.gnosis.io/playground` or any other embedder) to the `ContractRunner` interface. Use it inside a mini-app, where the user's wallet lives in the parent frame and the host exposes a `sendTransactions(txs)` bridge instead of a direct EIP-1193 provider.

```typescript
import { createPublicClient, http } from 'viem';
import { gnosis } from 'viem/chains';
import {
  onWalletChange,
  sendTransactions,
} from '@aboutcircles/miniapp-sdk';
import { MiniappRunner } from '@aboutcircles/sdk-runner';
import { Sdk } from '@aboutcircles/sdk';
import { circlesConfig } from '@aboutcircles/sdk-utils';

const publicClient = createPublicClient({
  chain: gnosis,
  transport: http('https://rpc.gnosischain.com'),
});

onWalletChange(async (address) => {
  if (!address) return;
  const runner = new MiniappRunner(publicClient, sendTransactions, address);
  const sdk = new Sdk(circlesConfig[100], runner);

  // Every Circles primitive now goes through the typed SDK wrappers
  // — no hand-rolled calldata anywhere in your mini-app.
  const avatar = await sdk.getAvatar(address);
  await avatar.transfer.direct('0xRecipient', BigInt(1e18));
});
```

Like `SafeBrowserRunner`, `MiniappRunner` exposes a static `create()` factory if you prefer a one-step setup:

```typescript
import { chains, MiniappRunner } from '@aboutcircles/sdk-runner';
import { sendTransactions } from '@aboutcircles/miniapp-sdk';

const runner = await MiniappRunner.create(
  'https://rpc.gnosischain.com',
  sendTransactions,
  chains.gnosis,
  viewerAddress,
);
```

The `sendTransactions` function is passed in (not imported by `sdk-runner`) so this package stays free of a hard dependency on `@aboutcircles/miniapp-sdk` — that decoupling also makes the runner trivial to unit-test with a mock host.

## Features

- **Transaction Confirmation**: Automatically waits for transactions to be mined
- **Status Checking**: Throws errors if transactions revert
- **Atomic Batching**: Execute multiple transactions in a single Safe transaction
- **Full Receipt Data**: Returns complete viem TransactionReceipt with gas, logs, etc.

## API

### ContractRunner Interface

```typescript
interface ContractRunner {
  address?: Address;
  publicClient: PublicClient;

  init(): Promise<void>;
  estimateGas?(tx: TransactionRequest): Promise<bigint>;
  call?(tx: TransactionRequest): Promise<string>;
  resolveName?(name: string): Promise<string | null>;
  sendTransaction?(txs: TransactionRequest[]): Promise<TransactionResponse>;
  sendBatchTransaction?(): BatchRun;
}
```

### SafeContractRunner

```typescript
class SafeContractRunner implements ContractRunner {
  constructor(
    publicClient: PublicClient,
    privateKey: Hex,
    rpcUrl: string,
    safeAddress?: Address
  );

  init(safeAddress?: Address): Promise<void>;
  sendTransaction(txs: TransactionRequest[]): Promise<TransactionResponse>;
  sendBatchTransaction(): SafeBatchRun;
}
```

### MiniappRunner

```typescript
class MiniappRunner implements ContractRunner {
  constructor(
    publicClient: PublicClient,
    sendTransactions: MiniappSendTransactions,
    address?: Address,
  );

  static create(
    rpcUrl: string,
    sendTransactions: MiniappSendTransactions,
    chain: ChainLike,
    address?: Address,
  ): Promise<MiniappRunner>;

  init(address?: Address): Promise<void>;
  sendTransaction(txs: TransactionRequest[]): Promise<TransactionReceipt>;
  sendBatchTransaction(): MiniappBatchRun;
}
```

## License

MIT
