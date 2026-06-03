import { httpJson, type HttpOptions } from './http.js';
import { JsonRpcError, type JsonRpcResponse } from './types.js';

let nextId = 1;

export async function jsonRpcCall<T = unknown>(
  url: string,
  method: string,
  params: unknown[] = [],
  opts: HttpOptions = {},
): Promise<T> {
  const id = nextId++;
  const res = await httpJson<JsonRpcResponse<T>>(
    url,
    {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    },
    opts,
  );

  if (res.error) {
    throw new JsonRpcError(res.error.message, res.error.code, res.error.data);
  }

  return res.result as T;
}
