import { httpJson, type HttpOptions } from './http.js';
import type { PostgresInfo, QueryResult, ScalarResult } from './types.js';

export class PostgresProxy {
  constructor(
    private readonly info: PostgresInfo,
    private readonly httpOptions: HttpOptions = {},
  ) {}

  get blockNumber(): number {
    return this.info.blockNumber;
  }

  get queryUrl(): string {
    return this.info.queryUrl;
  }

  query<TRow = Record<string, unknown>>(
    sql: string,
    parameters?: Record<string, unknown>,
  ): Promise<QueryResult<TRow>> {
    return httpJson<QueryResult<TRow>>(
      this.info.queryUrl,
      { method: 'POST', body: JSON.stringify({ sql, parameters }) },
      this.httpOptions,
    );
  }

  scalar<T = unknown>(
    sql: string,
    parameters?: Record<string, unknown>,
  ): Promise<ScalarResult<T>> {
    return httpJson<ScalarResult<T>>(
      this.info.scalarUrl,
      { method: 'POST', body: JSON.stringify({ sql, parameters }) },
      this.httpOptions,
    );
  }
}
