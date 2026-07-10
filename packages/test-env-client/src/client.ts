import { httpJson, type HttpOptions } from './http.js';
import { Session } from './session.js';
import type { CreateSessionRequest, SessionResponse } from './types.js';

export interface TestEnvClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export class TestEnvClient {
  readonly baseUrl: string;
  private readonly httpOptions: HttpOptions;

  constructor(opts: TestEnvClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.httpOptions = {
      fetch: opts.fetch,
      timeoutMs: opts.timeoutMs,
      headers: opts.headers,
    };
  }

  async createSession(req: CreateSessionRequest): Promise<Session> {
    // The service expects `ttl` as a duration string ("10m", max "30m"); translate
    // the friendlier `ttlMinutes` here. Without this the field is silently dropped
    // and every session falls back to the 10-minute default.
    const { ttlMinutes, ...rest } = req;
    const body =
      ttlMinutes != null ? { ...rest, ttl: `${ttlMinutes}m` } : rest;
    const raw = await httpJson<SessionResponse>(
      `${this.baseUrl}/api/v1/session`,
      { method: 'POST', body: JSON.stringify(body) },
      this.httpOptions,
    );
    return new Session(raw, this.baseUrl, this.httpOptions);
  }

  async getSession(id: string): Promise<Session> {
    const raw = await httpJson<SessionResponse>(
      `${this.baseUrl}/api/v1/session/${id}`,
      { method: 'GET' },
      this.httpOptions,
    );
    return new Session(raw, this.baseUrl, this.httpOptions);
  }

  async deleteSession(id: string): Promise<void> {
    await httpJson<void>(
      `${this.baseUrl}/api/v1/session/${id}`,
      { method: 'DELETE' },
      this.httpOptions,
    );
  }

  async currentBlock(): Promise<number> {
    const res = await httpJson<{ blockNumber: number }>(
      `${this.baseUrl}/api/v1/blocks/current`,
      { method: 'GET' },
      this.httpOptions,
    );
    return res.blockNumber;
  }

  async health(): Promise<{
    status: string;
    activeSessions: number;
    timestamp: string;
  }> {
    return httpJson(
      `${this.baseUrl}/health`,
      { method: 'GET' },
      this.httpOptions,
    );
  }
}
