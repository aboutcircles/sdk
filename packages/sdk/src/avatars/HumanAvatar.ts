import type {
  Address,
  AvatarRow,
  ContractRunner,
  TokenBalanceRow,
  GroupMembershipRow,
  GroupRow,
  AggregatedTrustRelation,
  TransactionRequest
} from '@aboutcircles/sdk-types';
import type { TransactionReceipt, Hex } from 'viem';
import type { Core } from '@aboutcircles/sdk-core';
import { ValidationError } from '@aboutcircles/sdk-utils';
import { SdkError } from '../errors';
import { BaseGroupContract } from '@aboutcircles/sdk-core';
import { CommonAvatar, type PathfindingOptions } from './CommonAvatar';
import { Invitations, InviteFarm, type ProxyInviter, type GeneratedInvite } from '@aboutcircles/sdk-invitations';

/**
 * HumanAvatar class implementation
 * Provides a simplified, user-friendly wrapper around Circles protocol for human avatars
 *
 * This class represents a human avatar in the Circles ecosystem and provides
 * methods for managing trust relationships, personal token minting, transfers, and more.
 */
export class HumanAvatar extends CommonAvatar {
  constructor(
    address: Address,
    core: Core,
    contractRunner?: ContractRunner,
    avatarInfo?: AvatarRow
  ) {
    super(address, core, contractRunner, avatarInfo);
  }

  // ============================================================================
  // Override Balance Methods with Human-Specific Features
  // ============================================================================

  public readonly balances = {
    getTotal: async (): Promise<bigint> => {
      return await this.rpc.balance.getTotalBalance(this.address);
    },

    getTokenBalances: async (): Promise<TokenBalanceRow[]> => {
      return await this.rpc.balance.getTokenBalances(this.address) as unknown as TokenBalanceRow[];
    },

    getTotalSupply: async (): Promise<bigint> => {
      throw SdkError.unsupportedOperation('getTotalSupply', 'This method is not yet implemented');
    },

    /**
     * Get the maximum amount that can be replenished (converted to unwrapped personal CRC)
     * This calculates how much of your wrapped tokens and other tokens can be converted
     * into your own unwrapped ERC1155 personal CRC tokens using pathfinding
     *
     * @param options Optional pathfinding options
     * @returns Maximum replenishable amount in atto-circles
     *
     * @example
     * ```typescript
     * const maxReplenishable = await avatar.balances.getMaxReplenishable();
     * console.log('Can replenish:', CirclesConverter.attoCirclesToCircles(maxReplenishable), 'CRC');
     * ```
     */
    //@todo improve calculation
    getMaxReplenishable: async (options?: PathfindingOptions): Promise<bigint> => {
      const addr = this.address.toLowerCase() as Address;

      // Find maximum flow from avatar to itself, targeting personal tokens as destination
      // This effectively asks: "How much can I convert to my own personal tokens?"
      // @todo add sim trust
      const maxFlow = await this.rpc.pathfinder.findMaxFlow({
        from: addr,
        to: addr,
        toTokens: [addr], // Destination token is sender's own personal CRC
        useWrappedBalances: true, // Include wrapped tokens
        ...options,
      });

      return maxFlow;
    },

    /**
     * Replenish unwrapped personal CRC tokens by converting wrapped/other tokens
     *
     * This method uses pathfinding to find the best way to convert your available tokens
     * (including wrapped tokens) into unwrapped ERC1155 personal CRC tokens.
     *
     * Useful when you have wrapped tokens or other people's tokens and want to
     * convert them to your own personal unwrapped tokens for transfers.
     *
     * @param options Optional pathfinding options
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * // Convert all available wrapped/other tokens to unwrapped personal CRC
     * const receipt = await avatar.balances.replenish();
     * console.log('Replenished personal tokens, tx hash:', receipt.hash);
     * ```
     */
    replenish: async (options?: PathfindingOptions): Promise<TransactionReceipt> => {
      // First, get the maximum replenishable amount
      const maxAmount = await this.balances.getMaxReplenishable(options);

      if (maxAmount === 0n) {
        throw SdkError.configError(
          'No tokens available to replenish',
          { message: 'You may not have any wrapped tokens or convertible tokens' }
        );
      }

      // Construct replenish transactions using TransferBuilder
      const transactions = await this.transferBuilder.constructReplenish(
        this.address,
        this.address, // tokenId is own address (replenishing own tokens)
        maxAmount
      );

      // Execute the constructed transactions
      return await this.runner.sendTransaction!(transactions);
    },
  };

