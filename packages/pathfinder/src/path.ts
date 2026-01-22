import type { PathfindingResult, TransferStep, Address, TokenInfo } from '@aboutcircles/sdk-types';
import { CirclesRpc } from '@aboutcircles/sdk-rpc';
import { CirclesConverter } from '@aboutcircles/sdk-utils/circlesConverter';

export async function getTokenInfoMapFromPath(
  currentAvatar: Address,
  rpcUrl: string,
  transferPath: PathfindingResult
): Promise<Map<string, TokenInfo>> {
  const tokenInfoMap = new Map<string, TokenInfo>();
  const uniqueAddresses = new Set<string>();

  transferPath.transfers.forEach((t) => {
    if(currentAvatar.toLowerCase() === t.from.toLowerCase())
      uniqueAddresses.add(t.tokenOwner.toLowerCase());
  });

  const rpc = new CirclesRpc(rpcUrl);
  const batch = await rpc.token.getTokenInfoBatch(
    Array.from(uniqueAddresses) as Address[]
  );

  batch.forEach((info: any) => {
    // @todo temporary fix
    // @dev required to handle wrong returned tokenType from `circles_getTokenInfoBatch`
    if(info.isWrapped && !info.isInflationary){
      info.tokenType = "CrcV2_ERC20WrapperDeployed_Demurraged";
    }

    tokenInfoMap.set(info.tokenAddress.toLowerCase(), info);
  });
  return tokenInfoMap;
}

export function getWrappedTokensFromPath(
  transferPath: PathfindingResult,
  tokenInfoMap: Map<string, TokenInfo>
): Record<string, [bigint, string]> {
  const wrappedTokensInPath: Record<string, [bigint, string]> = {};

  transferPath.transfers.forEach((t) => {
    const info = tokenInfoMap.get(t.tokenOwner.toLowerCase());
    const isWrapper = info && info.tokenType.startsWith('CrcV2_ERC20WrapperDeployed');

    if (isWrapper) {
      if (!wrappedTokensInPath[t.tokenOwner]) {
        wrappedTokensInPath[t.tokenOwner] = [BigInt(0), info!.tokenType];
      }
      wrappedTokensInPath[t.tokenOwner][0] += BigInt(t.value);
    }
  });

  return wrappedTokensInPath;
}

export function getExpectedUnwrappedTokenTotals(
  wrappedTotals: Record<string, [bigint, string]>,
  tokenInfoMap: Map<string, TokenInfo>
): Record<string, [bigint, string]> {
  const unwrapped: Record<string, [bigint, string]> = {};

  Object.entries(wrappedTotals).forEach(([wrapperAddr, [total, type]]) => {
    const info = tokenInfoMap.get(wrapperAddr.toLowerCase());
    if (!info) return;

    if (type === 'CrcV2_ERC20WrapperDeployed_Demurraged') {
      unwrapped[wrapperAddr] = [total, info.tokenOwner];
    }

    if (type === 'CrcV2_ERC20WrapperDeployed_Inflationary') {
      unwrapped[wrapperAddr] = [CirclesConverter.attoStaticCirclesToAttoCircles(total), info.tokenOwner];
    }
  });

  return unwrapped;
}

/**
 * Replace wrapped token addresses with avatar addresses in the path
 * This is used after unwrapping to reflect the actual tokens being transferred
 */
export function replaceWrappedTokensWithAvatars(
  path: PathfindingResult,
  tokenInfoMap: Map<string, TokenInfo>
): PathfindingResult {
  const rewritten: TransferStep[] = path.transfers.map((edge) => {
    // Look up the token info for this tokenOwner
    const tokenInfo = tokenInfoMap.get(edge.tokenOwner.toLowerCase());

    // If we have token info and it's a wrapped token, replace with the underlying avatar
    if (tokenInfo && tokenInfo.tokenType.startsWith('CrcV2_ERC20WrapperDeployed')) {
      return { ...edge, tokenOwner: tokenInfo.tokenOwner as Address };
    }

    // Keep the original tokenOwner if it's not wrapped
    return edge;
  });

  return { ...path, transfers: rewritten };
}

