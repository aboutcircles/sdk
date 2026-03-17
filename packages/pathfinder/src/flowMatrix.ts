import type { FlowMatrix, TransferStep, Address, FlowEdgeStruct, StreamStruct, Hex } from '@aboutcircles/sdk-types';
import { packCoordinates, transformToFlowVertices } from './packing';
import { bytesToHex } from '@aboutcircles/sdk-utils/bytes';

/**
 * Detect terminal edges using graph analysis
 *
 * Terminal edge detection algorithm:
 * 1. Identify all edges that deliver value to the receiver
 * 2. Check if there's a self-loop at the receiver (aggregate pattern)
 * 3. If self-loop exists: it's the ONLY terminal edge (aggregates all incoming flows)
 * 4. If no self-loop: all edges TO receiver are terminal (standard multi-path flow)
 *
 * This handles:
 * - Aggregate mode: receiver collects tokens, then self-transfers to consolidate
 * - Standard mode: multiple paths deliver directly to receiver
 * - Mixed scenarios: correctly identifies final delivery point
 */
function detectTerminalEdges(
  transfers: TransferStep[],
  receiver: string
): Set<number> {
  const terminalEdges = new Set<number>();

  // Build adjacency info: track edges TO receiver and self-loops
  const edgesToReceiver: number[] = [];
  let selfLoopIndex: number | null = null;

  transfers.forEach((t, index) => {
    const fromLower = t.from.toLowerCase();
    const toLower = t.to.toLowerCase();

    // Check if this is a self-loop at the receiver
    if (fromLower === receiver && toLower === receiver) {
      selfLoopIndex = index;
    }
    // Check if this edge delivers to receiver
    else if (toLower === receiver) {
      edgesToReceiver.push(index);
    }
  });

  // Decision logic:
  // If self-loop exists, it's the aggregation edge (ONLY terminal)
  // Otherwise, all edges delivering to receiver are terminal
  if (selfLoopIndex !== null) {
    terminalEdges.add(selfLoopIndex);
  } else {
    edgesToReceiver.forEach(idx => terminalEdges.add(idx));
  }

  return terminalEdges;
}

/**
 * Create an ABI‑ready FlowMatrix object from a list of TransferSteps.
 *
 * @param from - Sender address
 * @param to - Receiver address
 * @param value - Total value to transfer
 * @param transfers - List of transfer steps
 */
export function createFlowMatrix(
  from: Address,
  to: Address,
  value: bigint,
  transfers: TransferStep[],
): FlowMatrix {
  const sender = from.toLowerCase();
  const receiver = to.toLowerCase();

  const { sorted: flowVertices, idx } = transformToFlowVertices(
    transfers,
    sender,
    receiver
  );

  // Use graph analysis to detect terminal edges
  const terminalEdgeIndices = detectTerminalEdges(transfers, receiver);

  const flowEdges: FlowEdgeStruct[] = transfers.map((t, index) => {
    const isTerminal = terminalEdgeIndices.has(index);

    return {
      streamSinkId: isTerminal ? 1 : 0,
      amount: t.value
    };
  });

  // Validation: ensure at least one terminal edge exists
  if (terminalEdgeIndices.size === 0) {
    throw new Error(
      `No terminal edges detected. Flow must have at least one edge delivering to receiver ${receiver}`
    );
  }

  const termEdgeIds = Array.from(terminalEdgeIndices);

  const streams: StreamStruct[] = [
    {
      sourceCoordinate: idx[sender],
      flowEdgeIds: termEdgeIds,
      data: new Uint8Array(0)
    }
  ];

  const coords: number[] = [];
  transfers.forEach((t) => {
    coords.push(idx[t.tokenOwner.toLowerCase()]);
    coords.push(idx[t.from.toLowerCase()]);
    coords.push(idx[t.to.toLowerCase()]);
  });

  const packedCoordinates = packCoordinates(coords);

  const expected = BigInt(value);
  const terminalSum = flowEdges
    .filter((e) => e.streamSinkId === 1)
    .reduce((sum, e) => sum + BigInt(e.amount.toString()), BigInt(0));

  const isBalanced = terminalSum === expected;
  if (!isBalanced) {
    throw new Error(`Terminal sum ${terminalSum} does not equal expected ${expected}`);
  }

  return {
    flowVertices,
    flowEdges,
    streams,
    packedCoordinates,
    sourceCoordinate: idx[sender]
  };
}

/**
 * Prepare flow matrix streams with hex-encoded data for ABI encoding
 * Converts Uint8Array data to hex strings and adds optional txData to the first stream
 *
 * @param flowMatrix - The flow matrix to prepare
 * @param txData - Optional transaction data to attach to the first stream
 * @returns Array of streams with hex-encoded data ready for contract calls
 */
export function prepareFlowMatrixStreams(
  flowMatrix: FlowMatrix,
  txData?: Hex | Uint8Array
): Array<{ sourceCoordinate: number; flowEdgeIds: readonly number[]; data: Hex }> {
  const streams = flowMatrix.streams.map((stream) => ({
    sourceCoordinate: stream.sourceCoordinate,
    flowEdgeIds: stream.flowEdgeIds,
    data: stream.data instanceof Uint8Array
      ? bytesToHex(stream.data) as Hex
      : stream.data as Hex,
  }));

  // Attach txData to the first stream if provided
  if (txData && streams.length > 0) {
    streams[0].data = txData instanceof Uint8Array
      ? bytesToHex(txData) as Hex
      : txData as Hex;
  }

  return streams;
}