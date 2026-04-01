/**
 * JSON-RPC types
 */

/**
 * JSON-RPC request structure
 */
export interface JsonRpcRequest<TParams = unknown[]> {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params: TParams;
}

/**
 * JSON-RPC response structure
 */
export interface JsonRpcResponse<TResult = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  result?: TResult;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Circles query response format
 * Used for circles_query RPC method results
 */
export interface CirclesQueryResponse {
  columns: string[];
  rows: any[][];
}

/**
 * Paginated query response from circles_paginated_query.
 * Server returns columns, rows, hasMore flag, and an opaque cursor for next page.
 */
export interface PaginatedQueryResponse {
  columns: string[];
  rows: any[][];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Generic query response wrapper
 * Used for internal query transformations and type-safe responses
 */
export interface QueryResponse<T = unknown> {
  result: T;
  error?: unknown;
}
