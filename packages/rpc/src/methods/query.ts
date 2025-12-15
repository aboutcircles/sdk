import type { RpcClient } from '../client';
import type { QueryParams, TableInfo, EventType, PagedResult } from '@aboutcircles/sdk-types';
import { checksumAddresses } from '../utils';

/**
 * Filter predicate for advanced event queries
 */
export interface FilterPredicate {
  column: string;
  filterType: string;
  value: string;
}

/**
 * Paginated events response
 */
export interface PagedEventsResponse<T = unknown> {
  events: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

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
   * Query events of specific types within a block range with pagination support.
   *
   * @param address - Optional address filter (null for all addresses)
   * @param fromBlock - Starting block number (null for genesis)
   * @param toBlock - Ending block number (null for latest)
   * @param eventTypes - Array of event types to filter (null for all)
   * @param filterPredicates - Advanced filter predicates (null for none)
   * @param sortAscending - Sort order (default: false = descending)
   * @param limit - Maximum events to return (default: 100, max: 1000)
   * @param cursor - Pagination cursor from previous response (null for first page)
   * @returns Paginated events response with events array, hasMore flag, and nextCursor
   *
   * @example
   * ```typescript
   * // Basic usage - get first page of events for an address
   * const result = await rpc.query.events(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   38000000,
   *   null,
   *   ['CrcV1_Trust']
   * );
   * console.log(result.events);
   * console.log(result.hasMore, result.nextCursor);
   *
   * // Paginate through results
   * let cursor: string | null = null;
   * do {
   *   const page = await rpc.query.events(address, fromBlock, null, null, null, false, 100, cursor);
   *   console.log(page.events);
   *   cursor = page.nextCursor;
   * } while (cursor);
   * ```
   */
  async events<T = unknown>(
    address: string | null = null,
    fromBlock: number | null = null,
    toBlock: number | null = null,
    eventTypes: EventType[] | null = null,
    filterPredicates: FilterPredicate[] | null = null,
    sortAscending: boolean = false,
    limit: number = 100,
    cursor: string | null = null
  ): Promise<PagedEventsResponse<T>> {
    const result = await this.client.call<
      [string | null, number | null, number | null, EventType[] | null, FilterPredicate[] | null, boolean, number, string | null],
      PagedEventsResponse<T>
    >('circles_events', [address, fromBlock, toBlock, eventTypes, filterPredicates, sortAscending, limit, cursor]);

    return {
      events: checksumAddresses(result.events),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor
    };
  }
}