  // ============================================================================
  // Transfer methods are inherited from CommonAvatar
  // ============================================================================

  // ============================================================================
  // Trust methods are inherited from CommonAvatar
  // ============================================================================

  // Invitation methods using the new Invitations module
  public readonly invitation = {
    /**
     * Get a referral code for inviting a new user who doesn't have a Safe wallet yet
     *
     * This function:
     * 1. Generates a new private key and signer address for the invitee
     * 2. Finds proxy inviters (intermediaries in trust graph)
     * 3. Builds transaction batch to transfer 96 CRC to the invitation module
     * 4. Saves the referral data to the backend
     * 5. Returns transactions and the generated private key
     *
     * The private key should be shared with the invitee to claim their account.
     *
     * Requirements:
     * - You must have at least 96 CRC available (directly or via proxy inviters)
     * - Referrals service must be configured
     *
     * @returns Object containing transactions to execute and the private key to share
     *
     * @example
     * ```typescript
     * const { transactions, privateKey } = await avatar.invitation.getReferralCode();
     * // Execute transactions
     * await avatar.runner.sendTransaction(transactions);
     * // Share privateKey with invitee
     * ```
     */
    getReferralCode: async (): Promise<{ transactions: TransactionRequest[]; privateKey: `0x${string}` }> => {
      const invitations = new Invitations(this.core.config);
      return await invitations.generateReferral(this.address);
    },

    /**
     * Invite a user who already has a Safe wallet but is not yet registered in Circles
     *
     * Use this when inviting someone who has an existing Safe wallet but is not
     * yet registered in Circles Hub.
     *
     * @param invitee Address of the invitee (must have existing Safe wallet, NOT registered in Circles)
     * @returns Array of transactions to execute
     *
     * @example
     * ```typescript
     * const transactions = await avatar.invitation.invite('0xInviteeAddress');
     * await avatar.runner.sendTransaction(transactions);
     * ```
     */
    invite: async (invitee: Address): Promise<TransactionRequest[]> => {
      const invitations = new Invitations(this.core.config);
      return await invitations.generateInvite(this.address, invitee);
    },

    /**
     * Get proxy inviters who can facilitate invitations
     *
     * Proxy inviters are addresses that:
     * - Trust this avatar (or have mutual trust)
     * - Are trusted by the invitation module
     * - Have sufficient balance to cover invitation fees (96 CRC per invite)
     *
     * @returns Array of proxy inviters with their addresses and possible invite counts
     *
     * @example
     * ```typescript
     * const proxyInviters = await avatar.invitation.getProxyInviters();
     * proxyInviters.forEach(inviter => {
     *   console.log(`${inviter.address}: can invite ${inviter.possibleInvites} people`);
     * });
     * ```
     */
    getProxyInviters: async (): Promise<ProxyInviter[]> => {
      const invitations = new Invitations(this.core.config);
      return await invitations.getRealInviters(this.address);
    },

    /**
     * Find a path from this avatar to the invitation module
     *
     * @param proxyInviterAddress Optional specific proxy inviter to route through
     * @returns PathfindingResult containing the transfer path
     *
     * @example
     * ```typescript
     * const path = await avatar.invitation.findInvitePath();
     * console.log('Max flow:', path.maxFlow);
     * ```
     */
    findInvitePath: async (proxyInviterAddress?: Address) => {
      const invitations = new Invitations(this.core.config);
      return await invitations.findInvitePath(this.address, proxyInviterAddress);
    },

    /**
     * Compute the deterministic Safe address for a given signer
     *
     * Uses CREATE2 to predict the Safe address without deployment.
     *
     * @param signer The signer public address
     * @returns The deterministic Safe address
     *
     * @example
     * ```typescript
     * const safeAddress = avatar.invitation.computeAddress('0xSignerAddress');
     * ```
     */
    computeAddress: (signer: Address): Address => {
      const invitations = new Invitations(this.core.config);
      return invitations.computeAddress(signer);
    },

    /**
     * Generate new invitations using the InvitationFarm
     *
     * @param count Number of invitations to generate
     * @returns Promise containing secrets, signers, and transaction receipt
     *
     * @example
     * ```typescript
     * const result = await avatar.invitation.generateInvites(5);
     * result.secrets.forEach((secret, i) => {
     *   console.log(`Invite ${i + 1}: ${result.signers[i]}`);
     * });
     * ```
     */
    generateInvites: async (
      count: number
    ): Promise<{
      secrets: Hex[];
      signers: Address[];
      transactionReceipt: TransactionReceipt;
    }> => {
      const farm = new InviteFarm(this.core.config);
      const result = await farm.generateInvites(this.address, count);
      const receipt = await this.runner.sendTransaction!(result.transactions);

      return {
        secrets: result.invites.map((inv: GeneratedInvite) => inv.secret),
        signers: result.invites.map((inv: GeneratedInvite) => inv.signer),
        transactionReceipt: receipt,
      };
    },
  };

