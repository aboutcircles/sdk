import type { Address, Hex, TransactionRequest } from '@aboutcircles/sdk-types';
import type { ContractRunner, BatchRun } from './runner';
import type { PublicClient, TransactionReceipt } from 'viem';
import type { SafeTransaction } from '@safe-global/types-kit';
import { createPublicClient, http } from 'viem';
import { type MetaTransactionData, OperationType } from '@safe-global/safe-core-sdk-types';
import { RunnerError } from './errors';
import { type ChainLike, asViemChain } from './chain-types';
import Safe from '@safe-global/protocol-kit';

/**
 * Batch transaction runner for Safe
 * Allows multiple transactions to be batched and executed together
 */
export class SafeBatchRun implements BatchRun {
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

/**
 * Safe contract runner implementation using Safe Protocol Kit
 * Executes transactions through a Safe multisig wallet
 */
export class SafeContractRunner implements ContractRunner {
  public address?: Address;
  public publicClient: PublicClient;

  private privateKey: Hex;
  private rpcUrl: string;
  private safeAddress?: Address;
  private safe?: InstanceType<typeof Safe>;

  /**
   * Creates a new SafeContractRunner
   * @param publicClient - The viem public client for reading blockchain state
   * @param privateKey - The private key of one of the Safe signers
   * @param rpcUrl - The RPC URL to use for Safe operations
   * @param safeAddress - The address of the Safe wallet (optional, can be set in init)
   */
  // @todo rpc might be taken from public client
  constructor(
    publicClient: PublicClient,
    privateKey: Hex,
    rpcUrl: string,
    safeAddress?: Address
  ) {
    this.publicClient = publicClient;
    this.privateKey = privateKey;
    this.rpcUrl = rpcUrl;
    this.safeAddress = safeAddress;
  }

  /**
   * Create and initialize a SafeContractRunner in one step
   * @param rpcUrl - The RPC URL to connect to
   * @param privateKey - The private key of one of the Safe signers
   * @param safeAddress - The address of the Safe wallet
   * @param chain - Chain configuration (accepts viem Chain or ChainConfig object)
   * @returns An initialized SafeContractRunner instance
   *
   * @example
   * ```typescript
   * import { gnosis } from 'viem/chains';
   * import { SafeContractRunner, chains } from '@aboutcircles/sdk-runner';
   *
   * // Using viem chain (for backward compatibility)
   * const runner = await SafeContractRunner.create(
   *   'https://rpc.gnosischain.com',
   *   '0xYourPrivateKey...',
   *   '0xYourSafeAddress...',
   *   gnosis
   * );
   *
   * // Using built-in chain config (no viem import needed)
   * const runner = await SafeContractRunner.create(
   *   'https://rpc.gnosischain.com',
   *   '0xYourPrivateKey...',
   *   '0xYourSafeAddress...',
   *   chains.gnosis
   * );
   * ```
   */
  static async create(
    rpcUrl: string,
    privateKey: Hex,
    safeAddress: Address,
    chain: ChainLike
  ): Promise<SafeContractRunner> {
    const publicClient = createPublicClient({
      chain: asViemChain(chain),
      transport: http(rpcUrl),
    });

    const runner = new SafeContractRunner(publicClient, privateKey, rpcUrl, safeAddress);
    await runner.init();
    return runner;
  }

  /**
   * Initialize the runner with a Safe address
   * @param safeAddress - The address of the Safe wallet (optional if provided in constructor)
   */
  async init(safeAddress?: Address): Promise<void> {
    // Use provided address or the one from constructor
    const targetSafeAddress = safeAddress || this.safeAddress;

    if (!targetSafeAddress) {
      throw new Error('Safe address must be provided either in constructor or init()');
    }

    this.safeAddress = targetSafeAddress;
    this.address = targetSafeAddress;

    // Initialize Safe Protocol Kit
    this.safe = await Safe.init({
      provider: this.rpcUrl,
      signer: this.privateKey,
      safeAddress: targetSafeAddress,
    });
  }

  /**
   * Ensures the Safe is initialized
   */
  private ensureSafe(): InstanceType<typeof Safe> {
    if (!this.safe) {
      throw new Error('SafeContractRunner not initialized. Call init() first.');
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

    // Execute the batched transaction
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
   * @returns A SafeBatchRun instance for batching multiple transactions
   */
  sendBatchTransaction = (): SafeBatchRun => {
    const safe = this.ensureSafe();
    return new SafeBatchRun(safe, this.publicClient);
  };
}
