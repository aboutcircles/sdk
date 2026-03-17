import { Contract } from './contract';
import { invitationFarmAbi } from '@aboutcircles/sdk-abis/invitationFarm';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * InvitationFarm Contract Wrapper
 * Provides type-safe methods for interacting with the InvitationFarm contract
 *
 * This contract manages a farm of InvitationBot instances, distributes/claims invite capacity,
 * and grows the farm. Users can claim invites from the farm using their allocated quota.
 */
export class InvitationFarmContract extends Contract<typeof invitationFarmAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: invitationFarmAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Claims multiple invites for the caller, consuming their quota
   * @param numberOfInvites Number of invites to claim
   * @returns Transaction request
   */
  claimInvites(numberOfInvites: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimInvites', [numberOfInvites]),
      value: BigInt(0),
    };
  }

  /**
   * Claims a single invite for the caller, consuming their quota by 1
   * @returns Transaction request
   */
  claimInvite(): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimInvite', []),
      value: BigInt(0),
    };
  }

  /**
   * Get the invitation fee amount in CRC (cost per invite)
   * @returns The invitation fee constant
   */
  async invitationFee(): Promise<bigint> {
    return this.read('INVITATION_FEE') as Promise<bigint>;
  }

  /**
   * Get the remaining invite quota for a specific inviter
   * @param inviter The address of the inviter
   * @returns The remaining quota
   */
  async inviterQuota(inviter: Address): Promise<bigint> {
    return this.read('inviterQuota', [inviter]) as Promise<bigint>;
  }

  /**
   * Get the total number of bots in the farm
   * @returns The total number of bots
   */
  async totalBots(): Promise<bigint> {
    return this.read('totalBots') as Promise<bigint>;
  }

  /**
   * Get the admin address
   * @returns The admin address
   */
  async admin(): Promise<Address> {
    return this.read('admin') as Promise<Address>;
  }

  /**
   * Get the maintainer address
   * @returns The maintainer address
   */
  async maintainer(): Promise<Address> {
    return this.read('maintainer') as Promise<Address>;
  }

  /**
   * Get the seeder address
   * @returns The seeder address
   */
  async seeder(): Promise<Address> {
    return this.read('seeder') as Promise<Address>;
  }

  /**
   * Get the invitation module address
   * @returns The invitation module address
   */
  async invitationModule(): Promise<Address> {
    return this.read('invitationModule') as Promise<Address>;
  }

  /**
   * Get the last used bot in the round-robin allocation
   * @returns The address of the last used bot
   */
  async lastUsedBot(): Promise<Address> {
    return this.read('lastUsedBot') as Promise<Address>;
  }

  /**
   * Get the next bot in the linked list for a given bot
   * @param bot The bot address
   * @returns The next bot address
   */
  async bots(bot: Address): Promise<Address> {
    return this.read('bots', [bot]) as Promise<Address>;
  }
}
