import type { Address, Hex, TransactionRequest } from '@aboutcircles/sdk-types';
import type { ContractRunner, BatchRun } from './runner';
import type { PublicClient, TransactionReceipt } from 'viem';
import { createPublicClient, http } from 'viem';
import { type MetaTransactionData, OperationType } from '@safe-global/safe-core-sdk-types';
import type { Eip1193Provider } from '@safe-global/protocol-kit';
import Safe from '@safe-global/protocol-kit';
import { RunnerError } from './errors';
import { type ChainLike, asViemChain } from './chain-types';

/**
 * Safe browser contract runner implementation using Safe Protocol Kit
 * Executes transactions through a Safe multisig wallet using the browser's Web3 provider
 *
 * This runner is designed for use in browser environments where the user has a Web3 wallet
 * extension installed (e.g., MetaMask, WalletConnect, etc.)
 */
export class SafeBrowserRunner implements ContractRunner {
  public address?: Address;
  public publicClient: PublicClient;

  private eip1193Provider: Eip1193Provider;
  private safeAddress?: Address;
  private safe?: InstanceType<typeof Safe>;

  /**
   * Creates a new SafeBrowserRunner
   * @param publicClient - The viem public client for reading blockchain state
   * @param eip1193Provider - The EIP-1193 provider from the browser (e.g., window.ethereum)
   * @param safeAddress - The address of the Safe wallet (optional, can be set in init)
   *
   * @example
   * ```typescript
   * import { createPublicClient, http } from 'viem';
   * import { gnosis } from 'viem/chains';
   * import { SafeBrowserRunner } from '@aboutcircles/sdk-runner';
   *
   * const publicClient = createPublicClient({
   *   chain: gnosis,
   *   transport: http('https://rpc.gnosischain.com')
   * });
   *
   * const runner = new SafeBrowserRunner(
   *   publicClient,
   *   window.ethereum,
   *   '0xYourSafeAddress...'
   * );
   *
   * await runner.init();
   * ```
   */
  constructor(
    publicClient: PublicClient,
    eip1193Provider: Eip1193Provider,
    safeAddress?: Address
  ) {
    this.publicClient = publicClient;
    this.eip1193Provider = eip1193Provider;
    this.safeAddress = safeAddress;
  }

  /**
   * Create and initialize a SafeBrowserRunner in one step
   * @param rpcUrl - The RPC URL to connect to
   * @param eip1193Provider - The EIP-1193 provider from the browser (e.g., window.ethereum)
   * @param safeAddress - The address of the Safe wallet
   * @param chain - Chain configuration (accepts viem Chain or ChainConfig object)
   * @returns An initialized SafeBrowserRunner instance
   *
   * @example
   * ```typescript
   * import { gnosis } from 'viem/chains';
   * import { SafeBrowserRunner, chains } from '@aboutcircles/sdk-runner';
   *
   * // Using viem chain (for backward compatibility)
   * const runner = await SafeBrowserRunner.create(
   *   'https://rpc.gnosischain.com',
   *   window.ethereum,
   *   '0xYourSafeAddress...',
   *   gnosis
   * );
   *
   * // Using built-in chain config (no viem import needed)
   * const runner = await SafeBrowserRunner.create(
   *   'https://rpc.gnosischain.com',
   *   window.ethereum,
   *   '0xYourSafeAddress...',
   *   chains.gnosis
   * );
   * ```
   */
  static async create(
    rpcUrl: string,
    eip1193Provider: Eip1193Provider,
    safeAddress: Address,
    chain: ChainLike
  ): Promise<SafeBrowserRunner> {
    const publicClient = createPublicClient({
      chain: asViemChain(chain),
      transport: http(rpcUrl),
    });

    const runner = new SafeBrowserRunner(publicClient, eip1193Provider, safeAddress);
    await runner.init();
    return runner;
  }

  /**
   * Initialize the runner with a Safe address
   * @param safeAddress - The address of the Safe wallet (optional if provided in constructor)
   * @throws {RunnerError} If no Safe address is provided and no EIP-1193 provider is available
   */
  async init(safeAddress?: Address): Promise<void> {
    // Use provided address or the one from constructor
    const targetSafeAddress = safeAddress || this.safeAddress;

    if (!targetSafeAddress) {
      throw RunnerError.initializationFailed('SafeBrowserRunner', new Error('Safe address must be provided either in constructor or init()'));
    }

    if (!this.eip1193Provider) {
      throw RunnerError.initializationFailed('SafeBrowserRunner', new Error('No EIP-1193 provider available. Make sure you are in a browser environment with a Web3 wallet extension.'));
    }

    this.safeAddress = targetSafeAddress;
    this.address = targetSafeAddress;

    // Initialize Safe Protocol Kit with browser provider
    this.safe = await Safe.init({
      provider: this.eip1193Provider,
      safeAddress: targetSafeAddress,
    });
  }

