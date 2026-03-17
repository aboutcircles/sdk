import type { Address, AdvancedTransferOptions, PathfindingResult, CirclesConfig } from '@aboutcircles/sdk-types';
import {
  createFlowMatrix as createFlowMatrixUtil,
  prepareFlowMatrixStreams,
  getTokenInfoMapFromPath,
  getWrappedTokensFromPath,
  replaceWrappedTokensWithAvatars,
} from '@aboutcircles/sdk-pathfinder';
import { RpcClient, PathfinderMethods, BalanceMethods, GroupMethods } from '@aboutcircles/sdk-rpc';
import { CirclesConverter } from '@aboutcircles/sdk-utils/circlesConverter';
import { ZERO_ADDRESS } from '@aboutcircles/sdk-utils/constants';
import {
  HubV2ContractMinimal,
  LiftERC20ContractMinimal,
  DemurrageCirclesContractMinimal,
  InflationaryCirclesContractMinimal,
} from '@aboutcircles/sdk-core/minimal';
import { CirclesType } from '@aboutcircles/sdk-types';
import { TransferError } from './errors';

/**
 * TransferBuilder constructs transfer transactions without executing them
 * Handles pathfinding, wrapped token unwrapping/wrapping, and flow matrix construction
 */
export class TransferBuilder {
  private config: CirclesConfig;
  private hubV2: HubV2ContractMinimal;
  private liftERC20: LiftERC20ContractMinimal;
  private rpcClient: RpcClient;
  private pathfinder: PathfinderMethods;
  private balance: BalanceMethods;
  private group: GroupMethods;

  constructor(config: CirclesConfig) {
    this.config = config;
    this.hubV2 = new HubV2ContractMinimal({
      address: config.v2HubAddress,
      rpcUrl: config.circlesRpcUrl,
    });
    this.liftERC20 = new LiftERC20ContractMinimal({
      address: config.liftERC20Address,
      rpcUrl: config.circlesRpcUrl,
    });
    this.rpcClient = new RpcClient(config.circlesRpcUrl);
    this.pathfinder = new PathfinderMethods(this.rpcClient);
    this.balance = new BalanceMethods(this.rpcClient);
    this.group = new GroupMethods(this.rpcClient);
  }

  /**
   * Build flow matrix transaction from a pre-computed path
   * This is a lower-level function useful when you already have a path and want to build transactions
   *
   * @param from Sender address
   * @param to Recipient address
   * @param path Pathfinding result with transfers
   * @param options Advanced transfer options
   * @param aggregate Whether to aggregate tokens at destination
   * @returns Array of transactions to execute in order
   */
  async buildFlowMatrixTx(
    from: Address,
    to: Address,
    path: PathfindingResult,
    options?: AdvancedTransferOptions,
    aggregate: boolean = false
  ): Promise<Array<{ to: Address; data: `0x${string}`; value: bigint }>> {
    const fromAddr = from.toLowerCase() as Address;
    const toAddr = to.toLowerCase() as Address;

    // Validate path
    if (!path.transfers || path.transfers.length === 0) {
      throw TransferError.noPathFound(fromAddr, toAddr);
    }

    let workingPath = { ...path };

    // If aggregate flag is set and toTokens has exactly one element,
    // add an aggregation transfer step from recipient to themselves.
    if (aggregate && options?.toTokens?.length === 1) {
      const aggregateToken = options.toTokens[0].toLowerCase() as Address;

      if (path.maxFlow > 0n) {
        // Add a self-transfer to aggregate all tokens into the single token type
        workingPath.transfers.push({
          from: toAddr,
          to: toAddr,
          tokenOwner: aggregateToken,
          value: path.maxFlow
        });
      }
    }

    // Get token info for all tokens in the path using pathfinder utility
    const tokenInfoMap = await getTokenInfoMapFromPath(fromAddr, this.config.circlesRpcUrl, workingPath);

    // Get wrapped tokens found in the path with their amounts and types
    const wrappedTokensInPath = getWrappedTokensFromPath(workingPath, tokenInfoMap);
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
      const { unwrapCalls: inflationaryUnwrapCalls, wrapCalls: inflationaryWrapCalls } =
        this._createInflationaryUnwrapAndWrapCalls(wrappedTokensInPath, tokenInfoMap, balanceMap);

      // Combine all unwrap calls
      unwrapCalls = [...demurragedUnwrapCalls, ...inflationaryUnwrapCalls];
      wrapCalls = inflationaryWrapCalls;

      // Replace wrapped token addresses with avatar addresses in the path
      workingPath = replaceWrappedTokensWithAvatars(workingPath, tokenInfoMap);
    }