  // Personal token / Minting methods
  public readonly personalToken = {
    /**
     * Get the available amount of personal tokens that can be minted
     *
     * This method calls the HubV2 contract's calculateIssuance function which returns:
     * - Total issuance amount: The total amount of tokens that can be minted
     * - Start period: The period when minting started
     * - End period: The current period
     *
     * @returns Object containing issuance amount (in atto-circles), start period, and end period
     *
     * @example
     * ```typescript
     * const { amount, startPeriod, endPeriod } = await avatar.personalToken.getMintableAmount();
     * console.log('Mintable amount:', CirclesConverter.attoCirclesToCircles(amount), 'CRC');
     * console.log('Start period:', startPeriod.toString());
     * console.log('End period:', endPeriod.toString());
     * ```
     */
    getMintableAmount: async (): Promise<{
      amount: bigint;
      startPeriod: bigint;
      endPeriod: bigint;
    }> => {
      const [amount, startPeriod, endPeriod] = await this.core.hubV2.calculateIssuance(this.address);

      return {
        amount,
        startPeriod,
        endPeriod,
      };
    },

    /**
     * Mint personal Circles tokens
     * This claims all available personal tokens that have accrued since last mint
     *
     * @returns Transaction response
     *
     * @example
     * ```typescript
     * const receipt = await avatar.personalToken.mint();
     * console.log('Minted tokens, tx hash:', receipt.hash);
     * ```
     */
    mint: async (): Promise<TransactionReceipt> => {
      const mintTx = this.core.hubV2.personalMint();
      return await this.runner.sendTransaction!([mintTx]);
    },

    /**
     * Stop personal token minting
     * This permanently stops the ability to mint new personal tokens
     *
     * WARNING: This action is irreversible!
     *
     * @returns Transaction response
     *
     * @example
     * ```typescript
     * const receipt = await avatar.personalToken.stop();
     * console.log('Stopped minting, tx hash:', receipt.hash);
     * ```
     */
    stop: async (): Promise<TransactionReceipt> => {
      // Use the stop method from core
      const stopTx = this.core.hubV2.stop();
      return await this.runner.sendTransaction!([stopTx]);
    },
  };

  // ============================================================================
  // Profile methods are inherited from CommonAvatar
  // ============================================================================

