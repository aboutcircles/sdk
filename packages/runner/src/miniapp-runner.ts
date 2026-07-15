import type { Address, Hex, TransactionRequest } from '@aboutcircles/sdk-types';
import type { ContractRunner, BatchRun } from './runner.js';
import type { PublicClient, TransactionReceipt } from 'viem';
import { createPublicClient, http } from 'viem';
import { RunnerError } from './errors.js';
import { type ChainLike, asViemChain } from './chain-types.js';

/**
 * Shape of a transaction as the Circles miniapp host expects it on the
 * wire. Mirrors the `Transaction` type exported by
 * `@aboutcircles/miniapp-sdk` so callers don't need to import that package
 * just to satisfy the type. `value` is a decimal-or-hex string instead of
 * a bigint because the host bridge serialises it as JSON.
 */
export interface MiniappHostTransaction {
  to: string;
  data?: string;
  value?: string;
}

/**
 * Signature of the host's batch-send function. Matches
 * `sendTransactions` from `@aboutcircles/miniapp-sdk` — the user passes
 * that function in at construction time so the runner stays free of any
 * direct dependency on the miniapp-sdk package.
 */
export type MiniappSendTransactions = (
  txs: MiniappHostTransaction[]
) => Promise<string[]>;

/**
 * Miniapp contract runner implementation.
 *
 * Executes transactions through the Circles **miniapps iframe host**:
 * an embedded mini-app at `circles.gnosis.io/playground` (or any other
 * embedder) cannot reach the user's wallet directly because the
 * EIP-1193 provider lives in the parent frame. The host exposes a
 * `sendTransactions(txs)` postMessage bridge instead, which signs all
 * passed transactions atomically through the user's Circles wallet and
 * returns their hashes.
 *
 * This runner adapts that bridge to the SDK's {@link ContractRunner}
 * interface so the rest of `@aboutcircles/sdk-core`'s typed contract
 * wrappers (`core.hubV2.*`, wrappers, etc.) work inside miniapps the
 * same way they work outside.
 *
 * The viewer's address comes from the host as well — pass it after
 * `onWalletChange` fires in your mini-app:
 *
 * @example
 * ```typescript
 * import { createPublicClient, http } from 'viem';
 * import { gnosis } from 'viem/chains';
 * import { onWalletChange, sendTransactions } from '@aboutcircles/miniapp-sdk';
 * import { MiniappRunner } from '@aboutcircles/sdk-runner';
 * import { Sdk } from '@aboutcircles/sdk';
 * import { circlesConfig } from '@aboutcircles/sdk-utils';
 *
 * const publicClient = createPublicClient({
 *   chain: gnosis,
 *   transport: http('https://rpc.gnosischain.com'),
 * });
 *
 * onWalletChange(async (address) => {
 *   if (!address) return;
 *   const runner = new MiniappRunner(publicClient, sendTransactions, address);
 *   const sdk = new Sdk(circlesConfig[100], runner);
 *
 *   const avatar = await sdk.getAvatar(address);
 *   await avatar.transfer.direct('0xRecipient', BigInt(1e18));
 * });
 * ```
 *
 * @see https://github.com/aboutcircles/CirclesMiniapps — the miniapps host
 * @see {@link https://www.npmjs.com/package/@aboutcircles/miniapp-sdk}
 */
export class MiniappRunner implements ContractRunner {
  public address?: Address;
  public publicClient: PublicClient;

  private hostSendTransactions: MiniappSendTransactions;

  /**
   * Creates a new MiniappRunner.
   *
   * @param publicClient - The viem public client for reading blockchain
   *   state. The runner never sends via this client; it only uses it for
   *   reads, gas estimation, and waiting on receipts.
   * @param sendTransactions - The batch-send function provided by the
   *   miniapp host. In practice this is
   *   `import { sendTransactions } from '@aboutcircles/miniapp-sdk'` —
   *   passed in as a function so this package doesn't take a hard
   *   dependency on miniapp-sdk.
   * @param address - The viewer's Circles wallet address as injected by
   *   the host (see `onWalletChange`). Optional in the constructor so
   *   it can be set later via {@link init}, mirroring the pattern of
   *   {@link SafeBrowserRunner}.
   */
  constructor(
    publicClient: PublicClient,
    sendTransactions: MiniappSendTransactions,
    address?: Address
  ) {
    this.publicClient = publicClient;
    this.hostSendTransactions = sendTransactions;
    this.address = address;
  }

