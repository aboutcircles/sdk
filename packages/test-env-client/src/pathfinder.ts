import { httpJson, type HttpOptions } from './http.js';
import type {
  FindPathRequest,
  FindPathResponse,
  PathfinderInfo,
} from './types.js';

interface PathfinderSnapshot {
  BlockNumber: number;
  Addresses: string[];
  Edges: unknown[];
  [key: string]: unknown;
}

export class PathfinderProxy {
  constructor(
    private readonly info: PathfinderInfo,
    private readonly httpOptions: HttpOptions = {},
  ) {}

  get url(): string {
    return this.info.url;
  }

  get blockNumber(): number {
    return this.info.blockNumber;
  }

  findPath(req: FindPathRequest): Promise<FindPathResponse> {
    const body = {
      ...req,
      targetFlow: typeof req.targetFlow === 'bigint'
        ? req.targetFlow.toString()
        : req.targetFlow,
    };
    return httpJson<FindPathResponse>(
      `${this.info.url}/findPath`,
      { method: 'POST', body: JSON.stringify(body) },
      this.httpOptions,
    );
  }

  /**
   * Maximum flow from source to sink at the pinned block (no path is returned).
   * Mirrors the SDK's findMaxFlow: probe with an effectively unbounded targetFlow
   * and read back the achievable maximum.
   */
  async findMaxFlow(req: Omit<FindPathRequest, 'targetFlow'>): Promise<bigint> {
    const unbounded = 99999999999999999999999999999999999n;
    const res = await this.findPath({ ...req, targetFlow: unbounded });
    return BigInt(res.maxFlow);
  }

  snapshot(): Promise<PathfinderSnapshot> {
    return httpJson<PathfinderSnapshot>(
      `${this.info.url}/snapshot`,
      { method: 'GET' },
      this.httpOptions,
    );
  }
}
