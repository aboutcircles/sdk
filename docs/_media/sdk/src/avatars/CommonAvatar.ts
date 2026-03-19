import type {
  Address,
  ContractRunner,
  Profile,
  AdvancedTransferOptions,
  FindPathParams,
  AvatarRow,
  TokenBalanceRow,
  AggregatedTrustRelation } from '@aboutcircles/sdk-types';
import type { TransactionReceipt } from 'viem';
import type { Core } from '@aboutcircles/sdk-core';
import type { CirclesEvent, Observable } from '@aboutcircles/sdk-rpc';
import { Observable as ObservableClass, CirclesRpc } from '@aboutcircles/sdk-rpc';
import { cidV0ToHex, bytesToHex, ValidationError } from '@aboutcircles/sdk-utils';
import { Profiles } from '@aboutcircles/sdk-profiles';
import { SdkError } from '../errors';
import {
  CirclesType,
  DemurrageCirclesContract,
  InflationaryCirclesContract
} from '@aboutcircles/sdk-core';
import { encodeFunctionData } from 'viem';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';

/**
 * Advanced pathfinding options (reuses FindPathParams optional fields)
 */
export type PathfindingOptions = Omit<FindPathParams, 'from' | 'to' | 'targetFlow'>;

/**
 * CommonAvatar abstract class
 * Provides common functionality shared across all avatar types (Human, Organisation, Group)
 *
 * This class extracts common logic for:
 * - Profile management (get, update, metadata)
 * - Balance queries
 * - Trust relationships
 * - Transaction history
 * - Event subscriptions
 */
export abstract class CommonAvatar {
  public readonly address: Address;
  public readonly avatarInfo: AvatarRow | undefined;
  public readonly core: Core;
  public readonly contractRunner?: ContractRunner;
  public events: Observable<CirclesEvent>;

  protected readonly runner: ContractRunner;
  protected readonly profiles: Profiles;
  protected readonly rpc: CirclesRpc;
  protected readonly transferBuilder: TransferBuilder;
  protected _cachedProfile?: Profile;
  protected _cachedProfileCid?: string;
  protected _eventSubscription?: () => void;
  private _hasSubscribed = false;

  constructor(
    address: Address,
    core: Core,
    contractRunner?: ContractRunner,
    avatarInfo?: AvatarRow
  ) {
    this.address = address;
    this.core = core;
    this.contractRunner = contractRunner;
    this.avatarInfo = avatarInfo;

    // Validate contract runner is available
    if (!contractRunner) {
      throw SdkError.notInitialized('ContractRunner');
    }

    if (!contractRunner.sendTransaction) {
      throw SdkError.unsupportedOperation(
        'sendTransaction',
        'Contract runner does not support transaction sending'
      );
    }

    this.runner = contractRunner;

    // Initialize profiles client with the profile service URL from config
    this.profiles = new Profiles(core.config.profileServiceUrl);

    // Initialize RPC client
    this.rpc = new CirclesRpc(core.config.circlesRpcUrl);

    // Initialize transfer builder
    this.transferBuilder = new TransferBuilder(core);

    // Event subscription is optional - initialize with stub observable
    // Actual subscription is handled by Sdk.getAvatar() when autoSubscribeEvents is enabled
    const stub = ObservableClass.create<CirclesEvent>();
    this.events = stub.property;
  }


  // ============================================================================
  // Common Balance Methods
  // ============================================================================

  public readonly balances = {
    /**
     * Get total balance across all tokens
     */
    getTotal: async (): Promise<bigint> => {
      return await this.rpc.balance.getTotalBalance(this.address);
    },

    /**
     * Get detailed token balances
     */
    getTokenBalances: async (): Promise<TokenBalanceRow[]> => {
      return await this.rpc.balance.getTokenBalances(this.address) as unknown as TokenBalanceRow[];
    },

    /**
     * Get total supply of this avatar's token
     * Override this in subclasses if needed
     */
    getTotalSupply: async (): Promise<bigint> => {
      throw SdkError.unsupportedOperation('getTotalSupply', 'This method is not yet implemented');
    },
  };

