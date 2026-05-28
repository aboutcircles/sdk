import { Contract } from './contract.js';
import { affiliateGroupRegistryAbi } from '@aboutcircles/sdk-abis';
import { AFFILIATE_GROUP_NONE_SENTINEL, ZERO_ADDRESS, isZeroAddress, hexEq } from '@aboutcircles/sdk-utils';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * AffiliateGroupRegistry Contract Wrapper
 *
 * Records, per human avatar, which group is set as their affiliate group.
 *
 * The on-chain `setAffiliateGroup` requires the new group to be a Hub-registered
 * group, so it reverts on the zero address — there is no native way to "clear"
 * an affiliate group. This wrapper papers over that:
 *   - {@link setAffiliateGroup} substitutes a sentinel group
 *     ({@link AFFILIATE_GROUP_NONE_SENTINEL}) when asked to set the zero address,
 *     so the tx succeeds and effectively means "no affiliate group".
 *   - {@link affiliateGroup} maps that sentinel back to the zero address when
 *     reading, so callers never see the sentinel.
 */
export class AffiliateGroupRegistryContract extends Contract<typeof affiliateGroupRegistryAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: affiliateGroupRegistryAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Set the caller's affiliate group.
   *
   * Pass the zero address to clear the affiliate group: the SDK sends the
   * sentinel group on-chain (the registry rejects the zero address), which
   * {@link affiliateGroup} reads back as zero.
   *
   * @param newGroup The group to register, or the zero address to clear it
   * @returns Transaction request
   */
  setAffiliateGroup(newGroup: Address): TransactionRequest {
    const group = isZeroAddress(newGroup) ? AFFILIATE_GROUP_NONE_SENTINEL : newGroup;
    return {
      to: this.address,
      data: this.encodeWrite('setAffiliateGroup', [group]),
      value: BigInt(0),
    };
  }

  /**
   * Read the affiliate group set for a human avatar.
   *
   * Returns the zero address when no affiliate group is set — both when the
   * registry holds nothing and when it holds the sentinel group the SDK uses to
   * represent "cleared".
   *
   * @param human The avatar whose affiliate group to read
   * @returns The affiliate group address, or the zero address when none is set
   */
  async affiliateGroup(human: Address): Promise<Address> {
    const group = (await this.read('affiliateGroup', [human])) as Address;
    return hexEq(group, AFFILIATE_GROUP_NONE_SENTINEL) ? ZERO_ADDRESS : group;
  }

  /**
   * Get the Hub contract address the registry was deployed against.
   * @returns The Hub address
   */
  async hub(): Promise<Address> {
    return this.read('hub') as Promise<Address>;
  }
}
