import type { RpcClient } from '../client.js';
import type {
  FindPathParams,
  FindScoreGroupRedeemPathParams,
  PathfindingResult,
} from '@aboutcircles/sdk-types';
import {
  normalizeAddress,
  normalizeFindPathParams,
  parseStringsToBigInt,
  checksumAddresses,
} from '../utils.js';
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

  /**
   * Compute the redeem capacity of a score group's gCRC back into its backing collateral.
   *
   * The holder is both source and sink (a self-redeem): the result decomposes how much of the
   * holder's gCRC can be converted into each collateral, clamped per collateral by what the
   * group's on-chain ScoreTreasury actually holds — `MIN(holder entitlement, treasury holding)`.
   *
   * The response is a {@link PathfindingResult} (same shape as {@link findPath}): `transfers`
   * lists one collateral leg (treasury → holder) per allocated collateral and `maxFlow` is the
   * total redeemable gCRC (== the sum of the collateral legs, 1:1). No gCRC burn leg is emitted —
   * `maxFlow` already states how much gCRC to redeem.
   *
   * Note: no on-chain redeem path is deployed yet, so the per-collateral selection order is a
   * server-side placeholder (greedy, largest treasury holding first). The amounts and clamping are
   * final; the executable `from`/`to` legs are finalized once the redeem contract ships.
   *
   * @param params - `group` (gCRC being redeemed), `holder` (redeemer), optional `amount` cap
   * @returns The redeem decomposition with collateral transfers (amounts as bigint)
   *
   * @example
   * ```typescript
   * const redeem = await rpc.pathfinder.findScoreGroupRedeemPath({
   *   group: '0x93ed5a96347927ff6ff6b790f8cf5258240c321f',
   *   holder: '0x665a55a3ab1de41853cf808df40d112824092534',
   *   // amount omitted → redeem up to the holder's full gCRC balance
   * });
   * ```
   */
  async findScoreGroupRedeemPath(
    params: FindScoreGroupRedeemPathParams
  ): Promise<PathfindingResult> {
    // The server binds params positionally: [group, holder, amount?]. Omit the trailing `amount`
    // when undefined so the server applies its default (full balance) — sending null would work
    // too, but an omitted optional is the cleaner wire form.
    const wireParams: string[] = [
      normalizeAddress(params.group),
      normalizeAddress(params.holder),
    ];
    if (params.amount !== undefined) {
      wireParams.push(params.amount.toString());
    }

    const result = await this.client.call<string[], Record<string, unknown>>(
      'circles_findScoreGroupRedeemPath',
      wireParams
    );

    const parsed = parseStringsToBigInt(result) as unknown as PathfindingResult;
    return checksumAddresses(parsed);
  }
}
