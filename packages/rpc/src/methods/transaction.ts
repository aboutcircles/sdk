import type { RpcClient } from '../client.js';
import type { Address, TransactionHistoryRow, TransferDataRow, EnrichedTransaction, PagedResponse } from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils.js';

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

  /**
   * Get transfer-data annotations for an address.
   *
   * Annotations are blobs carried in the `data` of an ERC-1155 `safeTransferFrom` — including
   * the 0-value transfer batched alongside a gCRC/ERC-20 transfer to annotate it. The indexer
   * stores each as a row keyed by `(transactionHash, from, to)`; decode `row.data` with
   * `decodeCrcV2TransferData` from `@aboutcircles/sdk-utils`.
   *
   * @param address - Address whose annotations to query
   * @param direction - 'sent', 'received', or null/omitted for both
   * @param counterparty - Restrict to annotations exchanged with this address
   * @param fromBlock - Only annotations at or after this block
   * @param toBlock - Only annotations at or before this block
   * @param limit - Maximum rows to return (default: 50)
   * @param cursor - Keyset pagination cursor
   * @returns Paged response of transfer-data rows (newest first)
   *
   * @example
   * ```typescript
   * const page = await rpc.transaction.getTransferData('0xAvatar...', 'sent');
   * page.results.forEach(r => console.log(r.transactionHash, decodeCrcV2TransferData(r.data)));
   * ```
   */
  async getTransferData(
    address: Address,
    direction?: 'sent' | 'received' | null,
    counterparty?: Address | null,
    fromBlock?: number | null,
    toBlock?: number | null,
    limit: number = 50,
    cursor?: string | null
  ): Promise<PagedResponse<TransferDataRow>> {
    // Param order must match the plugin signature exactly: address, direction, counterparty,
    // fromBlock, toBlock, limit, cursor (common filters before block range).
    const response = await this.client.call<
      [Address, string | null, Address | null, number | null, number | null, number, string | null],
      PagedResponse<TransferDataRow>
    >('circles_getTransferData', [
      normalizeAddress(address),
      direction ?? null,
      counterparty ? normalizeAddress(counterparty) : null,
      fromBlock ?? null,
      toBlock ?? null,
      limit,
      cursor ?? null,
    ]);

    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }
}
