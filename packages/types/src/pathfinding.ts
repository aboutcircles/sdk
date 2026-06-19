import type { Address, Hex } from './base.js';

/**
 * Pathfinding types
 */

/**
 * Simulated balance for path finding
 */
export interface SimulatedBalance {
  holder: Address;
  token: Address;
  amount: bigint;
  isWrapped: boolean;
  isStatic: boolean;
}

/**
 * Simulated trust connection for path finding
 */
export interface SimulatedTrust {
  truster: Address;
  trustee: Address;
}

/**
 * Path finding parameters for circlesV2_findPath
 */
export interface FindPathParams {
  from: Address;
  to: Address;
  targetFlow: bigint;
  useWrappedBalances?: boolean;
  fromTokens?: Address[];
  toTokens?: Address[];
  excludeFromTokens?: Address[];
  excludeToTokens?: Address[];
  simulatedBalances?: SimulatedBalance[];
  simulatedTrusts?: SimulatedTrust[];
  maxTransfers?: number;
}

/**
 * Parameters for circles_findScoreGroupRedeemPath.
 *
 * Computes how much of a score group's gCRC `holder` can redeem back into the
 * backing collateral (source == sink == holder, fromToken == the group's gCRC),
 * decomposed per collateral. The result is a {@link PathfindingResult} — the same
 * shape as {@link FindPathParams}'s `findPath` — so it consumes identically.
 *
 * Per collateral the redeemable amount is `MIN(holder entitlement, treasury holding)`.
 * The entitlement is the holder's demurraged gCRC balance, optionally capped by `amount`.
 */
export interface FindScoreGroupRedeemPathParams {
  /** Score group address whose gCRC is being redeemed back into collateral. */
  group: Address;
  /** Holder/redeemer address (acts as both source and sink of the redeem). */
  holder: Address;
  /**
   * Optional uint256 cap (CRC wei) on the gCRC to redeem.
   * Omit to redeem up to the holder's full demurraged balance.
   */
  amount?: bigint;
}

/**
 * A single transfer step in a pathfinding result
 */
export interface TransferStep {
  from: Address;
  to: Address;
  tokenOwner: string;
  value: bigint;
}

/**
 * Result of pathfinding computation
 */
export interface PathfindingResult {
  maxFlow: bigint;
  transfers: TransferStep[];
}

/**
 * Flow edge structure for operateFlowMatrix
 * Corresponds to TypeDefinitions.FlowEdge in the Hub V2 contract
 */
export interface FlowEdgeStruct {
  streamSinkId: number; // uint16
  amount: bigint; // uint192
}

/**
 * Stream structure for operateFlowMatrix
 * Corresponds to TypeDefinitions.Stream in the Hub V2 contract
 */
export interface StreamStruct {
  sourceCoordinate: number; // uint16
  flowEdgeIds: number[]; // uint16[]
  data: Uint8Array | Hex; // bytes
}

/**
 * Flow matrix for ABI encoding
 * Used with the operateFlowMatrix function in Hub V2
 */
export interface FlowMatrix {
  flowVertices: string[]; // address[]
  flowEdges: FlowEdgeStruct[]; // tuple(uint16,uint192)[]
  streams: StreamStruct[]; // tuple(uint16,uint16[],bytes)[]
  packedCoordinates: string; // hex bytes
  sourceCoordinate: number; // convenience, not part of ABI
}

/**
 * Advanced transfer options
 * Extends FindPathParams to add transfer-specific options
 */
export interface AdvancedTransferOptions extends Omit<FindPathParams, 'from' | 'to' | 'targetFlow'> {
  /**
   * Custom data to attach to the transfer (optional)
   */
  txData?: Uint8Array;
}
