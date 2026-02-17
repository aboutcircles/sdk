import type { Address, AdvancedTransferOptions, PathfindingResult } from '@aboutcircles/sdk-types';
import type { Core } from '@aboutcircles/sdk-core';
import {
  createFlowMatrix as createFlowMatrixUtil,
  getTokenInfoMapFromPath,
  getWrappedTokensFromPath,
  replaceWrappedTokensWithAvatars,
} from '@aboutcircles/sdk-pathfinder';
import { CirclesRpc } from '@aboutcircles/sdk-rpc';
import { bytesToHex, CirclesConverter, encodeFunctionData, ZERO_ADDRESS } from '@aboutcircles/sdk-utils';
import { InflationaryCirclesContract, DemurrageCirclesContract, CirclesType } from '@aboutcircles/sdk-core';
import { TransferError } from './errors';

/**
 * TransferBuilder constructs transfer transactions without executing them
 * Handles pathfinding, wrapped token unwrapping/wrapping, and flow matrix construction
 */
export class TransferBuilder {
  private core: Core;
  private rpc: CirclesRpc;

  constructor(core: Core) {
    this.core = core;
    this.rpc = new CirclesRpc(core.config.circlesRpcUrl);
  }

  /**
   * Construct an advanced transfer transaction
   * Returns the list of transactions to execute without executing them
   *
   * @param from Sender address
   * @param to Recipient address
   * @param amount Amount to transfer (in atto-circles)
   * @param options Advanced transfer options
   * @returns Array of transactions to execute in order
   */
  async constructAdvancedTransfer(
    from: Address,
    to: Address,
    amount: number | bigint,
    options?: AdvancedTransferOptions
  ): Promise<Array<{ to: Address; data: `0x${string}`; value: bigint }>> {
    // Normalize addresses
    const fromAddr = from.toLowerCase() as Address;
    const toAddr = to.toLowerCase() as Address;
    const amountBigInt = BigInt(amount);

    // @todo move logic to separate function
    // Optimization: Check if this is a self-transfer unwrap operation
    // If sender == recipient and we have exactly one fromToken and one toToken,
    // we can check if it's an unwrap operation and skip pathfinding
    if (
      fromAddr === toAddr &&
      options?.fromTokens?.length === 1 &&
      options?.toTokens?.length === 1
    ) {
      const fromTokenAddr = options.fromTokens[0];
      const toTokenAddr = options.toTokens[0];

      // Use lift contract to check if fromToken is a wrapper and determine its type
      const [demurragedWrapper, inflationaryWrapper] = await Promise.all([
        this.core.liftERC20.erc20Circles(CirclesType.Demurrage, toTokenAddr),
        this.core.liftERC20.erc20Circles(CirclesType.Inflation, toTokenAddr)
      ]);

      // Check if fromToken is a demurraged wrapper for the toToken avatar
      if (fromTokenAddr.toLowerCase() === demurragedWrapper.toLowerCase() &&
          demurragedWrapper !== ZERO_ADDRESS) {
        // Use demurraged wrapper contract to unwrap
        const wrapper = new DemurrageCirclesContract({
          address: fromTokenAddr,
          rpcUrl: this.core.config.circlesRpcUrl
        });
        const unwrapTx = wrapper.unwrap(amountBigInt);
        return [{
          to: unwrapTx.to as Address,
          data: unwrapTx.data as `0x${string}`,
          value: unwrapTx.value ?? 0n
        }];
      }

      // Check if fromToken is an inflationary wrapper for the toToken avatar
      if (fromTokenAddr.toLowerCase() === inflationaryWrapper.toLowerCase() &&
          inflationaryWrapper !== ZERO_ADDRESS) {
        // Use inflationary wrapper contract to unwrap
        const wrapper = new InflationaryCirclesContract({
          address: fromTokenAddr,
          rpcUrl: this.core.config.circlesRpcUrl
        });
        // Convert demurraged amount to static atto circles for inflationary unwrap
        const unwrapAmount = CirclesConverter.attoCirclesToAttoStaticCircles(amountBigInt);
        const unwrapTx = wrapper.unwrap(unwrapAmount);
        return [{
          to: unwrapTx.to as Address,
          data: unwrapTx.data as `0x${string}`,
          value: unwrapTx.value ?? 0n
        }];
      }
    }
    // Truncate to 6 decimals for precision
    const truncatedAmount = this._truncateToSixDecimals(amountBigInt);

    // Get default token exclude list if sending to a group mint handler
    const completeExcludeFromTokens = await this._getDefaultTokenExcludeList(
      toAddr,
      options?.excludeFromTokens
    );

    // Update options with complete exclude list
    const pathfindingOptions = {
      ...options,
      ...(completeExcludeFromTokens ? { excludeFromTokens: completeExcludeFromTokens } : {}),
    };

    let path = await this.rpc.pathfinder.findPath({
      from: fromAddr,
      to: toAddr,
      targetFlow: truncatedAmount,
      ...pathfindingOptions,
    });

    // Check if path is valid
    if (!path.transfers || path.transfers.length === 0) {
      throw TransferError.noPathFound(fromAddr, toAddr);
    }

    // Check if pathfinder found enough tokens for the requested amount
    if (path.maxFlow < truncatedAmount) {
      throw TransferError.insufficientBalance(truncatedAmount, path.maxFlow, fromAddr, toAddr);
    }
    // Get token info for all tokens in the path using pathfinder utility
    // @dev returning a Map<string, TokenInfo>
    const tokenInfoMap = await getTokenInfoMapFromPath(fromAddr, this.core.config.circlesRpcUrl, path);

    // Get wrapped tokens found in the path with their amounts and types
    // @dev returning a Record<string (wrapperAddress), [bigint (amount used in path), string (type)]>
    const wrappedTokensInPath = getWrappedTokensFromPath(path, tokenInfoMap);
    // @todo maybe there is an easier way to check if there are wrapped tokens

    const hasWrappedTokens = Object.keys(wrappedTokensInPath).length > 0;

    // Validate that wrapped tokens are enabled if they're needed
    if (hasWrappedTokens && !options?.useWrappedBalances) {
      throw TransferError.wrappedTokensRequired();
    }

    let unwrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];
    let wrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];

    if (hasWrappedTokens) {
      // Fetch token balances once for both unwrap and wrap operations
      const balanceMap = await this._getTokenBalanceMap(fromAddr);

      // Create unwrap calls for demurraged tokens (unwrap exact amount used in path)
      const demurragedUnwrapCalls = this._createDemurragedUnwrapCalls(wrappedTokensInPath);

      // Create unwrap and wrap calls for inflationary tokens
      // Unwrap entire balance, then wrap back leftovers after transfer
      const { unwrapCalls: inflationaryUnwrapCalls, wrapCalls: inflationaryWrapCalls } =
        this._createInflationaryUnwrapAndWrapCalls(wrappedTokensInPath, tokenInfoMap, balanceMap);

      // Combine all unwrap calls
      unwrapCalls = [...demurragedUnwrapCalls, ...inflationaryUnwrapCalls];
      wrapCalls = inflationaryWrapCalls;

      // Replace wrapped token addresses with avatar addresses in the path
      path = replaceWrappedTokensWithAvatars(path, tokenInfoMap);
    }

    // Create flow matrix from the (possibly rewritten) path
    const flowMatrix = createFlowMatrixUtil(fromAddr, toAddr, path.maxFlow, path.transfers);

    // If txData is provided, attach it to the streams
    if (options?.txData && flowMatrix.streams.length > 0) {
      flowMatrix.streams[0].data = options.txData;
    }

    // Convert Uint8Array data to hex strings for ABI encoding
    const streamsWithHexData = flowMatrix.streams.map((stream) => ({
      sourceCoordinate: stream.sourceCoordinate,
      flowEdgeIds: stream.flowEdgeIds,
      data: stream.data instanceof Uint8Array ? bytesToHex(stream.data) as `0x${string}` : stream.data as `0x${string}`,
    }));

    // Create the operateFlowMatrix transaction
    const operateFlowMatrixTx = this.core.hubV2.operateFlowMatrix(
      flowMatrix.flowVertices as readonly Address[],
      flowMatrix.flowEdges,
      streamsWithHexData,
      flowMatrix.packedCoordinates as `0x${string}`
    );

    // Check if self-approval is needed
    // If the check fails (e.g., network error), we'll include the approval anyway to be safe
    let isApproved = false;
    try {
      isApproved = await this.core.hubV2.isApprovedForAll(fromAddr, fromAddr);
    } catch (error) {
      // If checking approval fails, assume not approved and include the approval transaction
      console.warn('Failed to check approval status, including approval transaction:', error);
    }

    // Assemble all transactions in strict order:
    // 1. Self-approval (only if not already approved)
    // 2. All unwraps
    // 3. operateFlowMatrix
    // 4. All wraps (for leftover inflationary tokens)
    const allTransactions = [
      ...(isApproved ? [] : [this.core.hubV2.setApprovalForAll(fromAddr, true)]),
      ...unwrapCalls,
      operateFlowMatrixTx,
      ...wrapCalls,
    ];

    return allTransactions as Array<{ to: Address; data: `0x${string}`; value: bigint }>;
  }

  /**
   * Construct a replenish transaction to convert wrapped/other tokens into unwrapped personal CRC
   * This uses pathfinder to find the best way to convert available tokens (including wrapped tokens)
   * into the sender's own unwrapped ERC1155 personal CRC tokens
   *
   * @param avatarAddress The avatar address to replenish (convert tokens to their personal CRC)
   * @param options Optional pathfinding options
   * @returns Array of transactions to execute in order to perform the replenish
   */
  async constructReplenish(
    avatarAddress: Address,
    options?: Omit<AdvancedTransferOptions, 'txData'>
  ): Promise<Array<{ to: Address; data: `0x${string}`; value: bigint }>> {
    // @todo Implement replenish functionality
    // This should:
    // 1. Find maximum flow from avatar to itself targeting personal tokens
    // 2. Handle wrapped token unwrapping similar to constructAdvancedTransfer
    // 3. Create flow matrix for self-transfer
    // 4. Handle wrap calls for leftover inflationary tokens

    throw new Error('constructReplenish is not yet implemented. Please use constructAdvancedTransfer with same from/to address as a workaround.');
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Fetches token balances and creates a map for quick lookup
   *
   * @param from Source avatar address
   * @returns Map of token address to balance (in static units)
   */
  private async _getTokenBalanceMap(from: Address): Promise<Map<string, bigint>> {
    const allBalances = await this.rpc.balance.getTokenBalances(from);
    const balanceMap = new Map<string, bigint>();
    // @todo remove any
    allBalances.forEach((balance: any) => {
      balanceMap.set(balance.tokenAddress.toLowerCase(), balance.staticAttoCircles);
    });
    return balanceMap;
  }

  /**
   * Creates unwrap transaction calls for demurraged ERC20 wrapped tokens
   * Unwraps only the exact amount used in the path
   *
   * @param wrappedTokensInPath Map of wrapped token addresses to [amount used in path, type]
   * @returns Array of unwrap transaction calls for demurraged tokens
   */
  private _createDemurragedUnwrapCalls(
    wrappedTokensInPath: Record<string, [bigint, string]>
  ): Array<{ to: Address; data: `0x${string}`; value: bigint }> {
    const unwrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];

    for (const [wrapperAddr, [amountUsedInPath, type]] of Object.entries(wrappedTokensInPath)) {
      // Only process demurraged wrappers
      if (type !== 'CrcV2_ERC20WrapperDeployed_Demurraged') {
        continue;
      }

      // Create unwrap call for the exact amount used in path
      const data = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'unwrap',
          inputs: [{ name: '_amount', type: 'uint256' }],
          outputs: [],
          stateMutability: 'nonpayable',
        }],
        functionName: 'unwrap',
        args: [amountUsedInPath],
      });

      unwrapCalls.push({
        to: wrapperAddr as Address,
        data,
        value: 0n,
      });
    }

    return unwrapCalls;
  }

  /**
   * Creates unwrap and wrap transaction calls for inflationary ERC20 wrapped tokens
   * Unwraps the entire balance, then wraps back leftover tokens after transfer
   *
   * @param wrappedTokensInPath Map of wrapped token addresses to [amount used in path, type]
   * @param tokenInfoMap Map of token addresses to TokenInfo
   * @param balanceMap Map of token address to balance
   * @returns Object containing unwrap and wrap transaction calls for inflationary tokens
   */
  private _createInflationaryUnwrapAndWrapCalls(
    wrappedTokensInPath: Record<string, [bigint, string]>,
    tokenInfoMap: Map<string, any>,
    balanceMap: Map<string, bigint>
  ): {
    unwrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }>;
    wrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }>;
  } {
    const unwrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];
    const wrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];

    for (const [wrapperAddr, [amountUsedInPath, type]] of Object.entries(wrappedTokensInPath)) {
      // Only process inflationary wrappers
      if (type !== 'CrcV2_ERC20WrapperDeployed_Inflationary') {
        continue;
      }

      const tokenInfo = tokenInfoMap.get(wrapperAddr.toLowerCase());
      const currentBalance = balanceMap.get(wrapperAddr.toLowerCase()) || 0n;

      if (currentBalance === 0n) {
        continue;
      }

      // Create unwrap call for the entire balance (in static units)
      const unwrapData = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'unwrap',
          inputs: [{ name: '_amount', type: 'uint256' }],
          outputs: [],
          stateMutability: 'nonpayable',
        }],
        functionName: 'unwrap',
        args: [currentBalance],
      });

      unwrapCalls.push({
        to: wrapperAddr as Address,
        data: unwrapData,
        value: 0n,
      });

      // Calculate leftover amount: balance before unwrap (converted to demurraged) - amount used in path
      const tokenOwner = tokenInfo?.tokenOwner as Address;
      const leftoverAmount = CirclesConverter.attoStaticCirclesToAttoCircles(currentBalance) - amountUsedInPath;

      // Only create wrap call if there's leftover amount
      if (leftoverAmount > 0n) {
        // Create wrap call using hubV2 contract
        const wrapTx = this.core.hubV2.wrap(
          tokenOwner,
          leftoverAmount,
          CirclesType.Inflation // 1 = Inflationary
        );

        wrapCalls.push({
          to: wrapTx.to as Address,
          data: wrapTx.data as `0x${string}`,
          value: wrapTx.value ?? 0n,
        });
      }
    }

    return { unwrapCalls, wrapCalls };
  }

  /**
   * Helper method to truncate amount to 6 decimals
   */
  private _truncateToSixDecimals(amount: bigint): bigint {
    const oneMillion = BigInt(1_000_000);
    const oneEth = BigInt(10) ** BigInt(18);
    return (amount / (oneEth / oneMillion)) * (oneEth / oneMillion);
  }

  /**
   * Get default token exclusion list for transfers to group mint handlers
   * If the recipient is a group mint handler, exclude the group token and its wrappers
   *
   * @param to Recipient address
   * @param excludeFromTokens Existing token exclusion list
   * @returns Complete token exclusion list, or undefined if empty
   */
  private async _getDefaultTokenExcludeList(
    to: Address,
    excludeFromTokens?: Address[]
  ): Promise<Address[] | undefined> {
    // Check if recipient is a group mint handler
    const groups = await this.rpc.group.findGroups(1, {
      mintHandlerEquals: to,
    });

    const completeExcludeFromTokenList = new Set<Address>();

    // If recipient is a group mint handler, exclude the group's tokens
    if (groups.results.length > 0) {
      const groupInfo = groups.results[0];
      completeExcludeFromTokenList.add(groupInfo.group.toLowerCase() as Address);

      if (groupInfo.erc20WrapperDemurraged) {
        completeExcludeFromTokenList.add(groupInfo.erc20WrapperDemurraged.toLowerCase() as Address);
      }

      if (groupInfo.erc20WrapperStatic) {
        completeExcludeFromTokenList.add(groupInfo.erc20WrapperStatic.toLowerCase() as Address);
      }
    }

    // Add any user-provided exclusions
    excludeFromTokens?.forEach((token) =>
      completeExcludeFromTokenList.add(token.toLowerCase() as Address)
    );

    if (completeExcludeFromTokenList.size === 0) {
      return undefined;
    }

    return Array.from(completeExcludeFromTokenList);
  }
}
