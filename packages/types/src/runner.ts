import type { Address, TransactionRequest } from './base.js';

/**
 * Runner types
 * Core interfaces for contract execution and transaction handling
 */

/**
 * Batch transaction runner interface
 * Allows multiple transactions to be batched and executed atomically
 */
export interface BatchRun {
  /**
   * Add a transaction to the batch
   */
  addTransaction(tx: TransactionRequest): void;

  /**
   * Execute all batched transactions
   * @returns Single transaction receipt for the entire batch
   */
  run(): Promise<any>; // Using any for TransactionReceipt to avoid viem dependency
}

/**
 * Contract runner interface for executing blockchain operations
 * This is the base interface that all contract runners must implement
 */
export interface ContractRunner {
  /**
   * The address of the account (if available)
   */
  address?: Address;

  /**
   * The public client for reading blockchain state
   */
  publicClient: any; // Using any for PublicClient to avoid viem dependency

  /**
   * Initialize the runner
   */
  init(): Promise<void>;

  /**
   * Estimate gas for a transaction
   */
  estimateGas?(tx: TransactionRequest): Promise<bigint>;

  /**
   * Call a contract (read-only)
   */
  call?(tx: TransactionRequest): Promise<string>;

  /**
   * Resolve an ENS name to an address
   */
  resolveName?(name: string): Promise<string | null>;

  /**
   * Send one or more transactions
   * - Safe: batches all transactions atomically and returns single TransactionReceipt
   */
  sendTransaction?(
    txs: TransactionRequest[]
  ): Promise<any>; // Using any for TransactionReceipt to avoid viem dependency

  /**
   * Create a batch transaction runner (if supported)
   * This allows multiple transactions to be executed atomically in a single on-chain transaction
   * Typically used with Safe multisig or other smart contract wallets
   *
   * @returns A BatchRun instance for adding transactions and executing them as a batch
   */
  sendBatchTransaction?(): BatchRun;
}
