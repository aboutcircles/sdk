import type { Address, Hex, TransactionRequest } from '@aboutcircles/sdk-types';
import type { ContractRunner, BatchRun } from './runner';
import type { Chain, PublicClient, TransactionReceipt } from 'viem';
import { createPublicClient, getAddress, http } from 'viem';
import { RunnerError } from './errors';

/**
 * Signature mode supported by the Circles miniapp host.
 */
export type MiniAppSignatureType = 'erc1271' | 'raw';

/**
 * Signature response returned by the miniapp host.
 */
export interface MiniAppSignResult {
  signature: Hex;
  verified: boolean;
}

/**
 * Configuration options for MiniAppPostMessageRunner.
 */
export interface MiniAppPostMessageRunnerOptions {
  /**
   * targetOrigin used for window.parent.postMessage.
   * Defaults to '*'.
   */
  targetOrigin?: string;

  /**
   * If provided, only messages from this origin will be accepted.
   * Useful to avoid handling messages from unexpected windows.
   */
  expectedOrigin?: string;

  /**
   * Timeout for request/response cycles in milliseconds.
   * Defaults to 30 seconds.
   */
  requestTimeoutMs?: number;

  /**
   * Optional preconfigured address.
   * If omitted, init() requests it from the host via postMessage.
   */
  address?: Address;
}

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  timer: unknown;
}

interface AddressWaiter {
  resolve: (address: Address) => void;
  reject: (reason: unknown) => void;
  timer: unknown;
}

interface MiniAppTransaction {
  to: Address;
  data: Hex;
  value: string;
}

/**
 * Batch transaction runner for postMessage miniapp host.
 */
export class MiniAppBatchRun implements BatchRun {
  private readonly transactions: TransactionRequest[] = [];

  constructor(private readonly runner: MiniAppPostMessageRunner) {}

  addTransaction(tx: TransactionRequest): void {
    this.transactions.push(tx);
  }

  async run(): Promise<TransactionReceipt> {
    return this.runner.sendTransaction(this.transactions);
  }
}

/**
 * Contract runner that talks to a Circles miniapp host via postMessage.
 *
 * Expected host protocol (mini app -> host):
 * - { type: 'request_address' }
 * - { type: 'send_transactions', requestId, transactions }
 * - { type: 'sign_message', requestId, message, signatureType }
 *
 * Expected host protocol (host -> mini app):
 * - { type: 'wallet_connected', address }
 * - { type: 'wallet_disconnected' }
 * - { type: 'tx_success', requestId, hashes }
 * - { type: 'tx_rejected', requestId, reason? }
 * - { type: 'sign_success', requestId, signature, verified }
 * - { type: 'sign_rejected', requestId, reason? }
 */
export class MiniAppPostMessageRunner implements ContractRunner {
  public address?: Address;
  public publicClient: PublicClient;

  private readonly targetOrigin: string;
  private readonly expectedOrigin?: string;
  private readonly requestTimeoutMs: number;

  private initialized = false;
  private requestCounter = 0;
  private messageHandler?: (event: unknown) => void;

  private readonly pendingTxRequests = new Map<string, PendingRequest<string[]>>();
  private readonly pendingSignRequests = new Map<string, PendingRequest<MiniAppSignResult>>();
  private readonly addressWaiters: AddressWaiter[] = [];

  constructor(publicClient: PublicClient, options: MiniAppPostMessageRunnerOptions = {}) {
    this.publicClient = publicClient;
    this.address = options.address;
    this.targetOrigin = options.targetOrigin ?? '*';
    this.expectedOrigin = options.expectedOrigin;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 30_000;
  }

  /**
   * Create and initialize the postMessage runner in one step.
   */
  static async create(
    rpcUrl: string,
    chain: Chain,
    options: MiniAppPostMessageRunnerOptions = {}
  ): Promise<MiniAppPostMessageRunner> {
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    const runner = new MiniAppPostMessageRunner(publicClient, options);
    await runner.init();
    return runner;
  }

  /**
   * Initialize listener and request connected wallet address from host.
   */
  async init(): Promise<void> {
    if (!this.initialized) {
      const win = this.getWindowOrThrow();

      if (typeof win.addEventListener !== 'function') {
        throw RunnerError.initializationFailed(
          'MiniAppPostMessageRunner',
          new Error('window.addEventListener is not available')
        );
      }

      this.messageHandler = (event: unknown) => {
        this.handleMessage(event);
      };

      win.addEventListener('message', this.messageHandler);
      this.initialized = true;
    }

    if (!this.address) {
      this.address = await this.waitForAddress();
    }
  }

