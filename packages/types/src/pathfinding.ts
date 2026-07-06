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
  /**
   * Addresses to treat as having consented to advanced usage (ERC-1155 operator
   * approval). Affects which intermediate transfer paths are considered valid.
   */
  simulatedConsentedAvatars?: Address[];
  maxTransfers?: number;
  /**
   * When true, enforces 96 CRC quantization for sink-bound transfers (invitation
   * module): each sink-bound transfer is exactly N × 96 CRC and the number of invites
   * is derived from `targetFlow` (invites = targetFlow / 96 CRC).
   */
  quantizedMode?: boolean;
  /**
   * When true, the result includes {@link PathfindingResult.debug} with the pipeline
   * transformation stages (raw paths → collapsed → router-inserted → sorted).
   */
  debugShowIntermediateSteps?: boolean;
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
 * Debug pipeline stages, returned only when `debugShowIntermediateSteps` is set.
 * Each stage lists the transfer steps at a point in the transformation pipeline.
 */
export interface PathfindingDebugStages {
  /** Raw solver output, with token-pool intermediary nodes. */
  rawPaths?: TransferStep[];
  /** Token pools collapsed to direct avatar → avatar flows. */
  collapsed?: TransferStep[];
  /** Group mints routed (avatar → router → group). */
  routerInserted?: TransferStep[];
  /** Final on-chain execution order (collateral before mints). */
  sorted?: TransferStep[];
}

/**
 * Result of pathfinding computation
 */
export interface PathfindingResult {
  maxFlow: bigint;
  transfers: TransferStep[];
  /** Pipeline transformation stages; present only when `debugShowIntermediateSteps` was set. */
  debug?: PathfindingDebugStages;
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
