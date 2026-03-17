import type {
  Address,
  ContractRunner,
  Profile,
  AvatarRow,
  TokenBalanceRow,
  AggregatedTrustRelation } from '@aboutcircles/sdk-types';
import type { TransactionReceipt } from 'viem';
import type { Core } from '@aboutcircles/sdk-core';
import { BaseGroupContract } from '@aboutcircles/sdk-core';
import { cidV0ToHex } from '@aboutcircles/sdk-utils/cid';
import { ValidationError } from '@aboutcircles/sdk-utils/errors';
import { SdkError } from '../errors';
import { CommonAvatar } from './CommonAvatar';

/**
 * BaseGroupAvatar class implementation
 * Provides a simplified wrapper around Circles protocol for base group avatars
 *
 * This class represents a base group avatar in the Circles ecosystem and provides
 * methods for managing trust relationships, group properties, and metadata.
 */
export class BaseGroupAvatar extends CommonAvatar {
  private readonly baseGroup: BaseGroupContract;

  constructor(
    address: Address,
    core: Core,
    contractRunner?: ContractRunner,
    avatarInfo?: AvatarRow
  ) {
    super(address, core, contractRunner, avatarInfo);

    // Initialize BaseGroup contract
    this.baseGroup = new BaseGroupContract({
      address: this.address,
      rpcUrl: core.rpcUrl,
    });
  }

  // ============================================================================
  // Override Balance Methods
  // ============================================================================

  public readonly balances = {
    getTotal: async (): Promise<bigint> => {
      return await this.rpc.balance.getTotalBalance(this.address);
    },

    getTokenBalances: async (): Promise<TokenBalanceRow[]> => {
      return await this.rpc.balance.getTokenBalances(this.address) as unknown as TokenBalanceRow[];
    },

    /**
     * Get total supply of this group's token
     */
    getTotalSupply: async (): Promise<bigint> => {
      const tokenId = await this.core.hubV2.toTokenId(this.address);
      return await this.core.hubV2.totalSupply(tokenId);
    },
  };

  // ============================================================================
  // Extend Trust Methods with Group-Specific Features
  // ============================================================================
  // We override add/remove to use baseGroup.trust() instead of hubV2.trust()
  // View methods (isTrusting, isTrustedBy, getAll) are inherited from CommonAvatar

  public override readonly trust = {
    add: async (
      avatar: Address | Address[],
      expiry?: bigint
    ): Promise<TransactionReceipt> => {
      const trustExpiry = expiry ?? BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFF');
      const avatars = Array.isArray(avatar) ? avatar : [avatar];

      if (avatars.length === 0) {
        throw ValidationError.missingParameter('avatar');
      }

      const transactions = avatars.map((trustee) =>
        this.baseGroup.trust(trustee, trustExpiry)
      );

      return await this.runner.sendTransaction!(transactions);
    },

    remove: async (avatar: Address | Address[]): Promise<TransactionReceipt> => {
      const avatars = Array.isArray(avatar) ? avatar : [avatar];

      if (avatars.length === 0) {
        throw ValidationError.missingParameter('avatar');
      }

      const untrustExpiry = BigInt(0);

      const transactions = avatars.map((trustee) =>
        this.baseGroup.trust(trustee, untrustExpiry)
      );

      return await this.runner.sendTransaction!(transactions);
    },

    // View methods - same implementation as CommonAvatar
    isTrusting: async (otherAvatar: Address): Promise<boolean> => {
      return await this.core.hubV2.isTrusted(this.address, otherAvatar);
    },

    isTrustedBy: async (otherAvatar: Address): Promise<boolean> => {
      return await this.core.hubV2.isTrusted(otherAvatar, this.address);
    },

    getAll: async (): Promise<AggregatedTrustRelation[]> => {
      return await this.rpc.trust.getAggregatedTrustRelations(this.address);
    },

    /**
     * Trust a batch of members with membership condition checks
     *
     * This is a group-specific method that validates members against membership conditions
     * before establishing trust.
     *
     * @param members Array of member addresses
     * @param expiry Trust expiry timestamp. Defaults to 0
     * @returns Transaction response
     *
     * @example
     * ```typescript
     * // Trust multiple members with condition checks
     * await groupAvatar.trust.addBatchWithConditions(
     *   ['0x123...', '0x456...', '0x789...'],
     *   BigInt(Date.now() / 1000 + 31536000) // 1 year expiry
     * );
     * ```
     */
    addBatchWithConditions: async (
      members: Address[],
      expiry?: bigint
    ): Promise<TransactionReceipt> => {
      const trustExpiry = expiry ?? BigInt(0);
      const tx = this.baseGroup.trustBatchWithConditions(members, trustExpiry);
      return await this.runner.sendTransaction!([tx]);
    },
  };

