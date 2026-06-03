import { CirclesRpc } from '@aboutcircles/sdk-rpc';
import { jsonRpcCall } from './jsonrpc.js';
import type { HttpOptions } from './http.js';
import type { RpcInfo } from './types.js';

export class RpcProxy {
  private circlesClient?: CirclesRpc;

  constructor(
    private readonly info: RpcInfo,
    private readonly httpOptions: HttpOptions = {},
  ) {}

  get url(): string {
    return this.info.url;
  }

  call<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
    return jsonRpcCall<T>(this.info.url, method, params, this.httpOptions);
  }

  /**
   * Returns a typed Circles SDK client (`@aboutcircles/sdk-rpc`) bound to this
   * session's RPC URL. Reads through it are scoped to the session's block: the
   * test environment injects `X-Max-Block-Number` server-side, which the Circles
   * RPC honors for its block-pinned endpoints. This is the bridge that lets the
   * published SDK drive historical state with no special handling. The client is
   * created once per proxy and reused.
   */
  circles(): CirclesRpc {
    return (this.circlesClient ??= new CirclesRpc(this.info.url));
  }
}