  /**
   * Remove listeners and reject pending requests.
   */
  destroy(): void {
    if (this.initialized && this.messageHandler) {
      const win = (globalThis as any).window;
      if (win && typeof win.removeEventListener === 'function') {
        win.removeEventListener('message', this.messageHandler);
      }
    }

    this.initialized = false;
    this.messageHandler = undefined;

    const error = RunnerError.walletError('MiniAppPostMessageRunner was destroyed');
    this.rejectAllTxPending(error);
    this.rejectAllSignPending(error);
    this.rejectAllAddressWaiters(error);
  }

  /**
   * Estimate gas for a transaction using the configured public client.
   */
  estimateGas = async (tx: TransactionRequest): Promise<bigint> => {
    const estimate = await this.publicClient.estimateGas({
      account: tx.from || this.address,
      to: tx.to,
      data: tx.data,
      value: tx.value,
    });

    return estimate;
  };

  /**
   * Call a contract (read-only) using the configured public client.
   */
  call = async (tx: TransactionRequest): Promise<string> => {
    const result = await this.publicClient.call({
      account: tx.from || this.address,
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
    });

    return result.data || '0x';
  };

  /**
   * Resolve ENS name via public client.
   */
  resolveName = async (name: string): Promise<string | null> => {
    try {
      const address = await this.publicClient.getEnsAddress({ name });
      return address;
    } catch {
      return null;
    }
  };

  /**
   * Send one or more transactions through the miniapp host.
   *
   * The host returns transaction hash(es). This runner waits for receipts
   * and returns the last receipt (or the only receipt) for compatibility
   * with ContractRunner expectations.
   */
  sendTransaction = async (txs: TransactionRequest[]): Promise<TransactionReceipt> => {
    if (txs.length === 0) {
      throw RunnerError.executionFailed('No transactions provided');
    }

    await this.ensureReady();

    const transactions: MiniAppTransaction[] = txs.map((tx) => ({
      to: tx.to,
      data: tx.data ?? '0x',
      value: (tx.value ?? BigInt(0)).toString(),
    }));

    const hashes = await this.requestTransactions(transactions);

    if (hashes.length === 0) {
      throw RunnerError.executionFailed('No transaction hash returned from miniapp host');
    }

    let latestReceipt: TransactionReceipt | undefined;

    for (const hash of hashes) {
      if (typeof hash !== 'string' || !hash.startsWith('0x')) {
        throw RunnerError.executionFailed(`Invalid transaction hash returned by host: ${String(hash)}`);
      }

      latestReceipt = await this.publicClient.waitForTransactionReceipt({
        hash: hash as Hex,
      });

      if (latestReceipt.status === 'reverted') {
        throw RunnerError.transactionReverted(
          latestReceipt.transactionHash,
          latestReceipt.blockNumber,
          latestReceipt.gasUsed
        );
      }
    }

    if (!latestReceipt) {
      throw RunnerError.executionFailed('Failed to fetch transaction receipt from returned hash(es)');
    }

    return latestReceipt;
  };

  /**
   * Create a batch transaction runner.
   */
  sendBatchTransaction = (): MiniAppBatchRun => {
    return new MiniAppBatchRun(this);
  };

  /**
   * Request message signing through the miniapp host.
   *
   * This is an extra helper not required by ContractRunner,
   * but useful when miniapps also need signature requests.
   */
  signMessage = async (
    message: string,
    signatureType: MiniAppSignatureType = 'erc1271'
  ): Promise<MiniAppSignResult> => {
    if (!message) {
      throw RunnerError.walletError('Message is required for signing');
    }

    await this.ensureReady();
    return this.requestSignature(message, signatureType);
  };

  private async ensureReady(): Promise<void> {
    if (!this.initialized) {
      await this.init();
      return;
    }

    if (!this.address) {
      this.address = await this.waitForAddress();
    }
  }

  private getWindowOrThrow(): any {
    const win = (globalThis as any).window;
    if (!win) {
      throw RunnerError.initializationFailed(
        'MiniAppPostMessageRunner',
        new Error('window is not available. This runner requires a browser environment.')
      );
    }
    return win;
  }