  // ============================================================================
  // Common Trust Methods
  // ============================================================================

  public readonly trust = {
    /**
     * Trust another avatar or multiple avatars
     *
     * When using Safe runner, all trust operations are executed atomically in a single transaction.
     * When using EOA runner, only single avatars are supported (pass array length 1).
     *
     * @param avatar Single avatar address or array of avatar addresses
     * @param expiry Trust expiry timestamp (in seconds since epoch). Defaults to max uint96 for indefinite trust
     * @returns Transaction response
     *
     * @example
     * ```typescript
     * // Trust single avatar indefinitely
     * await avatar.trust.add('0x123...');
     *
     * // Trust with custom expiry
     * const oneYear = BigInt(Date.now() / 1000 + 31536000);
     * await avatar.trust.add('0x123...', oneYear);
     *
     * // Trust multiple avatars (Safe only - throws error with EOA)
     * await avatar.trust.add(['0x123...', '0x456...', '0x789...']);
     * ```
     */
    add: async (
      avatar: Address | Address[],
      expiry?: bigint
    ): Promise<TransactionReceipt> => {
      // Default to max uint96 for indefinite trust
      const trustExpiry = expiry ?? BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFF');

      // Prepare transaction(s)
      const avatars = Array.isArray(avatar) ? avatar : [avatar];

      if (avatars.length === 0) {
        throw ValidationError.missingParameter('avatar');
      }

      // Create trust transactions for all avatars
      const transactions = avatars.map((trustee) =>
        this.core.hubV2.trust(trustee, trustExpiry)
      );

      // Send transactions to runner
      return await this.runner.sendTransaction!(transactions);
    },

    /**
     * Remove trust from another avatar or multiple avatars
     * This is done by setting the trust expiry to 0
     *
     * When using Safe runner, all operations are batched atomically.
     * When using EOA runner, only single avatars are supported (pass array length 1).
     *
     * @param avatar Single avatar address or array of avatar addresses
     * @returns Transaction response
     *
     * @example
     * ```typescript
     * // Remove trust from single avatar
     * await avatar.trust.remove('0x123...');
     *
     * // Remove trust from multiple avatars (Safe only)
     * await avatar.trust.remove(['0x123...', '0x456...', '0x789...']);
     * ```
     */
    remove: async (avatar: Address | Address[]): Promise<TransactionReceipt> => {
      // Prepare transaction(s)
      const avatars = Array.isArray(avatar) ? avatar : [avatar];

      if (avatars.length === 0) {
        throw ValidationError.missingParameter('avatar');
      }

      // Validate addresses
      for (const addr of avatars) {
        if (!addr || addr.length !== 42 || !addr.startsWith('0x')) {
          throw ValidationError.invalidAddress(addr);
        }
      }

      // Untrust by setting expiry to 0
      const untrustExpiry = BigInt(0);

      // Create untrust transactions for all avatars
      const transactions = avatars.map((trustee) =>
        this.core.hubV2.trust(trustee, untrustExpiry)
      );

      // Send transactions to runner
      return await this.runner.sendTransaction!(transactions);
    },

    /**
     * Check if this avatar trusts another avatar
     * @param otherAvatar The avatar address to check
     * @returns True if this avatar trusts the other avatar
     *
     * @example
     * ```typescript
     * const trusting = await avatar.trust.isTrusting('0x123...');
     * if (trusting) {
     *   console.log('You trust this avatar');
     * }
     * ```
     */
    isTrusting: async (otherAvatar: Address): Promise<boolean> => {
      return await this.core.hubV2.isTrusted(this.address, otherAvatar);
    },

    /**
     * Check if another avatar trusts this avatar
     * @param otherAvatar The avatar address to check
     * @returns True if the other avatar trusts this avatar
     *
     * @example
     * ```typescript
     * const trustedBy = await avatar.trust.isTrustedBy('0x123...');
     * if (trustedBy) {
     *   console.log('This avatar trusts you');
     * }
     * ```
     */
    isTrustedBy: async (otherAvatar: Address): Promise<boolean> => {
      return await this.core.hubV2.isTrusted(otherAvatar, this.address);
    },

    /**
     * Get all trust relations for this avatar
     */
    getAll: async (): Promise<AggregatedTrustRelation[]> => {
      return await this.rpc.trust.getAggregatedTrustRelations(this.address);
    },
  };

