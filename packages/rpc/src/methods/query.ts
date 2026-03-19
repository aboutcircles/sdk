import type { RpcClient } from '../client.js';
import type { QueryParams, TableInfo, EventType } from '@aboutcircles/sdk-types';
import { checksumAddresses } from '../utils.js';

/**
 * Query and table RPC methods
 */
export class QueryMethods {
  constructor(private client: RpcClient) {}

  /**
   * Query tables with filters
   *
   * @param params - Query parameters including namespace, table, columns, filters, and ordering
   * @returns Array of query results
   *
   * @example
   * ```typescript
   * const results = await rpc.query.query({
   *   Namespace: 'V_CrcV2',
   *   Table: 'TrustRelations',
   *   Columns: [],
   *   Filter: [{
   *     Type: 'Conjunction',
   *     ConjunctionType: 'Or',
   *     Predicates: [
   *       {
   *         Type: 'FilterPredicate',
   *         FilterType: 'Equals',
   *         Column: 'truster',
   *         Value: '0xae3a29a9ff24d0e936a5579bae5c4179c4dff565'
   *       },
   *       {
   *         Type: 'FilterPredicate',
   *         FilterType: 'Equals',
   *         Column: 'trustee',
   *         Value: '0xae3a29a9ff24d0e936a5579bae5c4179c4dff565'
   *       }
   *     ]
   *   }],
   *   Order: []
   * });
   * ```
   */
  async query<T = unknown>(params: QueryParams): Promise<T[]> {
    const result = await this.client.call<[QueryParams], T[]>('circles_query', [params]);
    return checksumAddresses(result);
  }

  /**
   * Return all available namespaces and tables which can be queried
   *
   * @returns Array of table information
   *
   * @example
   * ```typescript
   * const tables = await rpc.query.tables();
   * console.log(tables);
   * ```
   */
  async tables(): Promise<TableInfo[]> {
    return this.client.call<[], TableInfo[]>('circles_tables', []);
  }

  /**
   * Query events of specific types within a block range
   *
   * @param fromBlock - Starting block number (null for genesis)
   * @param toBlock - Ending block number (null for latest)
   * @param eventTypes - Array of event types to filter (null for all)
   * @param address - Optional address filter
   * @param includeTransactionData - Whether to include transaction data
   * @returns Array of events
   *
   * @example
   * ```typescript
   * const events = await rpc.query.events(
   *   38000000,
   *   null,
   *   ['CrcV1_Trust'],
   *   null,
   *   false
   * );
   * ```
   */
  async events<T = unknown>(
    fromBlock: number | null,
    toBlock: number | null,
    eventTypes: EventType[] | null = null,
    address: string | null = null,
    includeTransactionData: boolean = false
  ): Promise<T[]> {
    const result = await this.client.call<
      [number | null, number | null, EventType[] | null, string | null, boolean],
      T[]
    >('circles_events', [fromBlock, toBlock, eventTypes, address, includeTransactionData]);
    return checksumAddresses(result);
  }
}
