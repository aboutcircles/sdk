import { TestEnvError } from './types.js';

export interface HttpOptions {
  fetch?: typeof fetch;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export async function httpJson<T>(
  url: string,
  init: RequestInit,
  opts: HttpOptions = {},
): Promise<T> {
  const f = opts.fetch ?? fetch;
  const controller = new AbortController();
  const t = opts.timeoutMs
    ? setTimeout(() => controller.abort(), opts.timeoutMs)
    : null;

  try {
    const res = await f(url, {
      ...init,
      signal: controller.signal,
      headers: {
        // NOTE: `Accept` is intentionally omitted. The test-env's RpcProxyController
        // double-encodes its response when the client sends `Accept: application/json`
        // (it routes through ASP.NET's object formatter instead of returning the raw
        // upstream body). Tracked separately; remove the workaround once fixed.
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...opts.headers,
        ...init.headers,
      },
    });

    const text = await res.text();

    if (!res.ok) {
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        // body stays as text
      }
      throw new TestEnvError(
        `HTTP ${res.status} ${res.statusText} for ${init.method ?? 'GET'} ${url}`,
        res.status,
        body,
      );
    }

    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  } finally {
    if (t) clearTimeout(t);
  }
}