  // ============================================================================
  // Common Profile Methods
  // ============================================================================

  public readonly profile = {
    /**
     * Get the profile for this avatar from IPFS
     * Uses caching to avoid redundant fetches for the same CID
     *
     * @returns The profile data, or undefined if no profile is set or fetch fails
     *
     * @example
     * ```typescript
     * const profile = await avatar.profile.get();
     * if (profile) {
     *   console.log('Name:', profile.name);
     *   console.log('Description:', profile.description);
     * }
     * ```
     */
    get: async (): Promise<Profile | undefined> => {
      const profileCid = this.avatarInfo?.cidV0;

      // Return cached profile if CID hasn't changed
      if (this._cachedProfile && this._cachedProfileCid === profileCid) {
        return this._cachedProfile;
      }

      if (!profileCid) {
        return undefined;
      }

      try {
        const profileData = await this.profiles.get(profileCid);
        if (profileData) {
          this._cachedProfile = profileData;
          this._cachedProfileCid = profileCid;
          return this._cachedProfile;
        }
      } catch (e) {
        console.warn(`Couldn't load profile for CID ${profileCid}`, e);
      }

      return undefined;
    },

    /**
     * Update the profile for this avatar
     * This will:
     * 1. Pin the new profile data to IPFS via the profile service
     * 2. Update the metadata digest in the name registry contract
     *
     * @param profile The profile data to update
     * @returns The CID of the newly pinned profile
     *
     * @example
     * ```typescript
     * const profile = {
     *   name: 'Alice',
     *   description: 'Hello, Circles!',
     *   avatarUrl: 'https://example.com/avatar.png'
     * };
     *
     * const cid = await avatar.profile.update(profile);
     * console.log('Profile updated with CID:', cid);
     * ```
     */
    update: async (profile: Profile): Promise<string> => {
      // Step 1: Pin the profile to IPFS and get CID
      const cid = await this.profiles.create(profile);
      if (!cid) {
        throw SdkError.configError('Profile service did not return a CID', { profile });
      }

      // Step 2: Update the metadata digest in the name registry
      const updateReceipt = await this.profile.updateMetadata(cid);
      if (!updateReceipt) {
        throw SdkError.configError('Failed to update metadata digest in name registry', { cid });
      }

      // Update local avatar info if available
      if (this.avatarInfo) {
        this.avatarInfo.cidV0 = cid;
      }

      // Clear cache to force re-fetch
      this._cachedProfile = undefined;
      this._cachedProfileCid = undefined;

      return cid;
    },

    /**
     * Update the metadata digest (CID) in the name registry
     * This updates the on-chain pointer to the profile data stored on IPFS
     *
     * @param cid The IPFS CIDv0 to set as the metadata digest (e.g., "QmXxxx...")
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * const receipt = await avatar.profile.updateMetadata('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
     * console.log('Metadata updated, tx hash:', receipt.hash);
     * ```
     */
    updateMetadata: async (cid: string): Promise<TransactionReceipt> => {
      // Convert CIDv0 (base58-encoded multihash) to bytes32 hex format
      // This extracts the 32-byte SHA-256 digest from the CID
      const cidHex = cidV0ToHex(cid);

      const updateTx = this.core.nameRegistry.updateMetadataDigest(cidHex as `0x${string}`);
      return await this.runner.sendTransaction!([updateTx]);
    },

    /**
     * Register a short name for this avatar using a specific nonce
     * Short names are numeric identifiers that can be used instead of addresses
     *
     * @param nonce The nonce to use for generating the short name
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * // Find available nonce first
     * const [shortName, nonce] = await core.nameRegistry.searchShortName(avatar.address);
     * console.log('Available short name:', shortName.toString());
     *
     * // Register it
     * const receipt = await avatar.profile.registerShortName(Number(nonce));
     * console.log('Short name registered, tx hash:', receipt.hash);
     * ```
     */
    registerShortName: async (nonce: number): Promise<TransactionReceipt> => {
      const registerTx = this.core.nameRegistry.registerShortNameWithNonce(BigInt(nonce));
      return await this.runner.sendTransaction!([registerTx]);
    },
  };