  private postToParent(payload: Record<string, unknown>): void {
    const win = this.getWindowOrThrow();
    const parentWindow = win.parent;

    if (!parentWindow || parentWindow === win || typeof parentWindow.postMessage !== 'function') {
      throw RunnerError.initializationFailed(
        'MiniAppPostMessageRunner',
        new Error('window.parent is unavailable. This runner must run inside an iframe miniapp host.')
      );
    }

    parentWindow.postMessage(payload, this.targetOrigin);
  }

  private nextRequestId(prefix: string): string {
    this.requestCounter += 1;
    return `${prefix}_${this.requestCounter}`;
  }

  private waitForAddress(): Promise<Address> {
    if (this.address) {
      return Promise.resolve(this.address);
    }

    return new Promise((resolve, reject) => {
      const waiter: AddressWaiter = {
        resolve,
        reject,
        timer: this.createTimer(() => {
          this.removeAddressWaiter(waiter);
          reject(
            RunnerError.walletError(
              `Timed out waiting for wallet connection from miniapp host (${this.requestTimeoutMs}ms)`
            )
          );
        }, this.requestTimeoutMs),
      };

      this.addressWaiters.push(waiter);

      try {
        this.postToParent({ type: 'request_address' });
      } catch (error) {
        this.removeAddressWaiter(waiter);
        this.clearTimer(waiter.timer);
        reject(
          RunnerError.initializationFailed(
            'MiniAppPostMessageRunner',
            error
          )
        );
      }
    });
  }

  private removeAddressWaiter(waiter: AddressWaiter): void {
    const index = this.addressWaiters.indexOf(waiter);
    if (index !== -1) {
      this.addressWaiters.splice(index, 1);
    }
  }

  private createTimer(callback: () => void, timeoutMs: number): unknown {
    const setTimeoutFn = (globalThis as any)?.setTimeout;
    if (typeof setTimeoutFn !== 'function') {
      throw RunnerError.walletError('Timer API is not available in current environment');
    }
    return setTimeoutFn(callback, timeoutMs);
  }

  private clearTimer(timer: unknown): void {
    const clearTimeoutFn = (globalThis as any)?.clearTimeout;
    if (typeof clearTimeoutFn === 'function') {
      clearTimeoutFn(timer);
    }
  }

  private resolveAllAddressWaiters(address: Address): void {
    while (this.addressWaiters.length > 0) {
      const waiter = this.addressWaiters.shift()!;
      this.clearTimer(waiter.timer);
      waiter.resolve(address);
    }
  }

  private rejectAllAddressWaiters(error: unknown): void {
    while (this.addressWaiters.length > 0) {
      const waiter = this.addressWaiters.shift()!;
      this.clearTimer(waiter.timer);
      waiter.reject(error);
    }
  }

  private rejectAllTxPending(error: unknown): void {
    for (const [requestId, pending] of this.pendingTxRequests) {
      this.clearTimer(pending.timer);
      pending.reject(error);
      this.pendingTxRequests.delete(requestId);
    }
  }

  private rejectAllSignPending(error: unknown): void {
    for (const [requestId, pending] of this.pendingSignRequests) {
      this.clearTimer(pending.timer);
      pending.reject(error);
      this.pendingSignRequests.delete(requestId);
    }
  }

  private normalizeAddress(address: unknown): Address {
    try {
      return getAddress(String(address));
    } catch (error) {
      throw RunnerError.walletError('Received invalid address from miniapp host', error);
    }
  }

