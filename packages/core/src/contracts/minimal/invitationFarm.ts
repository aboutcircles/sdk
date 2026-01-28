import { Contract } from '../contract';
import { invitationFarmMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Minimal InvitationFarm Contract for InviteFarm
 * Contains only the methods required for generating batch invitations
 */
export class InvitationFarmContractMinimal extends Contract<typeof invitationFarmMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: invitationFarmMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  claimInvites(numberOfInvites: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimInvites', [numberOfInvites]),
      value: 0n,
    };
  }

  async inviterQuota(inviter: Address): Promise<bigint> {
    return this.read('inviterQuota', [inviter]) as Promise<bigint>;
  }

  async invitationFee(): Promise<bigint> {
    return this.read('INVITATION_FEE') as Promise<bigint>;
  }

  async invitationModule(): Promise<Address> {
    return this.read('invitationModule') as Promise<Address>;
  }
}