    // Create flow matrix from the (possibly rewritten) path
    const flowMatrix = createFlowMatrixUtil(fromAddr, toAddr, workingPath.maxFlow, workingPath.transfers);

    // Prepare streams with hex-encoded data and optional txData
    const streamsWithHexData = prepareFlowMatrixStreams(flowMatrix, options?.txData);

    // Create the operateFlowMatrix transaction
    const operateFlowMatrixTx = this.hubV2.operateFlowMatrix(
      flowMatrix.flowVertices as readonly Address[],
      flowMatrix.flowEdges,
      streamsWithHexData,
      flowMatrix.packedCoordinates as `0x${string}`
    );

    // Check if self-approval is needed
    let isApproved = false;
    try {
      isApproved = await this.hubV2.isApprovedForAll(fromAddr, fromAddr);
    } catch (error) {
      console.warn('Failed to check approval status, including approval transaction:', error);
    }

    // Assemble all transactions in strict order:
    // 1. Self-approval (only if not already approved)
    // 2. All unwraps
    // 3. operateFlowMatrix
    // 4. All wraps (for leftover inflationary tokens)
    const allTransactions = [
      ...(isApproved ? [] : [this.hubV2.setApprovalForAll(fromAddr, true)]),
      ...unwrapCalls,
      operateFlowMatrixTx,
      ...wrapCalls,
    ];

