export type SessionFeature = 'db' | 'anvil' | 'rpc' | 'pathfinder';

export interface CreateSessionRequest {
  blockNumber: number;
  features: SessionFeature[];
  ttlMinutes?: number;
}

export interface PostgresInfo {
  queryUrl: string;
  scalarUrl: string;
  blockNumber: number;
}

export interface AnvilInfo {
  rpcUrl: string;
  accounts: string[];
  chainId: number;
}

export interface RpcInfo {
  url: string;
}

export interface PathfinderInfo {
  url: string;
  blockNumber: number;
}

export interface SessionResponse {
  sessionId: string;
  blockNumber: number;
  postgres: PostgresInfo | null;
  anvil: AnvilInfo | null;
  rpc: RpcInfo | null;
  pathfinder: PathfinderInfo | null;
  expiresAt: string;
  status: number | string;
}

export interface FindPathRequest {
  source: string;
  sink: string;
  targetFlow: bigint | string;
  withWrap?: boolean;
  fromTokens?: string[];
  toTokens?: string[];
  excludeFromTokens?: string[];
  excludeToTokens?: string[];
  flags?: number;
  maxTransfers?: number;
}

export interface TransferStep {
  from: string;
  to: string;
  tokenOwner: string;
  value: string;
}

export interface FindPathResponse {
  maxFlow: string;
  transfers: TransferStep[];
  graphBlock: number;
}

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params: unknown[];
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

export interface QueryResult<TRow = Record<string, unknown>> {
  columns: string[];
  rows: TRow[];
  rowCount: number;
  executionTimeMs: number;
}

export interface ScalarResult<T = unknown> {
  value: T;
  executionTimeMs: number;
}

export class TestEnvError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'TestEnvError';
  }
}

export class JsonRpcError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'JsonRpcError';
  }
}