  // ============================================================================
  // Override Profile Methods to use baseGroup instead of nameRegistry
  // ============================================================================
  // get() and update() methods are the same as CommonAvatar
  // updateMetadata and registerShortName use baseGroup instead of nameRegistry

  public override readonly profile = {
    get: async (): Promise<Profile | undefined> => {
      const profileCid = this.avatarInfo?.cidV0;

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

    update: async (profile: Profile): Promise<string> => {
      const cid = await this.profiles.create(profile);
      if (!cid) {
        throw SdkError.configError('Profile service did not return a CID', { profile });
      }

      const updateReceipt = await this.profile.updateMetadata(cid);
      if (!updateReceipt) {
        throw SdkError.configError('Failed to update metadata digest in name registry', { cid });
      }

      if (this.avatarInfo) {
        this.avatarInfo.cidV0 = cid;
      }

      this._cachedProfile = undefined;
      this._cachedProfileCid = undefined;

      return cid;
    },

    updateMetadata: async (cid: string): Promise<TransactionReceipt> => {
      const cidHex = cidV0ToHex(cid);
      const updateTx = this.baseGroup.updateMetadataDigest(cidHex as `0x${string}`);
      return await this.runner.sendTransaction!([updateTx]);
    },

    registerShortName: async (nonce: number): Promise<TransactionReceipt> => {
      const registerTx = this.baseGroup.registerShortNameWithNonce(BigInt(nonce));
      return await this.runner.sendTransaction!([registerTx]);
    },
  };

  // ============================================================================
  // Group-Specific Property Methods
  // ============================================================================

  public readonly properties = {
    /**
     * Get the owner of this group
     */
    owner: async (): Promise<Address> => {
      return await this.baseGroup.owner();
    },

    /**
     * Get the mint handler address
     */
    mintHandler: async (): Promise<Address> => {
      return await this.baseGroup.BASE_MINT_HANDLER();
    },

    /**
     * Get the service address
     */
    service: async (): Promise<Address> => {
      return await this.baseGroup.service();
    },

    /**
     * Get the fee collection address
     */
    feeCollection: async (): Promise<Address> => {
      return await this.baseGroup.feeCollection();
    },

    /**
     * Get all membership conditions
     */
    getMembershipConditions: async (): Promise<Address[]> => {
      const conditions = await this.baseGroup.getMembershipConditions();
      return Array.from(conditions);
    },
  };

  // ============================================================================
  // Group Property Setters
  // ============================================================================

  public readonly setProperties = {
    /**
     * Set a new owner for this group
     */
    owner: async (newOwner: Address): Promise<TransactionReceipt> => {
      const tx = this.baseGroup.setOwner(newOwner);
      return await this.runner.sendTransaction!([tx]);
    },

    /**
     * Set a new service address
     */
    service: async (newService: Address): Promise<TransactionReceipt> => {
      const tx = this.baseGroup.setService(newService);
      return await this.runner.sendTransaction!([tx]);
    },

    /**
     * Set a new fee collection address
     */
    feeCollection: async (newFeeCollection: Address): Promise<TransactionReceipt> => {
      const tx = this.baseGroup.setFeeCollection(newFeeCollection);
      return await this.runner.sendTransaction!([tx]);
    },

    /**
     * Enable or disable a membership condition
     */
    membershipCondition: async (
      condition: Address,
      enabled: boolean
    ): Promise<TransactionReceipt> => {
      const tx = this.baseGroup.setMembershipCondition(condition, enabled);
      return await this.runner.sendTransaction!([tx]);
    },
  };
}
