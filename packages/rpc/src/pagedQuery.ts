import type { RpcClient } from './client.js';
import type {
  PagedQueryParams,
  Filter,
  OrderBy,
  QueryParams,
  CirclesQueryResponse,
} from '@aboutcircles/sdk-types';
import type { CursorColumn, FlexiblePagedResult } from './types.js';

/**
 * Cursor configuration for different table types
 */
const EVENT_CURSOR_COLUMNS: CursorColumn[] = [
  { name: 'blockNumber', sortOrder: 'DESC' },
  { name: 'transactionIndex', sortOrder: 'DESC' },
  { name: 'logIndex', sortOrder: 'DESC' },
];

/**
 * A class for querying Circles RPC nodes with cursor-based pagination.
 * Supports both event-based pagination (default) and custom cursor pagination (for view tables).
 *
 * @typeParam TRow The type of the rows returned by the query.
 *
 * @example
 * ```typescript
 * // Event-based pagination
 * const query = new PagedQuery<GroupMembershipRow>(rpc.client, {
 *   namespace: 'V_CrcV2',
 *   table: 'GroupMemberships',
 *   sortOrder: 'DESC',
 *   columns: ['blockNumber', 'transactionIndex', 'logIndex', 'group', 'member'],
 *   filter: [{ Type: 'FilterPredicate', FilterType: 'Equals', Column: 'group', Value: '0x...' }],
 *   limit: 100
 * });
 *
 * // Custom cursor pagination (for view tables)
 * const viewQuery = new PagedQuery<GroupTokenHolderRow>(rpc.client, {
 *   namespace: 'V_CrcV2',
 *   table: 'GroupTokenHoldersBalance',
 *   sortOrder: 'ASC',
 *   columns: ['group', 'holder', 'totalBalance'],
 *   cursorColumns: [{ name: 'holder', sortOrder: 'ASC' }],
 *   filter: [{ Type: 'FilterPredicate', FilterType: 'Equals', Column: 'group', Value: '0x...' }],
 *   limit: 100
 * });
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

    // Determine cursor columns based on table type
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

    // Add batchIndex for TransferBatch table
    if (this.params.table === 'TransferBatch') {
      columns.push({ name: 'batchIndex', sortOrder: this.params.sortOrder });
    }

    return columns;
  }

  /**
   * Transforms a cursor value for use in query filters
   */
  private transformCursorValue(value: any, transformer?: (v: any) => string | number | boolean): string | number | boolean {
    if (transformer) return transformer(value);
    if (typeof value === 'bigint') return value.toString();
    return value;
  }

  /**
   * Creates an equality predicate for a cursor column
   */
  private createEqualityPredicate(column: CursorColumn, value: any): Filter {
    return {
      Type: 'FilterPredicate',
      FilterType: 'Equals',
      Column: column.name,
      Value: this.transformCursorValue(value, column.toValue),
    };
  }

  /**
   * Creates a comparison predicate for a cursor column (> or <)
   */
  private createComparisonPredicate(column: CursorColumn, value: any): Filter {
    const filterType = column.sortOrder === 'ASC' ? 'GreaterThan' : 'LessThan';

    return {
      Type: 'FilterPredicate',
      FilterType: filterType,
      Column: column.name,
      Value: this.transformCursorValue(value, column.toValue),
    };
  }

  /**
   * Builds cursor filter for pagination using composite cursor columns.
   *
   * Creates an OR conjunction of predicates for each cursor level:
   * - First level: col1 > cursor.col1
   * - Second level: col1 = cursor.col1 AND col2 > cursor.col2
   * - Third level: col1 = cursor.col1 AND col2 = cursor.col2 AND col3 > cursor.col3
   *
   * This ensures correct pagination across all cursor columns.
   */
  private buildCursorFilter(cursor?: Record<string, any>): Filter[] {
    if (!cursor) return [];

    const orPredicates: Filter[] = [];

    for (let level = 0; level < this.cursorColumns.length; level++) {
      const currentColumn = this.cursorColumns[level];
      const cursorValue = cursor[currentColumn.name];

      if (cursorValue === undefined) continue;

      if (level === 0) {
        // First level: simple comparison (col > value)
        orPredicates.push(this.createComparisonPredicate(currentColumn, cursorValue));
      } else {
        // Subsequent levels: equality for all previous + comparison for current
        const andPredicates: Filter[] = [];

        // Add equality predicates for all previous columns
        for (let prevLevel = 0; prevLevel < level; prevLevel++) {
          const prevColumn = this.cursorColumns[prevLevel];
          const prevValue = cursor[prevColumn.name];

          if (prevValue !== undefined) {
            andPredicates.push(this.createEqualityPredicate(prevColumn, prevValue));
          }
        }

        // Add comparison predicate for current column
        andPredicates.push(this.createComparisonPredicate(currentColumn, cursorValue));

        orPredicates.push({
          Type: 'Conjunction',
          ConjunctionType: 'And',
          Predicates: andPredicates,
        });
      }
    }

    if (orPredicates.length === 0) return [];

    return [{
      Type: 'Conjunction',
      ConjunctionType: 'Or',
      Predicates: orPredicates,
    }];
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
   * Combines base filters with cursor filter
   */
  private combineFilters(baseFilters?: Filter[], cursorFilter?: Filter[]): Filter[] {
    if (!baseFilters?.length && !cursorFilter?.length) return [];
    if (!baseFilters?.length) return cursorFilter || [];
    if (!cursorFilter?.length) return baseFilters;

    return [{
      Type: 'Conjunction',
      ConjunctionType: 'And',
      Predicates: [...baseFilters, ...cursorFilter],
    }];
  }

  /**
   * Converts query response rows to typed objects
   */
  private rowsToObjects(response: CirclesQueryResponse): TRow[] {
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
   * Extracts cursor values from a row
   */
  private rowToCursor(row: TRow): Record<string, any> {
    const cursor: Record<string, any> = {};

    for (const column of this.cursorColumns) {
      cursor[column.name] = (row as any)[column.name];
    }

    return cursor;
  }

  /**
   * Gets first and last cursors from result set
   */
  private getCursors(results: TRow[]): { first?: Record<string, any>; last?: Record<string, any> } {
    if (results.length === 0) return {};

    return {
      first: this.rowToCursor(results[0]),
      last: this.rowToCursor(results[results.length - 1]),
    };
  }

  /**
   * Queries the next page of results.
   *
   * @returns True if results were found, false otherwise
   */
  public async queryNextPage(): Promise<boolean> {
    const cursorFilter = this.buildCursorFilter(this._currentPage?.lastCursor);
    const combinedFilter = this.combineFilters(this.params.filter, cursorFilter);

    const queryParams: QueryParams = {
      Namespace: this.params.namespace,
      Table: this.params.table,
      Columns: this.params.columns,
      Filter: combinedFilter,
      Order: this.buildOrderBy(),
      Limit: this.params.limit,
    };

    const response = await this.client.call<[QueryParams], CirclesQueryResponse>('circles_query', [queryParams]);
    const results = this.rowsToObjects(response);
    const cursors = this.getCursors(results);

    this._currentPage = {
      limit: this.params.limit,
      size: results.length,
      firstCursor: cursors.first,
      lastCursor: cursors.last,
      sortOrder: this.params.sortOrder,
      hasMore: results.length === this.params.limit,
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