  // ============================================================================
  // History methods are inherited from CommonAvatar
  // ============================================================================

  // Group token methods
  public readonly groupToken = {
    /**
     * Mint group tokens by transferring collateral to the group's mint handler
     * Uses pathfinding to transfer tokens along the trust network, including wrapped tokens
     *
     * @param group The group address to mint tokens from
     * @param amount Amount of tokens to transfer to the mint handler (in atto-circles)
     * @returns Transaction receipt
     *
     * @example
     * ```typescript
     * // Mint group tokens by sending 100 CRC to the group's mint handler
     * const receipt = await avatar.groupToken.mint('0xGroupAddress...', BigInt(100e18));
     * ```
     */
    mint: async (
      group: Address,
      amount: bigint
    ): Promise<TransactionReceipt> => {
      // Create BaseGroupContract instance to get mint handler
      const groupContract = new BaseGroupContract({
        address: group,
        rpcUrl: this.core.rpcUrl,
      });

      const mintHandler = await groupContract.BASE_MINT_HANDLER();

      // Use transferBuilder to construct transfer to mint handler with pathfinding
      // Include wrapped tokens in pathfinding
      const transactions = await this.transferBuilder.constructAdvancedTransfer(
        this.address,
        mintHandler,
        amount,
        { useWrappedBalances: true }
      );

      return await this.runner.sendTransaction!(transactions);
    },

    /**
     * Get the maximum amount that can be minted for a group
     * This calculates the maximum transferable amount to the group's mint handler
     * including wrapped token balances
     *
     * @param group The group address
     * @returns Maximum mintable amount in atto-circles
     *
     * @example
     * ```typescript
     * const maxMintable = await avatar.groupToken.getMaxMintableAmount('0xGroupAddress...');
     * console.log('Can mint up to:', maxMintable.toString(), 'atto-circles');
     * ```
     */
    getMaxMintableAmount: async (group: Address): Promise<bigint> => {
      // Create BaseGroupContract instance to get mint handler
      const groupContract = new BaseGroupContract({
        address: group,
        rpcUrl: this.core.rpcUrl,
      });

      const mintHandler = await groupContract.BASE_MINT_HANDLER();

      // Find max flow to mint handler including wrapped tokens
      return await this.rpc.pathfinder.findMaxFlow({
        from: this.address.toLowerCase() as Address,
        to: mintHandler.toLowerCase() as Address,
        useWrappedBalances: true,
      });
    },

    /**
     * Automatically redeem collateral tokens from a Base Group's treasury
     *
     * Performs automatic redemption by determining trusted collaterals and using pathfinder for optimal flow.
     * Only supports Base Group types. The function uses pathfinder to determine the optimal redemption path
     * and validates that sufficient liquidity exists before attempting redemption.
     *
     * @param group The address of the Base Group from which to redeem collateral tokens
     * @param amount The amount of group tokens to redeem for collateral (must be > 0 and <= max redeemable)
     * @returns A Promise resolving to the transaction receipt upon successful automatic redemption
     *
     * @example
     * ```typescript
     * // Redeem 100 group tokens for collateral
     * const receipt = await avatar.groupToken.redeem('0xGroupAddress...', BigInt(100e18));
     * ```
     */
    //@todo check
    redeem: async (
      group: Address,
      amount: bigint
    ): Promise<TransactionReceipt> => {
      group = group.toLowerCase() as Address;

      // Get group information to validate it's a Base Group
      // @todo replace with the request to the group contract
      const groupInfo = await this.rpc.token.getTokenInfo(group);
      if (!groupInfo) {
        throw SdkError.configError(`Group not found: ${group}`, { group });
      }

      // Validate it's a Base Group (supports CrcV2_RegisterGroup event type)
      // In V2, base groups are registered with CrcV2_RegisterGroup
      if (groupInfo.tokenType !== 'CrcV2_RegisterGroup') {
        throw SdkError.unsupportedOperation(
          'redeem',
          'Only Base Groups support this method'
        );
      }

      // Address of the redeemer
      const currentAvatar = this.address.toLowerCase() as Address;

      // Create BaseGroupContract instance to get treasury
      const groupContract = new BaseGroupContract({
        address: group,
        rpcUrl: this.core.rpcUrl,
      });

      const treasuryAddress = (await groupContract.BASE_TREASURY()).toLowerCase() as Address;

      // Get list of all tokens in the treasury
      const treasuryBalances = await this.rpc.balance.getTokenBalances(treasuryAddress);
      const treasuryTokens = treasuryBalances
        .filter((balance: any) => balance.isErc1155)
        .map((balance: any) => balance.tokenAddress.toLowerCase() as Address);

      // Get trust relationships to determine expected collateral tokens
      const trustRelationships = await this.rpc.trust.getAggregatedTrustRelations(currentAvatar);

      // Filter for tokens that:
      // 1. Are mutually trusted or trusted by current avatar
      // 2. Exist in the treasury
      const expectedToTokens = trustRelationships
        .filter((trustObject: AggregatedTrustRelation) => {
          if (
            (trustObject.relation === 'mutuallyTrusts' || trustObject.relation === 'trusts') &&
            treasuryTokens.includes(trustObject.objectAvatar.toLowerCase() as Address)
          ) {
            return true;
          }
          return false;
        })
        .map((trustObject: AggregatedTrustRelation) => trustObject.objectAvatar.toLowerCase() as Address);

      // Check if enough tokens as amount - validate max redeemable
      const maxRedeemableAmount = await this.rpc.pathfinder.findMaxFlow({
        from: currentAvatar,
        to: currentAvatar,
        useWrappedBalances: false,
        fromTokens: [group],
        toTokens: expectedToTokens,
      });

      if (BigInt(maxRedeemableAmount) < amount) {
        throw ValidationError.invalidAmount(
          amount,
          `Specified amount ${amount} exceeds max tokens flow ${maxRedeemableAmount}`
        );
      }

      // Construct the redemption transfer using TransferBuilder
      const transactions = await this.transferBuilder.constructAdvancedTransfer(
        currentAvatar,
        currentAvatar, // Redeem to self
        amount,
        {
          useWrappedBalances: false,
          fromTokens: [group], // Redeem from group tokens
          toTokens: expectedToTokens, // Receive trusted collateral tokens
        }
      );

      if (!transactions || transactions.length === 0) {
        throw SdkError.operationFailed('groupToken.redeem', 'No transactions generated');
      }

      return await this.runner.sendTransaction!(transactions);
    },

    properties: {
      /**
       * Get the owner of a specific group
       * @param group The group address
       * @returns The owner address of the group
       */
      owner: async (group: Address): Promise<Address> => {
        const groupContract = new BaseGroupContract({
          address: group,
          rpcUrl: this.core.rpcUrl,
        });
        return await groupContract.owner();
      },

      /**
       * Get the mint handler address of a specific group
       * @param group The group address
       * @returns The mint handler address
       */
      mintHandler: async (group: Address): Promise<Address> => {
        const groupContract = new BaseGroupContract({
          address: group,
          rpcUrl: this.core.rpcUrl,
        });
        return await groupContract.BASE_MINT_HANDLER();
      },

      /**
       * Get the treasury (redemption handler) address of a specific group
       * @param group The group address
       * @returns The treasury address where redemptions are handled
       */
      treasury: async (group: Address): Promise<Address> => {
        const groupContract = new BaseGroupContract({
          address: group,
          rpcUrl: this.core.rpcUrl,
        });
        return await groupContract.BASE_TREASURY();
      },

      /**
       * Get the service address of a specific group
       * @param group The group address
       * @returns The service address
       */
      service: async (group: Address): Promise<Address> => {
        const groupContract = new BaseGroupContract({
          address: group,
          rpcUrl: this.core.rpcUrl,
        });
        return await groupContract.service();
      },

      /**
       * Get the fee collection address of a specific group
       * @param group The group address
       * @returns The fee collection address
       */
      feeCollection: async (group: Address): Promise<Address> => {
        const groupContract = new BaseGroupContract({
          address: group,
          rpcUrl: this.core.rpcUrl,
        });
        return await groupContract.feeCollection();
      },

      /**
       * Get all membership conditions for a specific group
       * @param group The group address
       * @returns Array of membership condition addresses
       */
      getMembershipConditions: async (group: Address): Promise<Address[]> => {
        const groupContract = new BaseGroupContract({
          address: group,
          rpcUrl: this.core.rpcUrl,
        });
        const conditions = await groupContract.getMembershipConditions();
        return Array.from(conditions);
      },
    },

  };

