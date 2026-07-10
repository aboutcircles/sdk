import { httpJson, type HttpOptions } from './http.js';
import { AnvilProxy } from './anvil.js';
import { PathfinderProxy } from './pathfinder.js';
import { PostgresProxy } from './postgres.js';
import { RpcProxy } from './rpc.js';
import type { SessionResponse } from './types.js';

export class Session {
  readonly id: string;
  readonly blockNumber: number;
  readonly expiresAt: Date;
  readonly postgres?: PostgresProxy;
  readonly anvil?: AnvilProxy;
  readonly rpc?: RpcProxy;
  readonly pathfinder?: PathfinderProxy;

  constructor(
    private readonly raw: SessionResponse,
    private readonly baseUrl: string,
    private readonly httpOptions: HttpOptions,
  ) {
    this.id = raw.sessionId;
    this.blockNumber = raw.blockNumber;
    this.expiresAt = new Date(raw.expiresAt);
    if (raw.postgres) this.postgres = new PostgresProxy(raw.postgres, httpOptions);
    if (raw.anvil) this.anvil = new AnvilProxy(raw.anvil, httpOptions);
    if (raw.rpc) this.rpc = new RpcProxy(raw.rpc, httpOptions);
    if (raw.pathfinder)
      this.pathfinder = new PathfinderProxy(raw.pathfinder, httpOptions);
  }

  toJSON(): SessionResponse {
    return this.raw;
  }

  async release(): Promise<void> {
    await httpJson<void>(
      `${this.baseUrl}/api/v1/session/${this.id}`,
      { method: 'DELETE' },
      this.httpOptions,
    );
  }
}
