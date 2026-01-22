import type { RpcClient } from '../client';
import type { Address, Filter } from '@aboutcircles/sdk-types';
import type { TransactionHistoryRow } from '../types';
import { normalizeAddress, checksumAddresses } from '../utils';
import { CirclesConverter } from '@aboutcircles/sdk-utils/circlesConverter';
import { PagedQuery } from '../pagedQuery';

/**
 * Calculate circle amounts for v2 transactions
 */
function calculateCircleAmounts(value: string, timestamp: number): {
  circles: number;
  attoCircles: bigint;
  staticCircles: number;
  staticAttoCircles: bigint;
  crc: number;
  attoCrc: bigint;
} {
  // v2: value is attoCircles (demurraged)
  const attoCircles = BigInt(value);
  const circles = CirclesConverter.attoCirclesToCircles(attoCircles);

  const attoCrc = CirclesConverter.attoCirclesToAttoCrc(attoCircles, BigInt(timestamp));
  const crc = CirclesConverter.attoCirclesToCircles(attoCrc);

  const staticAttoCircles = CirclesConverter.attoCirclesToAttoStaticCircles(attoCircles, BigInt(timestamp));
  const staticCircles = CirclesConverter.attoCirclesToCircles(staticAttoCircles);

  return {
    attoCircles,
    circles,
    staticAttoCircles,
    staticCircles,
    attoCrc,
    crc,
  };
}

/**
 * Transaction history RPC methods
 */
export class TransactionMethods {
  constructor(private client: RpcClient) {}

  /**
   * Get transaction history for an address using cursor-based pagination
   *
   * Returns a PagedQuery instance that can be used to fetch transaction history page by page.
   * Automatically calculates circle amounts for each v2 transaction.
   *
   * @param avatar - Avatar address to query transaction history for
   * @param limit - Number of transactions per page (default: 50)
   * @param sortOrder - Sort order for results (default: 'DESC')
   * @returns PagedQuery instance for iterating through transaction history
   *
   * @example
   * ```typescript
   * const query = rpc.transaction.getTransactionHistory('0xAvatar...', 50);
   *
   * // Get first page
   * await query.queryNextPage();
   * query.currentPage.results.forEach(tx => {
   *   console.log(`${tx.from} -> ${tx.to}: ${tx.circles} CRC`);
   * });
   *
   * // Get next page if available
   * if (query.currentPage.hasMore) {
   *   await query.queryNextPage();
   *   // Process next page...
   * }
   * ```
   */
  getTransactionHistory(
    avatar: Address,
    limit: number = 50,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): PagedQuery<TransactionHistoryRow> {
    const normalized = normalizeAddress(avatar);

    const filter: Filter[] = [
      {
        Type: 'Conjunction',
        ConjunctionType: 'And',
        Predicates: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'version',
            Value: 2,
          },
          {
            Type: 'Conjunction',
            ConjunctionType: 'Or',
            Predicates: [
              {
                Type: 'FilterPredicate',
                FilterType: 'Equals',
                Column: 'from',
                Value: normalized,
              },
              {
                Type: 'FilterPredicate',
                FilterType: 'Equals',
                Column: 'to',
                Value: normalized,
              },
            ],
          },
        ],
      },
    ];

    return new PagedQuery<TransactionHistoryRow>(
      this.client,
      {
        namespace: 'V_Crc',
        table: 'TransferSummary',
        sortOrder,
        columns: [], // Empty array returns all columns
        filter,
        limit,
      },
      (row) => {
        // Calculate circle amounts
        const amounts = calculateCircleAmounts(row.value, row.timestamp);
        const result = {
          ...row,
          ...amounts,
        };
        return checksumAddresses(result) as TransactionHistoryRow;
      }
    );
  }
}