  /**
   * Ensures the Safe is initialized
   * @private
   */
  private ensureSafe(): InstanceType<typeof Safe> {
    if (!this.safe) {
      throw RunnerError.initializationFailed('SafeBrowserRunner', new Error('SafeBrowserRunner not initialized. Call init() first.'));
    }
    return this.safe;
  }

  /**
   * Estimate gas for a transaction
   */
  estimateGas = async (tx: TransactionRequest): Promise<bigint> => {
    const estimate = await this.publicClient.estimateGas({
      // @ts-expect-error - Address type is compatible with viem's 0x${string}
      account: this.address,
      // @ts-expect-error - Address type is compatible with viem's 0x${string}
      to: tx.to!,
      data: tx.data,
      value: tx.value,
    });

    return estimate;
  };

  /**
   * Call a contract (read-only operation)
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
   * Resolve an ENS name to an address
   */
  resolveName = async (name: string): Promise<string | null> => {
    try {
      const address = await this.publicClient.getEnsAddress({
        name,
      });
      return address;
    } catch (error) {
      // ENS resolution failed or not supported
      return null;
    }
  };

  /**
   * Send one or more transactions through the Safe and wait for confirmation
   * All transactions are batched and executed atomically
   *
   * The user will be prompted to sign the transaction through their Web3 wallet
   *
   * @throws {RunnerError} If transaction reverts or execution fails
   */
  sendTransaction = async (txs: TransactionRequest[]): Promise<TransactionReceipt> => {
    const safe = this.ensureSafe();

    if (txs.length === 0) {
      throw RunnerError.executionFailed('No transactions provided');
    }

    const metaTransactions: MetaTransactionData[] = txs.map((tx) => ({
      operation: OperationType.Call,
      to: tx.to!,
      value: (tx.value?.toString() ?? '0'),
      data: tx.data ?? '0x',
    }));

    // Create Safe transaction with all transactions
    const safeTransaction = await safe.createTransaction({
      transactions: metaTransactions,
    });

    // Execute the batched transaction (will prompt user for signature)
    const txResult = await safe.executeTransaction(safeTransaction);

    if (!txResult.hash) {
      throw RunnerError.executionFailed('No transaction hash returned from Safe execution');
    }

    // Wait for transaction receipt
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txResult.hash as Hex,
    });

    // Check transaction status and throw if reverted
    if (receipt.status === 'reverted') {
      throw RunnerError.transactionReverted(
        receipt.transactionHash,
        receipt.blockNumber,
        receipt.gasUsed
      );
    }

    // Return viem's TransactionReceipt directly
    return receipt;
  };

  /**
   * Create a batch transaction runner
   * @returns A SafeBrowserBatchRun instance for batching multiple transactions
   */
  sendBatchTransaction = (): SafeBrowserBatchRun => {
    const safe = this.ensureSafe();
    return new SafeBrowserBatchRun(safe, this.publicClient);
  };
}

/**
 * Batch transaction runner for Safe browser operations
 * Allows multiple transactions to be batched and executed together
 */
export class SafeBrowserBatchRun implements BatchRun {
  private readonly transactions: TransactionRequest[] = [];

  constructor(
    private readonly safe: InstanceType<typeof Safe>,
    private readonly publicClient: PublicClient
  ) {}

  /**
   * Add a transaction to the batch
   */
  addTransaction(tx: TransactionRequest) {
    this.transactions.push(tx);
  }

  /**
   * Get the Safe transaction data for all batched transactions
   */
  async getSafeTransaction() {
    const metaTransactions: MetaTransactionData[] = this.transactions.map((tx) => ({
      operation: OperationType.Call,
      to: tx.to!,
      value: (tx.value?.toString() ?? '0'),
      data: tx.data ?? '0x',
    }));

    const safeTransaction = await this.safe.createTransaction({
      transactions: metaTransactions,
    });

    return safeTransaction;
  }

  /**
   * Execute all batched transactions and wait for confirmation
   * The user will be prompted to sign the transaction through their Web3 wallet
   *
   * @throws {RunnerError} If transaction reverts or execution fails
   */
  async run(): Promise<TransactionReceipt> {
    const safeTransaction = await this.getSafeTransaction();

    const txResult = await this.safe.executeTransaction(safeTransaction);

    if (!txResult.hash) {
      throw RunnerError.executionFailed('No transaction hash returned from Safe execution');
    }

    // Wait for transaction receipt
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txResult.hash as Hex,
    });

    // Check transaction status and throw if reverted
    if (receipt.status === 'reverted') {
      throw RunnerError.transactionReverted(
        receipt.transactionHash,
        receipt.blockNumber,
        receipt.gasUsed
      );
    }

    // Return viem's TransactionReceipt directly
    return receipt;
  }
}