  // ============================================================================
  // Common History Methods
  // ============================================================================

  public readonly history = {
    /**
     * Get transaction history for this avatar using cursor-based pagination
     * Returns incoming/outgoing transactions and minting events
     *
     * @param limit Number of transactions per page (default: 50)
     * @param sortOrder Sort order for results (default: 'DESC')
     * @returns PagedQuery instance for iterating through transactions
     *
     * @example
     * ```typescript
     * const query = avatar.history.getTransactions(20);
     *
     * // Get first page
     * await query.queryNextPage();
     * query.currentPage.results.forEach(tx => {
     *   console.log(`${tx.from} -> ${tx.to}: ${tx.circles} CRC`);
     * });
     *
     * // Get next page if available
     * if (query.currentPage.hasMore) {
     *   await query.queryNextPage();
     * }
     * ```
     */
    getTransactions: (limit: number = 50, sortOrder: 'ASC' | 'DESC' = 'DESC') => {
      return this.rpc.transaction.getTransactionHistory(this.address, limit, sortOrder);
    },
  };

  // ============================================================================
  // Common Transfer Methods
  // ============================================================================

  public readonly transfer = {
    /**
     * Send Circles tokens directly to another address
     * This is a simple direct transfer without pathfinding
     *
     * Supports both ERC1155 (personal/group tokens) and ERC20 (wrapped tokens) transfers.
     * The token type is automatically detected and the appropriate transfer method is used.
     *
     * For transfers using pathfinding (which can use trust network and multiple token types),
     * use transfer.advanced() instead.
     *
     * @param to Recipient address
     * @param amount Amount to transfer (in atto-circles)
     * @param tokenAddress Token address to transfer (defaults to sender's personal token)
     * @param txData Optional transaction data (only used for ERC1155 transfers)
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * // Send 100 of your personal CRC directly
     * const receipt = await avatar.transfer.direct('0x123...', BigInt(100e18));
     *
     * // Send wrapped tokens
     * const receipt = await avatar.transfer.direct('0x123...', BigInt(100e18), '0xWrappedTokenAddress...');
     * ```
     */
    direct: async (
      to: Address,
      amount: bigint,
      tokenAddress?: Address,
      txData?: Uint8Array
    ): Promise<TransactionReceipt> => {
      // Validate inputs
      if (!to || to.length !== 42 || !to.startsWith('0x')) {
        throw ValidationError.invalidAddress(to);
      }

      if (amount <= 0n) {
        throw ValidationError.invalidAmount(amount, 'Amount must be positive');
      }

      const token = tokenAddress || this.address;

      // Validate token address if provided
      if (tokenAddress && (!tokenAddress || tokenAddress.length !== 42 || !tokenAddress.startsWith('0x'))) {
        throw ValidationError.invalidAddress(tokenAddress);
      }

      // Get token info to determine transfer type
      const tokenInfo = await this.rpc.token.getTokenInfo(token);

      if (!tokenInfo) {
        throw SdkError.configError(`Token not found: ${token}`, { token });
      }

      // Define token type sets
      const erc1155Types = new Set(['CrcV2_RegisterHuman', 'CrcV2_RegisterGroup']);
      const erc20Types = new Set([
        'CrcV2_ERC20WrapperDeployed_Demurraged',
        'CrcV2_ERC20WrapperDeployed_Inflationary'
      ]);

      // Route to appropriate transfer method based on token type
      if (erc1155Types.has(tokenInfo.tokenType)) {
        return await this._transferErc1155(token, to, amount, txData);
      } else if (erc20Types.has(tokenInfo.tokenType)) {
        return await this._transferErc20(to, amount, token);
      }

      throw SdkError.unsupportedOperation(
        'direct transfer',
        `Token type ${tokenInfo.tokenType} is not supported for direct transfers`
      );
    },

    /**
     * Send tokens using pathfinding through the trust network
     * This enables transfers even when you don't have the recipient's token
     *
     * @param to Recipient address
     * @param amount Amount to transfer (in atto-circles or CRC)
     * @param options Advanced transfer options (pathfinding parameters)
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * // Send 100 CRC using pathfinding
     * await avatar.transfer.advanced('0x123...', BigInt(100e18));
     *
     * // With custom options
     * await avatar.transfer.advanced('0x123...', 100, {
     *   maxTransfers: 5,
     *   maxDistance: 3
     * });
     * ```
     */
    advanced: async (
      to: Address,
      amount: number | bigint,
      options?: AdvancedTransferOptions
    ): Promise<TransactionReceipt> => {
      // Construct transfer using TransferBuilder
      const transactions = await this.transferBuilder.constructAdvancedTransfer(
        this.address,
        to,
        amount,
        options
      );

      // Execute the constructed transactions
      return await this.runner.sendTransaction!(transactions);
    },

    /**
     * Get the maximum amount that can be transferred to an address using pathfinding
     *
     * @param to Recipient address
     * @returns Maximum transferable amount (in atto-circles)
     *
     * @example
     * ```typescript
     * const maxAmount = await avatar.transfer.getMaxAmount('0x123...');
     * console.log(`Can transfer up to: ${maxAmount}`);
     * ```
     */
    getMaxAmount: async (to: Address): Promise<bigint> => {
      return await this.rpc.pathfinder.findMaxFlow({
        from: this.address.toLowerCase() as Address,
        to: to.toLowerCase() as Address
      });
    },

    /**
     * Get the maximum amount that can be transferred with custom pathfinding options
     *
     * @param to Recipient address
     * @param options Pathfinding options (maxTransfers, maxDistance, etc.)
     * @returns Maximum transferable amount (in atto-circles)
     *
     * @example
     * ```typescript
     * const maxAmount = await avatar.transfer.getMaxAmountAdvanced('0x123...', {
     *   maxTransfers: 3,
     *   maxDistance: 2
     * });
     * ```
     */
    getMaxAmountAdvanced: async (to: Address, options?: PathfindingOptions): Promise<bigint> => {
      return await this.rpc.pathfinder.findMaxFlow({
        from: this.address.toLowerCase() as Address,
        to: to.toLowerCase() as Address,
        ...options
      });
    },
  };

