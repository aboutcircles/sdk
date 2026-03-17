import type { RpcClient } from '../client';
import type { Address, TokenBalance } from '@aboutcircles/sdk-types';
import { normalizeAddress, parseStringsToBigInt, checksumAddresses } from '../utils';
import { CirclesConverter } from '@aboutcircles/sdk-utils/circlesConverter';

/**
 * Balance query RPC methods
 */
export class BalanceMethods {
  constructor(private client: RpcClient) {}

  /**
   * Get the total v2 Circles balance of an account
   *
   * @param address - The avatar address to query
   * @param asTimeCircles - Whether to return balance as TimeCircles (default: true)
   * @returns The total v2 balance in attoCircles (10^18 per Circle) as bigint
   *
   * @example
   * ```typescript
   * const balance = await rpc.balance.getTotalBalance('0xcadd4ea3bcc361fc4af2387937d7417be8d7dfc2');
   * console.log(balance); // 1000000000000000000n (1 Circle in attoCircles)
   * ```
   */
  async getTotalBalance(address: Address, asTimeCircles: boolean = true): Promise<bigint> {
    const result = await this.client.call<[Address, boolean], number>('circlesV2_getTotalBalance', [
      normalizeAddress(address),
      asTimeCircles,
    ]);
    return CirclesConverter.circlesToAttoCircles(result);
  }

  /**
   * Query the balance breakdown of a specific avatar address
   *
   * @param address - The avatar address to query
   * @returns Array of token balances (amounts as bigint)
   *
   * @example
   * ```typescript
   * const balances = await rpc.balance.getTokenBalances('0x7cadf434b692ca029d950607a4b3f139c30d4e98');
   * console.log(balances);
   * ```
   */
  async getTokenBalances(address: Address): Promise<TokenBalance[]> {
    const result = await this.client.call<[Address], Record<string, unknown>[]>('circles_getTokenBalances', [
      normalizeAddress(address),
    ]);
    const parsed = result.map(item => parseStringsToBigInt(item)) as unknown as TokenBalance[];
    return checksumAddresses(parsed);
  }
}
