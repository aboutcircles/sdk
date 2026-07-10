import { jsonRpcCall } from './jsonrpc.js';
import type { HttpOptions } from './http.js';
import type { AnvilInfo } from './types.js';

function toHex(value: bigint | number | string): string {
  if (typeof value === 'string') {
    return value.startsWith('0x') ? value : `0x${BigInt(value).toString(16)}`;
  }
  return `0x${BigInt(value).toString(16)}`;
}

export class AnvilProxy {
  constructor(
    private readonly info: AnvilInfo,
    private readonly httpOptions: HttpOptions = {},
  ) {}

  get rpcUrl(): string {
    return this.info.rpcUrl;
  }

  get accounts(): readonly string[] {
    return this.info.accounts;
  }

  get chainId(): number {
    return this.info.chainId;
  }

  call<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
    return jsonRpcCall<T>(this.info.rpcUrl, method, params, this.httpOptions);
  }

  impersonate(address: string): Promise<unknown> {
    return this.call('anvil_impersonateAccount', [address]);
  }

  stopImpersonating(address: string): Promise<unknown> {
    return this.call('anvil_stopImpersonatingAccount', [address]);
  }

  setBalance(address: string, valueWei: bigint | string): Promise<unknown> {
    return this.call('anvil_setBalance', [address, toHex(valueWei)]);
  }

  setCode(address: string, code: string): Promise<unknown> {
    return this.call('anvil_setCode', [address, code]);
  }

  async snapshot(): Promise<string> {
    return await this.call<string>('evm_snapshot', []);
  }

  async revert(snapshotId: string): Promise<boolean> {
    return await this.call<boolean>('evm_revert', [snapshotId]);
  }

  mine(blocks = 1, intervalSec = 0): Promise<unknown> {
    return this.call('anvil_mine', [toHex(blocks), toHex(intervalSec)]);
  }

  async getBalance(address: string, block: string | number = 'latest'): Promise<bigint> {
    const blockTag = typeof block === 'string' ? block : toHex(block);
    const hex = await this.call<string>('eth_getBalance', [address, blockTag]);
    return BigInt(hex);
  }

  async getBlockNumber(): Promise<bigint> {
    const hex = await this.call<string>('eth_blockNumber', []);
    return BigInt(hex);
  }
}
