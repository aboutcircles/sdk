/**
 * Query and filter types for circles_query RPC method
 */

/**
 * Filter types for query predicates
 */
export type FilterType =
  | 'Equals'
  | 'NotEquals'
  | 'GreaterThan'
  | 'LessThan'
  | 'GreaterOrEqualThan'
  | 'LessOrEqualThan'
  | 'Like';

/**
 * Conjunction types for combining predicates
 */
export type ConjunctionType = 'And' | 'Or';

/**
 * Filter predicate for querying
 */
export interface FilterPredicate {
  Type: 'FilterPredicate';
  FilterType: FilterType;
  Column: string;
  Value: string | number | boolean;
}

/**
 * Conjunction for combining multiple predicates
 */
export interface Conjunction {
  Type: 'Conjunction';
  ConjunctionType: ConjunctionType;
  Predicates: (FilterPredicate | Conjunction)[];
}

/**
 * Filter type (either a predicate or conjunction)
 */
export type Filter = FilterPredicate | Conjunction;

/**
 * Order direction for query results
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Order by clause
 */
export interface OrderBy {
  Column: string;
  SortOrder: SortOrder;
}

/**
 * Query parameters for circles_query
 */
export interface QueryParams {
  Namespace: string;
  Table: string;
  Columns: string[];
  Filter: Filter[];
  Order: OrderBy[];
  Limit?: number;
}

/**
 * Column information within a table from circles_tables
 */
export interface TableColumnInfo {
  column: string;
  type: string;
}

/**
 * Table definition within a namespace from circles_tables
 */
export interface TableDefinition {
  table: string;
  columns: TableColumnInfo[];
}

/**
 * Namespace info from circles_tables (top-level array element)
 */
export interface TableInfo {
  namespace: string;
  tables: TableDefinition[];
}

/**
 * Pagination types
 */

/**
 * Defines the minimum columns any event row must have for cursor-based pagination.
 * These values are important for determining cursor position in result sets.
 */
export interface EventRow {
  blockNumber: number;
  transactionIndex: number;
  logIndex: number;
  batchIndex?: number;
  timestamp?: number;
}

/**
 * A cursor is a sortable unique identifier for a specific log entry.
 * Used to paginate through query results efficiently.
 */
export interface Cursor extends EventRow {}

/**
 * Result of a paginated query
 */
export interface PagedResult<TRow extends EventRow> {
  /**
   * The number of results that were requested
   */
  limit: number;
  /**
   * The number of results that were returned
   */
  size: number;
  /**
   * If the query returned results, this will be the cursor for the first result
   */
  firstCursor?: Cursor;
  /**
   * If the query returned results, this will be the cursor for the last result
   */
  lastCursor?: Cursor;
  /**
   * The sort order of the results
   */
  sortOrder: SortOrder;
  /**
   * Whether there are more results available
   */
  hasMore: boolean;
  /**
   * The results of the query
   */
  results: TRow[];
}

/**
 * Parameters for a paginated query
 */
export interface PagedQueryParams {
  /**
   * The namespace of the table to query
   */
  namespace: string;
  /**
   * The name of the table to query
   */
  table: string;
  /**
   * The order to sort the results
   */
  sortOrder: SortOrder;
  /**
   * The columns to return in the results
   */
  columns: string[];
  /**
   * The filters to apply to the query
   */
  filter?: Filter[];
  /**
   * The number of results to return per page
   */
  limit: number;
}