  private handleMessage(event: unknown): void {
    const evt = event as { data?: any; origin?: string };
    const data = evt?.data;

    if (!data || typeof data !== 'object' || typeof data.type !== 'string') {
      return;
    }

    if (this.expectedOrigin && evt.origin !== this.expectedOrigin) {
      return;
    }

    const win = (globalThis as any).window;
    if (win?.parent && (evt as any)?.source && (evt as any).source !== win.parent) {
      return;
    }

    switch (data.type) {
      case 'wallet_connected': {
        try {
          const normalizedAddress = this.normalizeAddress(data.address);
          this.address = normalizedAddress;
          this.resolveAllAddressWaiters(normalizedAddress);
        } catch (error) {
          const runnerError = RunnerError.walletError(
            'Received invalid wallet_connected payload from miniapp host',
            error
          );
          this.rejectAllAddressWaiters(runnerError);
        }
        return;
      }

      case 'wallet_disconnected': {
        this.address = undefined;
        const error = RunnerError.walletError('Wallet disconnected from miniapp host');
        this.rejectAllAddressWaiters(error);
        this.rejectAllTxPending(error);
        this.rejectAllSignPending(error);
        return;
      }

      case 'tx_success': {
        const requestId = typeof data.requestId === 'string' ? data.requestId : undefined;
        if (!requestId) return;

        const pending = this.pendingTxRequests.get(requestId);
        if (!pending) return;

        this.clearTimer(pending.timer);
        this.pendingTxRequests.delete(requestId);

        const hashes = Array.isArray(data.hashes)
          ? data.hashes.filter((hash: unknown) => typeof hash === 'string')
          : (typeof data.hash === 'string' ? [data.hash] : []);

        pending.resolve(hashes);
        return;
      }

      case 'tx_rejected': {
        const requestId = typeof data.requestId === 'string' ? data.requestId : undefined;
        if (!requestId) return;

        const pending = this.pendingTxRequests.get(requestId);
        if (!pending) return;

        this.clearTimer(pending.timer);
        this.pendingTxRequests.delete(requestId);

        const reason = String(data.error ?? data.reason ?? 'Rejected');
        pending.reject(RunnerError.executionFailed(`Miniapp host rejected transaction request: ${reason}`));
        return;
      }

      case 'sign_success': {
        const requestId = typeof data.requestId === 'string' ? data.requestId : undefined;
        if (!requestId) return;

        const pending = this.pendingSignRequests.get(requestId);
        if (!pending) return;

        this.clearTimer(pending.timer);
        this.pendingSignRequests.delete(requestId);

        pending.resolve({
          signature: String(data.signature) as Hex,
          verified: Boolean(data.verified),
        });
        return;
      }

      case 'sign_rejected': {
        const requestId = typeof data.requestId === 'string' ? data.requestId : undefined;
        if (!requestId) return;

        const pending = this.pendingSignRequests.get(requestId);
        if (!pending) return;

        this.clearTimer(pending.timer);
        this.pendingSignRequests.delete(requestId);

        const reason = String(data.error ?? data.reason ?? 'Rejected');
        pending.reject(RunnerError.walletError(`Miniapp host rejected signature request: ${reason}`));
      }
    }
  }

  private requestTransactions(transactions: MiniAppTransaction[]): Promise<string[]> {
    const requestId = this.nextRequestId('tx');

    return new Promise((resolve, reject) => {
      const timer = this.createTimer(() => {
        this.pendingTxRequests.delete(requestId);
        reject(
          RunnerError.executionFailed(
            `Timed out waiting for transaction response from miniapp host (${this.requestTimeoutMs}ms)`
          )
        );
      }, this.requestTimeoutMs);

      this.pendingTxRequests.set(requestId, {
        resolve,
        reject,
        timer,
      });

      try {
        this.postToParent({
          type: 'send_transactions',
          requestId,
          transactions,
        });
      } catch (error) {
        this.clearTimer(timer);
        this.pendingTxRequests.delete(requestId);
        reject(RunnerError.executionFailed('Failed to post transaction request to miniapp host', error));
      }
    });
  }

  private requestSignature(
    message: string,
    signatureType: MiniAppSignatureType
  ): Promise<MiniAppSignResult> {
    const requestId = this.nextRequestId('sign');

    return new Promise((resolve, reject) => {
      const timer = this.createTimer(() => {
        this.pendingSignRequests.delete(requestId);
        reject(
          RunnerError.walletError(
            `Timed out waiting for signature response from miniapp host (${this.requestTimeoutMs}ms)`
          )
        );
      }, this.requestTimeoutMs);

      this.pendingSignRequests.set(requestId, {
        resolve,
        reject,
        timer,
      });

      try {
        this.postToParent({
          type: 'sign_message',
          requestId,
          message,
          signatureType,
        });
      } catch (error) {
        this.clearTimer(timer);
        this.pendingSignRequests.delete(requestId);
        reject(RunnerError.walletError('Failed to post signature request to miniapp host', error));
      }
    });
  }
}