  // ============================================================================
  // Common Wrap Methods
  // ============================================================================

  public readonly wrap = {
    /**
     * Wrap personal CRC tokens as demurraged ERC20 tokens
     *
     * @param avatarAddress The avatar whose tokens to wrap
     * @param amount Amount to wrap (in atto-circles)
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * // Wrap 100 CRC as demurraged ERC20
     * const receipt = await avatar.wrap.asDemurraged(avatar.address, BigInt(100e18));
     * ```
     */
    asDemurraged: async (avatarAddress: Address, amount: bigint): Promise<TransactionReceipt> => {
      const wrapTx = this.core.hubV2.wrap(avatarAddress, amount, CirclesType.Demurrage);
      return await this.runner.sendTransaction!([wrapTx]);
    },

    /**
     * Wrap personal CRC tokens as inflationary ERC20 tokens
     *
     * @param avatarAddress The avatar whose tokens to wrap
     * @param amount Amount to wrap (in atto-circles)
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * // Wrap 100 CRC as inflationary ERC20
     * const receipt = await avatar.wrap.asInflationary(avatar.address, BigInt(100e18));
     * ```
     */
    asInflationary: async (avatarAddress: Address, amount: bigint): Promise<TransactionReceipt> => {
      const wrapTx = this.core.hubV2.wrap(avatarAddress, amount, CirclesType.Inflation);
      return await this.runner.sendTransaction!([wrapTx]);
    },

    /**
     * Unwrap demurraged ERC20 tokens back to personal CRC
     *
     * @param tokenAddress The demurraged token address to unwrap
     * @param amount Amount to unwrap (in atto-circles)
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * const receipt = await avatar.wrap.unwrapDemurraged('0xTokenAddress...', BigInt(100e18));
     * ```
     */
    unwrapDemurraged: async (
      tokenAddress: Address,
      amount: bigint
    ): Promise<TransactionReceipt> => {
      const demurrageContract = new DemurrageCirclesContract({
        address: tokenAddress,
        rpcUrl: this.core.rpcUrl
      });
      const unwrapTx = demurrageContract.unwrap(amount);
      return await this.runner.sendTransaction!([unwrapTx]);
    },

    /**
     * Unwrap inflationary ERC20 tokens back to personal CRC
     *
     * @param tokenAddress The inflationary token address to unwrap
     * @param amount Amount to unwrap (in atto-circles)
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * const receipt = await avatar.wrap.unwrapInflationary('0xTokenAddress...', BigInt(100e18));
     * ```
     */
    unwrapInflationary: async (
      tokenAddress: Address,
      amount: bigint
    ): Promise<TransactionReceipt> => {
      const inflationaryContract = new InflationaryCirclesContract({
        address: tokenAddress,
        rpcUrl: this.core.rpcUrl
      });
      const unwrapTx = inflationaryContract.unwrap(amount);
      return await this.runner.sendTransaction!([unwrapTx]);
    },
  };

