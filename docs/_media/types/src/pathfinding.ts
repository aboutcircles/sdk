import type { Address, Hex } from './base';

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