  // Group methods (alias for groupToken)
  public readonly group = {
    properties: this.groupToken.properties,

    /**
     * Get group memberships for this avatar using cursor-based pagination
     *
     * Returns a PagedQuery instance for iterating through all groups that this avatar is a member of,
     * including membership details such as expiry time and when the membership was created.
     *
     * @param limit Number of memberships per page (default: 50)
     * @param sortOrder Sort order for results (default: 'DESC')
     * @returns PagedQuery instance for iterating through memberships
     *
     * @example
     * ```typescript
     * const query = avatar.group.getGroupMemberships();
     *
     * // Get first page
     * await query.queryNextPage();
     * console.log(`Member of ${query.currentPage.size} groups (page 1)`);
     *
     * // Iterate through all memberships
     * while (await query.queryNextPage()) {
     *   query.currentPage.results.forEach(membership => {
     *     console.log(`Group: ${membership.group}`);
     *     console.log(`Expiry: ${new Date(membership.expiryTime * 1000).toLocaleDateString()}`);
     *   });
     * }
     * ```
     */
    getGroupMemberships: (limit: number = 50, sortOrder: 'ASC' | 'DESC' = 'DESC') => {
      return this.rpc.group.getGroupMemberships(this.address, limit, sortOrder);
    },

    /**
     * Get detailed information about all groups this avatar is a member of
     *
     * This method fetches group memberships and enriches them with full group details including
     * name, symbol, owner, treasury, mint handler, member count, and other properties.
     *
     * @param limit Maximum number of memberships to return (default: 50)
     * @returns Array of group detail rows
     *
     * @example
     * ```typescript
     * // Get detailed information about all group memberships
     * const groups = await avatar.group.getGroupMembershipsWithDetails();
     *
     * groups.forEach(group => {
     *   console.log(`Group: ${group.name} (${group.symbol})`);
     *   console.log(`Owner: ${group.owner}`);
     *   console.log(`Member count: ${group.memberCount}`);
     *   console.log(`Treasury: ${group.treasury}`);
     * });
     * ```
     */
    getGroupMembershipsWithDetails: async (limit: number = 50): Promise<GroupRow[]> => {
      // Get memberships for this avatar using pagination
      const query = this.rpc.group.getGroupMemberships(this.address, limit);
      const memberships: GroupMembershipRow[] = [];

      // Fetch all memberships
      while (await query.queryNextPage()) {
        memberships.push(...query.currentPage!.results);
        if (!query.currentPage!.hasMore) break;
      }

      if (memberships.length === 0) {
        return [];
      }

      // Extract group addresses
      const groupAddresses = memberships.map((m: GroupMembershipRow) => m.group);

      // Fetch group details using groupAddressIn filter
      const groups = await this.rpc.group.findGroups(groupAddresses.length, {
        groupAddressIn: groupAddresses,
      });

      return groups;
    },
  };

  // ============================================================================
  // Wrap methods are inherited from CommonAvatar
  // ============================================================================

  // ============================================================================
  // Event Subscription Methods are inherited from CommonAvatar
  // ============================================================================

  // ============================================================================
  // Helper Methods are inherited from CommonAvatar
  // ============================================================================
}