    return allTransactions as Array<{ to: Address; data: `0x${string}`; value: bigint }>;
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
    options?: AdvancedTransferOptions,
    aggregate: boolean = false
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
        this.liftERC20.erc20Circles(CirclesType.Demurrage, toTokenAddr),
        this.liftERC20.erc20Circles(CirclesType.Inflation, toTokenAddr)
      ]);

      // Check if fromToken is a demurraged wrapper for the toToken avatar
      if (fromTokenAddr.toLowerCase() === demurragedWrapper.toLowerCase() &&
          demurragedWrapper !== ZERO_ADDRESS) {
        // Use demurraged wrapper contract to unwrap
        const wrapper = new DemurrageCirclesContractMinimal({
          address: fromTokenAddr,
          rpcUrl: this.config.circlesRpcUrl
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
        const wrapper = new InflationaryCirclesContractMinimal({
          address: fromTokenAddr,
          rpcUrl: this.config.circlesRpcUrl
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

    // Update options with complete exclude list, but exclude the 'aggregate' flag
    // as it should only be used at the constructAdvancedTransfer level
    const { ...pathfindingOptionsBase } = options || {};
    const pathfindingOptions = {
      ...pathfindingOptionsBase,
      ...(completeExcludeFromTokens ? { excludeFromTokens: completeExcludeFromTokens } : {}),
    };

    let path = await this.pathfinder.findPath({
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

    // Use the buildFlowMatrixTx helper to construct transactions from the path
    return this.buildFlowMatrixTx(fromAddr, toAddr, path, options, aggregate);
  }

  /**
   * Construct a replenish transaction to acquire a specific token in unwrapped form
   *
   * This function tops up your unwrapped balance to reach the target amount (not adding on top).
   *
   * Process:
   * 1. Checks current balance of the target token (unwrapped and wrapped)
   * 2. If sufficient wrapped tokens exist, unwraps only what's needed
   * 3. If insufficient, uses pathfinding with trust simulation to acquire tokens
   * 4. Temporarily trusts the token owner if needed for the transfer
   * 5. Untrusts after the transfer completes
   *
   * Note on Precision:
   * - Pathfinding uses 6-decimal precision (last 12 decimals are truncated)
   * - The function rounds UP to the next 6-decimal boundary to ensure you get at least the target
   * - Final balance will be AT or SLIGHTLY ABOVE target (e.g., 1900.000001 instead of exactly 1900.000000)
   * - The excess is always less than 0.000001 CRC and ensures you never fall short of the target
   *
   * @param from The account address that needs tokens
   * @param tokenId The token ID to replenish (avatar address whose tokens we want)
   * @param amount Target unwrapped balance in atto-circles (will top up to this amount)
   * @param receiver Optional receiver address (defaults to 'from')
   * @returns Array of transactions to execute in order
   *
   * @example
   * ```typescript
   * // If you have 100 CRC unwrapped and call replenish(1000 CRC),
   * // it will acquire 900 CRC to reach a total of 1000 CRC
   * const txs = await transferBuilder.constructReplenish(
   *   myAddress,
   *   tokenAddress,
   *   1000n * 10n**18n // 1000 CRC
   * );
   * ```
   */
  // @todo review the impleementation
  async constructReplenish(
    from: Address,
    tokenId: Address,
    amount: bigint,
    receiver?: Address
  ): Promise<Array<{ to: Address; data: `0x${string}`; value: bigint }>> {

    const fromAddr = from.toLowerCase() as Address;
    const tokenIdAddr = tokenId.toLowerCase() as Address;
    const receiverAddr = (receiver || from).toLowerCase() as Address;
    const amountBigInt = BigInt(amount);

    // Step 1: Check current balances (unwrapped + wrapped)
    const balances = await this.balance.getTokenBalances(fromAddr);

    // Filter balances for the target token
    const targetTokenBalances = balances.filter(
      b => b.tokenOwner.toLowerCase() === tokenIdAddr
    );

    let unwrappedBalance = 0n;
    let wrappedDemurrageBalance = 0n;
    let wrappedInflationaryBalance = 0n;
    let wrappedDemurrageAddress: Address | null = null;
    let wrappedInflationaryAddress: Address | null = null;

    for (const balance of targetTokenBalances) {
      if (balance.isWrapped) {
        const isDemurrage = balance.tokenType.includes('Demurrage');
        if (isDemurrage) {
          wrappedDemurrageBalance = BigInt(balance.attoCircles);
          wrappedDemurrageAddress = balance.tokenAddress as Address;
        } else {
          // For inflationary, use staticAttoCircles to get actual balance
          wrappedInflationaryBalance = BigInt(balance.staticAttoCircles);
          wrappedInflationaryAddress = balance.tokenAddress as Address;
        }
      } else {
        unwrappedBalance = BigInt(balance.attoCircles);
      }
    }

    const totalAvailable = unwrappedBalance + wrappedDemurrageBalance +
                          CirclesConverter.attoStaticCirclesToAttoCircles(wrappedInflationaryBalance);

    const transactions: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];

    // Step 2: If we already have enough in unwrapped form, we're done
    if (unwrappedBalance >= amountBigInt) {
      console.log(`✓ Already have ${Number(unwrappedBalance) / 1e18} CRC unwrapped (target: ${Number(amountBigInt) / 1e18} CRC). No replenish needed.`);

      // If receiver is different from sender, create transfer transaction
      if (receiverAddr !== fromAddr) {
        const tokenIdBigInt = await this.hubV2.toTokenId(tokenIdAddr);
        const transferTx = this.hubV2.safeTransferFrom(
          fromAddr,
          receiverAddr,
          tokenIdBigInt,
          amountBigInt
        );
        transactions.push({
          to: transferTx.to as Address,
          data: transferTx.data as `0x${string}`,
          value: transferTx.value ?? 0n
        });
      }
      return transactions;
    }

    // Step 3: Calculate deficit (how much more we need to reach the target)
    const deficit = amountBigInt - unwrappedBalance;

    console.log(`Current unwrapped: ${Number(unwrappedBalance) / 1e18} CRC`);
    console.log(`Target amount: ${Number(amountBigInt) / 1e18} CRC`);
    console.log(`Need to acquire: ${Number(deficit) / 1e18} CRC`);

    // Step 4: Try to unwrap if we have enough wrapped tokens
    if (totalAvailable >= amountBigInt) {
      let remainingToUnwrap = deficit;

      // Unwrap demurrage first (exact amount)
      if (wrappedDemurrageBalance > 0n && wrappedDemurrageAddress && remainingToUnwrap > 0n) {
        const toUnwrap = remainingToUnwrap > wrappedDemurrageBalance
          ? wrappedDemurrageBalance
          : remainingToUnwrap;

        const wrapper = new DemurrageCirclesContractMinimal({
          address: wrappedDemurrageAddress,
          rpcUrl: this.config.circlesRpcUrl
        });
        const unwrapTx = wrapper.unwrap(toUnwrap);

        transactions.push({
          to: unwrapTx.to as Address,
          data: unwrapTx.data as `0x${string}`,
          value: unwrapTx.value ?? 0n,
        });

        remainingToUnwrap -= toUnwrap;
      }

      // Unwrap inflationary if still needed
      if (wrappedInflationaryBalance > 0n && wrappedInflationaryAddress && remainingToUnwrap > 0n) {
        // For inflationary, we need to unwrap in static (inflationary) units
        const staticToUnwrap = CirclesConverter.attoCirclesToAttoStaticCircles(remainingToUnwrap);
        const actualUnwrap = staticToUnwrap > wrappedInflationaryBalance
          ? wrappedInflationaryBalance
          : staticToUnwrap;

        const wrapper = new InflationaryCirclesContractMinimal({
          address: wrappedInflationaryAddress,
          rpcUrl: this.config.circlesRpcUrl
        });
        const unwrapTx = wrapper.unwrap(actualUnwrap);

        transactions.push({
          to: unwrapTx.to as Address,
          data: unwrapTx.data as `0x${string}`,
          value: unwrapTx.value ?? 0n,
        });
      }

      // If receiver is different, add transfer
      if (receiverAddr !== fromAddr) {
        const tokenIdBigInt = await this.hubV2.toTokenId(tokenIdAddr);
        const transferTx = this.hubV2.safeTransferFrom(
          fromAddr,
          receiverAddr,
          tokenIdBigInt,
          amountBigInt
        );
        transactions.push({
          to: transferTx.to as Address,
          data: transferTx.data as `0x${string}`,
          value: transferTx.value ?? 0n
        });
      }

      return transactions;
    }

    // Step 5: Not enough tokens even with unwrapping, try pathfinding
    // Check if we already trust the token owner
    const alreadyTrusted = await this.hubV2.isTrusted(fromAddr, tokenIdAddr);
    const needsTemporaryTrust = !alreadyTrusted;

    // Calculate current time + 1 year for trust expiry
    const trustExpiry = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60);

    // Try pathfinding with trust simulation (only for the deficit)
    // Round UP the deficit to the next 6-decimal boundary to ensure we get at least the target amount
    // This compensates for the pathfinder's 6-decimal precision
    const truncatedDeficit = CirclesConverter.truncateToInt64(deficit);
    const hasRemainder = deficit % CirclesConverter.FACTOR_1E12 !== 0n;
    const roundedUpDeficit = CirclesConverter.blowUpToBigInt(
      hasRemainder ? truncatedDeficit + 1n : truncatedDeficit
    );

    let path: PathfindingResult;
    try {
      path = await this.pathfinder.findPath({
        from: fromAddr,
        to: receiverAddr,
        targetFlow: roundedUpDeficit,
        toTokens: [tokenIdAddr],
        useWrappedBalances: true,
        simulatedTrusts: needsTemporaryTrust ? [{
          truster: fromAddr,
          trustee: tokenIdAddr
        }] : undefined
      });
    } catch (error) {
      // Pathfinding failed
      const availableCrc = Number(totalAvailable) / 1e18;
      const targetCrc = Number(amountBigInt) / 1e18;
      const deficitCrc = Number(deficit) / 1e18;

      throw new TransferError(
        `Insufficient tokens to replenish. Target: ${targetCrc.toFixed(6)} CRC, ` +
        `Current unwrapped: ${Number(unwrappedBalance) / 1e18} CRC, ` +
        `Need: ${deficitCrc.toFixed(6)} CRC, ` +
        `Available (including all paths): ${availableCrc.toFixed(6)} CRC. ` +
        `Cannot acquire the remaining ${(Number(deficit - (totalAvailable - unwrappedBalance)) / 1e18).toFixed(6)} CRC.`,
        {
          code: 'REPLENISH_INSUFFICIENT_TOKENS',
          source: 'VALIDATION',
          context: {
            from: fromAddr,
            tokenId: tokenIdAddr,
            target: amountBigInt.toString(),
            unwrapped: unwrappedBalance.toString(),
            deficit: deficit.toString(),
            available: totalAvailable.toString(),
            targetCrc,
            unwrappedCrc: Number(unwrappedBalance) / 1e18,
            deficitCrc,
            availableCrc
          },
        }
      );
    }

    // Check if pathfinder found enough
    if (!path.transfers || path.transfers.length === 0) {
      throw TransferError.noPathFound(fromAddr, receiverAddr,
        `No path to acquire token ${tokenIdAddr}`);
    }

    // Check if we got enough flow
    // We requested roundedUpDeficit, so we should get at least that much
    if (path.maxFlow < roundedUpDeficit) {
      const pathFlowCrc = Number(path.maxFlow) / 1e18;
      const deficitCrc = Number(roundedUpDeficit) / 1e18;

      throw new TransferError(
        `Pathfinder can only provide ${pathFlowCrc.toFixed(6)} CRC of the ${deficitCrc.toFixed(6)} CRC deficit needed for token ${tokenIdAddr}.`,
        {
          code: 'REPLENISH_INSUFFICIENT_PATH_FLOW',
          source: 'PATHFINDING',
          context: {
            from: fromAddr,
            tokenId: tokenIdAddr,
            deficit: roundedUpDeficit.toString(),
            pathFlow: path.maxFlow.toString(),
            deficitCrc,
            pathFlowCrc
          },
        }
      );
    }

    // Step 6: Add temporary trust if needed
    if (needsTemporaryTrust) {
      const trustTx = this.hubV2.trust(tokenIdAddr, trustExpiry);
      transactions.push({
        to: trustTx.to as Address,
        data: trustTx.data as `0x${string}`,
        value: trustTx.value ?? 0n
      });
    }

    // Step 7: Handle wrapped tokens in path (similar to constructAdvancedTransfer)
    const tokenInfoMap = await getTokenInfoMapFromPath(fromAddr, this.config.circlesRpcUrl, path);
    const wrappedTokensInPath = getWrappedTokensFromPath(path, tokenInfoMap);
    const hasWrappedTokens = Object.keys(wrappedTokensInPath).length > 0;

    let unwrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];
    let wrapCalls: Array<{ to: Address; data: `0x${string}`; value: bigint }> = [];

    if (hasWrappedTokens) {
      const balanceMap = await this._getTokenBalanceMap(fromAddr);
      const demurragedUnwrapCalls = this._createDemurragedUnwrapCalls(wrappedTokensInPath);
      const { unwrapCalls: inflationaryUnwrapCalls, wrapCalls: inflationaryWrapCalls } =
        this._createInflationaryUnwrapAndWrapCalls(wrappedTokensInPath, tokenInfoMap, balanceMap);

      unwrapCalls = [...demurragedUnwrapCalls, ...inflationaryUnwrapCalls];
      wrapCalls = inflationaryWrapCalls;

      path = replaceWrappedTokensWithAvatars(path, tokenInfoMap);
    }

    // Step 8: Create flow matrix
    const flowMatrix = createFlowMatrixUtil(fromAddr, receiverAddr, path.maxFlow, path.transfers);

    // Prepare streams with hex-encoded data
    const streamsWithHexData = prepareFlowMatrixStreams(flowMatrix);

    const operateFlowMatrixTxRaw = this.hubV2.operateFlowMatrix(
      flowMatrix.flowVertices as readonly Address[],
      flowMatrix.flowEdges,
      streamsWithHexData,
      flowMatrix.packedCoordinates as `0x${string}`
    );

    const operateFlowMatrixTx = {
      to: operateFlowMatrixTxRaw.to as Address,
      data: operateFlowMatrixTxRaw.data as `0x${string}`,
      value: operateFlowMatrixTxRaw.value ?? 0n
    };

    // Check self-approval
    let isApproved = false;
    try {
      isApproved = await this.hubV2.isApprovedForAll(fromAddr, fromAddr);
    } catch (error) {
      console.warn('Failed to check approval status, including approval transaction:', error);
    }

    // Step 9: Add untrust if we added temporary trust
    if (needsTemporaryTrust) {
      const untrustTx = this.hubV2.trust(tokenIdAddr, 0n); // 0 expiry = untrust
      wrapCalls.push({
        to: untrustTx.to as Address,
        data: untrustTx.data as `0x${string}`,
        value: untrustTx.value ?? 0n
      });
    }

    // Assemble all transactions in order
    const approvalTxs = isApproved ? [] : [{
      to: this.hubV2.setApprovalForAll(fromAddr, true).to as Address,
      data: this.hubV2.setApprovalForAll(fromAddr, true).data as `0x${string}`,
      value: 0n
    }];

    transactions.push(
      ...approvalTxs,
      ...unwrapCalls,
      operateFlowMatrixTx,
      ...wrapCalls
    );

    return transactions as Array<{ to: Address; data: `0x${string}`; value: bigint }>;
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
    const allBalances = await this.balance.getTokenBalances(from);
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
      const wrapper = new DemurrageCirclesContractMinimal({
        address: wrapperAddr as Address,
        rpcUrl: this.config.circlesRpcUrl
      });
      const unwrapTx = wrapper.unwrap(amountUsedInPath);

      unwrapCalls.push({
        to: unwrapTx.to as Address,
        data: unwrapTx.data as `0x${string}`,
        value: unwrapTx.value ?? 0n,
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
      const wrapper = new InflationaryCirclesContractMinimal({
        address: wrapperAddr as Address,
        rpcUrl: this.config.circlesRpcUrl
      });
      const unwrapTx = wrapper.unwrap(currentBalance);

      unwrapCalls.push({
        to: unwrapTx.to as Address,
        data: unwrapTx.data as `0x${string}`,
        value: unwrapTx.value ?? 0n,
      });

      // Calculate leftover amount: balance before unwrap (converted to demurraged) - amount used in path
      const tokenOwner = tokenInfo?.tokenOwner as Address;
      const leftoverAmount = CirclesConverter.attoStaticCirclesToAttoCircles(currentBalance) - amountUsedInPath;

      // Only create wrap call if there's leftover amount
      if (leftoverAmount > 0n) {
        // Create wrap call using hubV2 contract
        const wrapTx = this.hubV2.wrap(
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
    const groups = await this.group.findGroups(1, {
      mintHandlerEquals: to,
    });

    const completeExcludeFromTokenList = new Set<Address>();

    // If recipient is a group mint handler, exclude the group's tokens
    if (groups.length > 0) {
      const groupInfo = groups[0];
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
