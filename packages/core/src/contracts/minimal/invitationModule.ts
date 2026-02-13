import { Contract } from '../contract';
import { invitationModuleMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Minimal InvitationModule Contract for inviter trust setup.
 * The address is the InvitationModule contract address.
 */
export class InvitationModuleContractMinimal extends Contract<typeof invitationModuleMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: invitationModuleMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  trustInviter(inviter: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('trustInviter', [inviter]),
      value: 0n,
    };
  }
}
