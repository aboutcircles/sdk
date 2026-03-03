# @aboutcircles/sdk-runner

Contract runner implementations for executing blockchain operations with the Circles SDK.

## Overview

This package provides multiple `ContractRunner` implementations:

- `SafeContractRunner` - server-side Safe execution with a signer private key
- `SafeBrowserRunner` - browser Safe execution with an injected EIP-1193 wallet
- `MiniAppPostMessageRunner` - iframe miniapp execution through the Circles host postMessage protocol

## Installation

```bash
npm install @aboutcircles/sdk-runner
```

## Usage

### MiniAppPostMessageRunner (postMessage / injected host signer)

Use this runner inside a miniapp iframe embedded in the Circles miniapp host. It sends
transaction and signature requests to the host via `window.parent.postMessage` and waits for
host responses.

```typescript
import { Sdk } from '@aboutcircles/sdk';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { MiniAppPostMessageRunner } from '@aboutcircles/sdk-runner';
import { gnosis } from 'viem/chains';

// 1) Create/init runner (requests wallet address from host)
const runner = await MiniAppPostMessageRunner.create(
  'https://rpc.aboutcircles.com/',
  gnosis,
  {
    // Recommend setting this in production for security
    targetOrigin: 'https://circles.gnosis.io',
    expectedOrigin: 'https://circles.gnosis.io',
  }
);

// 2) Pass runner into SDK
const sdk = new Sdk(circlesConfig[100], runner);

// 3) Use SDK write methods as usual
const avatar = await sdk.getAvatar(runner.address!);
await avatar.trust.add('0x1234567890123456789012345678901234567890');

// Optional: request message signatures via host
const signed = await runner.signMessage('Hello from miniapp', 'erc1271');
console.log(signed.signature, signed.verified);
```

Expected host protocol messages:

- miniapp -> host: `request_address`, `send_transactions`, `sign_message`
- host -> miniapp: `wallet_connected`, `wallet_disconnected`, `tx_success`, `tx_rejected`, `sign_success`, `sign_rejected`

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

### MiniAppPostMessageRunner

```typescript
class MiniAppPostMessageRunner implements ContractRunner {
  constructor(
    publicClient: PublicClient,
    options?: {
      targetOrigin?: string;
      expectedOrigin?: string;
      requestTimeoutMs?: number;
      address?: Address;
    }
  );

  static create(
    rpcUrl: string,
    chain: Chain,
    options?: {
      targetOrigin?: string;
      expectedOrigin?: string;
      requestTimeoutMs?: number;
      address?: Address;
    }
  ): Promise<MiniAppPostMessageRunner>;

  init(): Promise<void>;
  sendTransaction(txs: TransactionRequest[]): Promise<TransactionResponse>;
  sendBatchTransaction(): MiniAppBatchRun;
  signMessage(message: string, signatureType?: 'erc1271' | 'raw'): Promise<{ signature: Hex; verified: boolean }>;
  destroy(): void;
}
```

## License

MIT
