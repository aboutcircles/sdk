import type { RpcClient } from './client';
import type {
  PagedQueryParams,
  OrderBy,
  QueryParams,
  PaginatedQueryResponse,
} from '@aboutcircles/sdk-types';
import type { CursorColumn, FlexiblePagedResult } from './types';

/**
 * Default cursor columns for event-based tables (blockNumber, transactionIndex, logIndex DESC)
 */
const EVENT_CURSOR_COLUMNS: CursorColumn[] = [
  { name: 'blockNumber', sortOrder: 'DESC' },
  { name: 'transactionIndex', sortOrder: 'DESC' },
  { name: 'logIndex', sortOrder: 'DESC' },
];

/**
 * A class for querying Circles RPC nodes with server-side cursor-based pagination.
 * Uses circles_paginated_query which returns {columns, rows, hasMore, nextCursor}.
 *
 * @typeParam TRow The type of the rows returned by the query.
 *
 * @example
 * ```typescript
 * const query = new PagedQuery<GroupMembershipRow>(rpc.client, {
 *   namespace: 'V_CrcV2',
 *   table: 'GroupMemberships',
 *   sortOrder: 'DESC',
 *   columns: ['blockNumber', 'transactionIndex', 'logIndex', 'group', 'member'],
 *   filter: [{ Type: 'FilterPredicate', FilterType: 'Equals', Column: 'group', Value: '0x...' }],
 *   limit: 100
 * });
 *
 * while (await query.queryNextPage()) {
 *   console.log(query.currentPage!.results);
 *   if (!query.currentPage!.hasMore) break;
 * }
 * ```
 */
export class PagedQuery<TRow = any> {
  private readonly params: PagedQueryParams & {
    cursorColumns?: CursorColumn[];
    orderColumns?: OrderBy[];
    rowTransformer?: (row: any) => TRow
  };
  private readonly client: RpcClient;
  private readonly rowTransformer?: (row: any) => TRow;
  private readonly cursorColumns: CursorColumn[];
  private readonly orderColumns?: OrderBy[];

  get currentPage(): FlexiblePagedResult<TRow> | undefined {
    return this._currentPage;
  }

  private _currentPage?: FlexiblePagedResult<TRow>;

  constructor(
    client: RpcClient,
    params: PagedQueryParams & {
      cursorColumns?: CursorColumn[];
      orderColumns?: OrderBy[];
      rowTransformer?: (row: any) => TRow
    },
    rowTransformer?: (row: any) => TRow
  ) {
    this.client = client;
    this.params = params;
    this.rowTransformer = rowTransformer || params.rowTransformer;
    this.orderColumns = params.orderColumns;

    // Cursor columns only used for buildOrderBy() — actual pagination is server-side
    this.cursorColumns = params.cursorColumns || this.buildEventCursorColumns();
  }

  /**
   * Builds cursor columns for event-based tables
   */
  private buildEventCursorColumns(): CursorColumn[] {
    const columns = EVENT_CURSOR_COLUMNS.map(col => ({
      ...col,
      sortOrder: this.params.sortOrder
    }));

    if (this.params.table === 'TransferBatch') {
      columns.push({ name: 'batchIndex', sortOrder: this.params.sortOrder });
    }

    return columns;
  }

  /**
   * Builds the order by clause.
   * If orderColumns are provided, uses those. Otherwise builds from cursor columns.
   */
  private buildOrderBy(): OrderBy[] {
    if (this.orderColumns && this.orderColumns.length > 0) {
      return this.orderColumns;
    }

    return this.cursorColumns.map(col => ({
      Column: col.name,
      SortOrder: col.sortOrder,
    }));
  }

  /**
   * Converts query response rows to typed objects
   */
  private rowsToObjects(response: PaginatedQueryResponse): TRow[] {
    const { columns, rows } = response;

    return rows.map(row => {
      const rowObj: any = {};
      columns.forEach((col, index) => {
        rowObj[col] = row[index];
      });

      return this.rowTransformer ? this.rowTransformer(rowObj) : rowObj as TRow;
    });
  }

  /**
   * Queries the next page of results using server-side cursor pagination.
   *
   * @returns True if results were found, false otherwise
   */
  public async queryNextPage(): Promise<boolean> {
    const queryParams: QueryParams = {
      Namespace: this.params.namespace,
      Table: this.params.table,
      Columns: this.params.columns,
      Filter: this.params.filter || [],
      Order: this.buildOrderBy(),
      Limit: this.params.limit,
    };

    // Pass [queryParams] or [queryParams, nextCursor] to circles_paginated_query
    const rpcParams: [QueryParams] | [QueryParams, string] = this._currentPage?.nextCursor
      ? [queryParams, this._currentPage.nextCursor]
      : [queryParams];

    const response = await this.client.call<typeof rpcParams, PaginatedQueryResponse>(
      'circles_paginated_query',
      rpcParams
    );

    const results = this.rowsToObjects(response);

    this._currentPage = {
      limit: this.params.limit,
      size: results.length,
      sortOrder: this.params.sortOrder,
      hasMore: response.hasMore,
      nextCursor: response.nextCursor ?? undefined,
      results,
    };

    return results.length > 0;
  }

  /**
   * Resets the query to start from the beginning
   */
  public reset(): void {
    this._currentPage = undefined;
  }
}
