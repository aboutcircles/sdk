import type {
  Address,
  AvatarRow,
  ContractRunner,
  TokenBalanceRow,
  AggregatedTrustRelation
} from '@aboutcircles/sdk-types';
import type { TransactionReceipt } from 'viem';
import type { Core } from '@aboutcircles/sdk-core';
import { ValidationError } from '@aboutcircles/sdk-utils';
import { SdkError } from '../errors';
import { BaseGroupContract } from '@aboutcircles/sdk-core';
import { CommonAvatar, type PathfindingOptions } from './CommonAvatar';

/**
 * OrganisationAvatar class implementation
 * Provides a simplified, user-friendly wrapper around Circles protocol for organisation avatars
 *
 * This class represents an organisation avatar in the Circles ecosystem.
 * Unlike human avatars, organisations cannot mint personal CRC tokens and do not require invitations.
 * They can manage trust relationships, make transfers, and interact with group tokens.
 */
export class OrganisationAvatar extends CommonAvatar {
  constructor(
    address: Address,
    core: Core,
    contractRunner?: ContractRunner,
    avatarInfo?: AvatarRow
  ) {
    super(address, core, contractRunner, avatarInfo);
  }

  // ============================================================================
  // Override Balance Methods with Organisation-Specific Features
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
    getMaxReplenishable: async (options?: PathfindingOptions): Promise<bigint> => {
      const addr = this.address.toLowerCase() as Address;

      // Find maximum flow from avatar to itself, targeting personal tokens as destination
      // This effectively asks: "How much can I convert to my own personal tokens?"
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
  // Group Token Methods
  // ============================================================================

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
     * Note: Organizations don't have personal tokens. This method uses the tokens held by the organization
     * (which are other avatars' tokens or other group tokens) to redeem from the specified group.
     *
     * @param group The address of the Base Group from which to redeem collateral tokens
     * @param amount The amount of group tokens to redeem for collateral (must be > 0 and <= max redeemable)
     * @returns A Promise resolving to the transaction receipt upon successful automatic redemption
     *
     * @example
     * ```typescript
     * // Redeem 100 group tokens for collateral
     * const receipt = await orgAvatar.groupToken.redeem('0xGroupAddress...', BigInt(100e18));
     * ```
     */
    redeem: async (
      group: Address,
      amount: bigint
    ): Promise<TransactionReceipt> => {
      group = group.toLowerCase() as Address;

      // Get group information to validate it's a Base Group
      const groupInfo = await this.rpc.token.getTokenInfo(group);
      if (!groupInfo) {
        throw SdkError.configError(`Group not found: ${group}`, { group });
      }

      // Validate it's a Base Group (supports CrcV2_RegisterGroup event type)
      if (groupInfo.tokenType !== 'CrcV2_RegisterGroup') {
        throw SdkError.unsupportedOperation(
          'redeem',
          'Only Base Groups support this method'
        );
      }

      // Address of the redeemer (this organization)
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
      // Note: Organizations don't have personal tokens, so we use whatever tokens they hold
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
  };

  // ============================================================================
  // Wrap methods are inherited from CommonAvatar
  // ============================================================================

  // ============================================================================
  // Helper Methods are inherited from CommonAvatar
  // ============================================================================
}