  // ============================================================================
  // Common Event Subscription Methods
  // ============================================================================

  /**
   * Subscribe to Circles events for this avatar
   * Events are filtered to only include events related to this avatar's address
   * This method is idempotent - calling it multiple times will not create duplicate subscriptions
   *
   * @returns Promise that resolves when subscription is established
   *
   * @example
   * ```typescript
   * await avatar.subscribeToEvents();
   *
   * // Listen for events
   * avatar.events.subscribe((event) => {
   *   console.log('Event received:', event.$event, event);
   *
   *   if (event.$event === 'CrcV2_PersonalMint') {
   *     console.log('Minted:', event.amount);
   *   }
   * });
   * ```
   */
  async subscribeToEvents(): Promise<void> {
    // Make idempotent - only subscribe once
    if (this._hasSubscribed) {
      return;
    }
    this._hasSubscribed = true;

    try {
      // Subscribe to events via RPC WebSocket
      const observable = await this.rpc.client.subscribe(this.address);
      this.events = observable;
    } catch (e) {
      // Reset flag on error so it can be retried
      this._hasSubscribed = false;
      throw SdkError.operationFailed(
        'subscribeToEvents',
        'Failed to subscribe to avatar events',
        e
      );
    }
  }

  /**
   * Unsubscribe from events
   * Cleans up the WebSocket connection and event listeners
   */
  unsubscribeFromEvents(): void {
    if (this._eventSubscription) {
      this._eventSubscription();
      this._eventSubscription = undefined;
    }
  }

  // ============================================================================
  // Protected Helper Methods
  // ============================================================================

  /**
   * Transfer ERC1155 tokens using safeTransferFrom
   * @protected
   */
  protected async _transferErc1155(
    tokenAddress: Address,
    to: Address,
    amount: bigint,
    txData?: Uint8Array
  ): Promise<TransactionReceipt> {
    // Get the token ID for the token address
    const tokenId = await this.core.hubV2.toTokenId(tokenAddress);

    // Convert txData to hex string if provided, otherwise use empty hex
    const data = txData ? bytesToHex(txData) as `0x${string}` : '0x';

    // Create the safeTransferFrom transaction
    const transferTx = this.core.hubV2.safeTransferFrom(
      this.address,
      to,
      tokenId,
      amount,
      data
    );

    // Execute the transaction
    return await this.runner.sendTransaction!([transferTx]);
  }

  /**
   * Transfer ERC20 tokens using the standard transfer function
   * @protected
   */
  protected async _transferErc20(
    to: Address,
    amount: bigint,
    tokenAddress: Address
  ): Promise<TransactionReceipt> {
    // Encode the ERC20 transfer function call
    const data = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'transfer',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
      }],
      functionName: 'transfer',
      args: [to, amount],
    });

    // Create and send the transaction
    return await this.runner.sendTransaction!([{
      to: tokenAddress,
      data,
      value: 0n,
    }]);
  }
}
