import type { RpcClient } from '../client';
import type { Address, TransactionHistoryRow, EnrichedTransaction, PagedResponse } from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils';

/**
 * Transaction history RPC methods
 */
export class TransactionMethods {
  constructor(private client: RpcClient) {}

  /**
   * Get transaction history for an address
   *
   * Uses the native RPC method which efficiently queries transfers and calculates
   * all circle amount formats server-side. Fetches all results using cursor-based
   * pagination up to the specified limit.
   *
   * @param avatar - Avatar address to query transaction history for
   * @param limit - Maximum number of transactions to return (default: 50)
   * @returns Array of transaction history rows with all circle amount formats
   *
   * @example
   * ```typescript
   * const history = await rpc.transaction.getTransactionHistory('0xAvatar...', 50);
   * history.forEach(tx => {
   *   console.log(`${tx.from} -> ${tx.to}: ${tx.circles} CRC`);
   * });
   * ```
   */
  async getTransactionHistory(
    avatar: Address,
    limit: number = 50,
    cursor?: string | null
  ): Promise<PagedResponse<TransactionHistoryRow>> {
    const response = await this.client.call<[Address, number, string | null], PagedResponse<TransactionHistoryRow>>(
      'circles_getTransactionHistory',
      [normalizeAddress(avatar), limit, cursor ?? null]
    );

    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }

  /**
   * Get enriched transaction history
   * Includes profile data and pre-calculated balance formats
   *
   * @param avatar - Avatar address to query
   * @param limit - Number of transactions per page (default: 20)
   * @param cursor - Pagination cursor
   * @returns Paged response with enriched transactions
   */
  async getTransactionHistoryEnriched(
    avatar: Address,
    fromBlock: number = 0,
    toBlock: number | null = null,
    limit: number = 20,
    cursor?: string | null
  ): Promise<PagedResponse<EnrichedTransaction>> {
    const response = await this.client.call<[Address, number, number | null, number, string | null], PagedResponse<EnrichedTransaction>>(
      'circles_getTransactionHistoryEnriched',
      [normalizeAddress(avatar), fromBlock, toBlock, limit, cursor ?? null]
    );

    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }
}
