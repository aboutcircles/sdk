import type { RpcClient } from '../client';
import type { FindPathParams, PathfindingResult } from '@aboutcircles/sdk-types';
import { normalizeFindPathParams, parseStringsToBigInt, checksumAddresses } from '../utils';
import { MAX_FLOW } from '@aboutcircles/sdk-utils/constants';

/**
 * Circles V1 and V2 balance and pathfinding methods
 */
export class PathfinderMethods {
  constructor(private client: RpcClient) {}

  /**
   * Calculate a path between two addresses with a target flow
   *
   * @param params - Path finding parameters
   * @returns The computed path with transfers (amounts as bigint)
   *
   * @example
   * ```typescript
   * const path = await rpc.pathfinder.findPath({
   *   from: '0x749c930256b47049cb65adcd7c25e72d5de44b3b',
   *   to: '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   targetFlow: 99999999999999999999999999999999999n
   * });
   * ```
   */
  async findPath(params: FindPathParams): Promise<PathfindingResult> {
    const normalizedParams = normalizeFindPathParams(params);

    const result = await this.client.call<[Record<string, unknown>], Record<string, unknown>>(
      'circlesV2_findPath',
      [normalizedParams]
    );

    const parsed = parseStringsToBigInt(result) as unknown as PathfindingResult;
    return checksumAddresses(parsed);
  }

  /**
   * Find the maximum flow between two addresses
   *
   * @param params - Path finding parameters (without targetFlow)
   * @returns The maximum flow as bigint
   *
   * @example
   * ```typescript
   * const maxFlow = await rpc.pathfinder.findMaxFlow({
   *   from: '0x749c930256b47049cb65adcd7c25e72d5de44b3b',
   *   to: '0xde374ece6fa50e781e81aac78e811b33d16912c7'
   * });
   * ```
   */
  async findMaxFlow(params: Omit<FindPathParams, 'targetFlow'>): Promise<bigint> {
    const path = await this.findPath({
      ...params,
      targetFlow: MAX_FLOW
    });
    return BigInt(path.maxFlow);
  }
}