  /**
   * Create and initialize a MiniappRunner in one step.
   *
   * @param rpcUrl - The RPC URL to read from.
   * @param sendTransactions - Host batch-send function (see {@link MiniappSendTransactions}).
   * @param chain - Chain configuration (accepts viem Chain or {@link ChainLike}).
   * @param address - Optional viewer address; can also be set later via {@link init}.
   * @returns An initialised MiniappRunner instance.
   *
   * @example
   * ```typescript
   * import { chains, MiniappRunner } from '@aboutcircles/sdk-runner';
   * import { sendTransactions } from '@aboutcircles/miniapp-sdk';
   *
   * const runner = await MiniappRunner.create(
   *   'https://rpc.gnosischain.com',
   *   sendTransactions,
   *   chains.gnosis,
   *   viewerAddress
   * );
   * ```
   */
  static async create(
    rpcUrl: string,
    sendTransactions: MiniappSendTransactions,
    chain: ChainLike,
    address?: Address
  ): Promise<MiniappRunner> {
    const publicClient = createPublicClient({
      chain: asViemChain(chain),
      transport: http(rpcUrl),
    });

    const runner = new MiniappRunner(publicClient, sendTransactions, address);
    await runner.init();
    return runner;
  }

  /**
   * Initialise the runner with an address.
   *
   * The miniapp host has already authenticated the user before our app
   * boots, so this is just a hook to plug in the address (or update it
   * if the host swaps wallets at runtime). No network call is made.
   *
   * @param address - Optional address override; if omitted, the address
   *   passed to the constructor is kept.
   */
  async init(address?: Address): Promise<void> {
    if (address) {
      this.address = address;
    }
  }

  /**
   * Estimate gas for a transaction.
   *
   * The miniapp host doesn't expose gas estimation directly, so we use
   * the public client with the viewer's address as the implicit `from`.
   */
  estimateGas = async (tx: TransactionRequest): Promise<bigint> => {
    return this.publicClient.estimateGas({
      // @ts-expect-error - Address type is compatible with viem's 0x${string}
      account: this.address,
      // @ts-expect-error - Address type is compatible with viem's 0x${string}
      to: tx.to!,
      data: tx.data,
      value: tx.value,
    });
  };

  /**
   * Call a contract (read-only operation) via the public client.
   */
  call = async (tx: TransactionRequest): Promise<string> => {
    const result = await this.publicClient.call({
      // @ts-expect-error - Address type is compatible with viem's 0x${string}
      account: tx.from || this.address,
      // @ts-expect-error - Address type is compatible with viem's 0x${string}
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
    });

    return result.data || '0x';
  };

  /**
   * Resolve an ENS name via the public client. Returns null on failure
   * so callers don't have to wrap the call in try/catch.
   */
  resolveName = async (name: string): Promise<string | null> => {
    try {
      return await this.publicClient.getEnsAddress({ name });
    } catch {
      return null;
    }
  };

  /**
   * Send one or more transactions through the miniapp host and wait
   * for confirmation. All transactions are batched into a single host
   * call → one user signature → one atomic Safe-batch on-chain.
   *
   * The host returns one hash per transaction in the batch; we wait on
   * the first since they all alias the same on-chain Safe-execution tx.
   *
   * @throws {RunnerError} If no transactions are provided, the host
   *   returns no hash, or the resulting tx reverts.
   */
  sendTransaction = async (
    txs: TransactionRequest[]
  ): Promise<TransactionReceipt> => {
    if (txs.length === 0) {
      throw RunnerError.executionFailed('No transactions provided');
    }

    const hostTxs: MiniappHostTransaction[] = txs.map((tx) => ({
      to: tx.to!,
      data: tx.data ?? '0x',
      value: tx.value == null ? '0x0' : `0x${BigInt(tx.value).toString(16)}`,
    }));

    let hashes: string[];
    try {
      hashes = await this.hostSendTransactions(hostTxs);
    } catch (error) {
      throw RunnerError.executionFailed(
        'Miniapp host rejected the transaction batch',
        error
      );
    }

    const hash = hashes[0];
    if (!hash) {
      throw RunnerError.executionFailed(
        'Miniapp host returned no transaction hash'
      );
    }

    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: hash as Hex,
    });

    if (receipt.status === 'reverted') {
      throw RunnerError.transactionReverted(
        receipt.transactionHash,
        receipt.blockNumber,
        receipt.gasUsed
      );
    }

    return receipt;
  };

  /**
   * Open an interactive batch. Each {@link MiniappBatchRun.addTransaction}
   * accumulates; {@link MiniappBatchRun.run} flushes the whole list
   * through the host in a single signature.
   */
  sendBatchTransaction = (): MiniappBatchRun => {
    return new MiniappBatchRun(this);
  };
}

/**
 * Batch transaction runner for Miniapp operations. Mirrors the
 * {@link SafeBrowserBatchRun} interface so callers can swap between
 * runners without changing their batching code.
 */
export class MiniappBatchRun implements BatchRun {
  private readonly runner: MiniappRunner;
  private readonly transactions: TransactionRequest[] = [];

  constructor(runner: MiniappRunner) {
    this.runner = runner;
  }

  /**
   * Add a transaction to the batch.
   */
  addTransaction(tx: TransactionRequest): void {
    this.transactions.push(tx);
  }

  /**
   * Execute every batched transaction in a single host signature.
   *
   * @throws {RunnerError} If the batch is empty or the resulting tx
   *   reverts.
   */
  async run(): Promise<TransactionReceipt> {
    return this.runner.sendTransaction(this.transactions);
  }
}