export function replaceWrappedTokens(
  path: PathfindingResult,
  unwrapped: Record<string, [bigint, string]>
): PathfindingResult {
  // Create a mapping from wrapped token addresses to avatar addresses
  // unwrapped format: { wrapperAddress: [amount, avatarAddress] }
  const wrapperToAvatar: Record<string, string> = {};
  Object.entries(unwrapped).forEach(([wrapperAddr, [, avatarAddr]]) => {
    wrapperToAvatar[wrapperAddr.toLowerCase()] = avatarAddr;
  });

  const rewritten: TransferStep[] = path.transfers.map((edge) => {
    // Replace tokenOwner if it's a wrapped token address
    // This changes which token is being transferred (from wrapped to underlying avatar token)
    const tokenOwnerLower = edge.tokenOwner.toLowerCase();
    const tokenOwner = (wrapperToAvatar[tokenOwnerLower] || edge.tokenOwner) as Address;

    // Keep from and to addresses unchanged - they represent the actual flow participants
    return { ...edge, tokenOwner };
  });

  return { ...path, transfers: rewritten };
}

export function shrinkPathValues(
  path: PathfindingResult,
  sink: string,
  retainBps: bigint = BigInt(999_999_999_999)
): PathfindingResult {
  const incomingToSink = new Map<string, bigint>();
  const scaled: TransferStep[] = [];

  const DENOM = BigInt(1_000_000_000_000);

  path.transfers.forEach((edge) => {
    const scaledValue = (BigInt(edge.value) * retainBps) / DENOM;
    const isZero = scaledValue === BigInt(0);
    if (isZero) {
      return; // drop sub‑unit flows
    }

    scaled.push({ ...edge, value: scaledValue });
    incomingToSink.set(edge.to, (incomingToSink.get(edge.to) ?? BigInt(0)) + scaledValue);
  });

  const maxFlow = sink ? incomingToSink.get(sink.toLowerCase()) ?? BigInt(0) : BigInt(0);

  return {
    maxFlow: maxFlow,
    transfers: scaled
  };
}

export function assertNoNettedFlowMismatch(
  path: PathfindingResult,
  overrideSource?: string,
  overrideSink?: string
): void {
  const net = computeNettedFlow(path);
  const { source, sink } = getSourceAndSink(path, overrideSource, overrideSink);

  const endpointsCoincide = source === sink;

  net.forEach((balance, addr) => {
    /* ----------------------------------------------------------------
     * Closed-loop case → every vertex must net to zero
     * -------------------------------------------------------------- */
    if (endpointsCoincide) {
      if (balance !== BigInt(0)) {
        throw new Error(`Vertex ${addr} is unbalanced: ${balance}`);
      }
      return; // done – nothing else to check for this addr
    }

    /* ----------------------------------------------------------------
     * Ordinary DAG case → classic source / sink / intermediate rules
     * -------------------------------------------------------------- */
    const isSource = addr === source;
    const isSink = addr === sink;

    if (isSource && balance >= BigInt(0)) {
      throw new Error(`Source ${addr} should be net negative, got ${balance}`);
    }
    if (isSink && balance <= BigInt(0)) {
      throw new Error(`Sink ${addr} should be net positive, got ${balance}`);
    }
    const isIntermediate = !isSource && !isSink;
    if (isIntermediate && balance !== BigInt(0)) {
      throw new Error(`Vertex ${addr} is unbalanced: ${balance}`);
    }
  });
}

function getSourceAndSink(path: PathfindingResult, overrideSource?: string, overrideSink?: string): {
  source: string;
  sink: string;
} {
  const senders = new Set(path.transfers.map((t) => t.from.toLowerCase()));
  const receivers = new Set(path.transfers.map((t) => t.to.toLowerCase()));

  const source = [...senders].find((a) => !receivers.has(a));
  const sink = [...receivers].find((a) => !senders.has(a));

  if (!(source ?? overrideSource) || !(sink ?? overrideSink)) {
    throw new Error('Could not determine unique source / sink');
  }

  return { source: (source ?? overrideSource)!, sink: (sink ?? overrideSink)! };
}

export function computeNettedFlow(path: PathfindingResult): Map<string, bigint> {
  const net = new Map<string, bigint>();

  path.transfers.forEach(({ from, to, value }) => {
    const amount = BigInt(value);
    net.set(from.toLowerCase(), (net.get(from.toLowerCase()) ?? BigInt(0)) - amount);
    net.set(to.toLowerCase(), (net.get(to.toLowerCase()) ?? BigInt(0)) + amount);
  });

  return net;
}