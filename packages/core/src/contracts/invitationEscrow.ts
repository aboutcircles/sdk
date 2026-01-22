import { Contract } from './contract';
import { invitationEscrowAbi } from '@aboutcircles/sdk-abis/invitationEscrow';
import type { Address, TransactionRequest, EscrowedAmountAndDays } from '@aboutcircles/sdk-types';

/**
 * InvitationEscrow Contract Wrapper
 * Provides type-safe methods for interacting with the InvitationEscrow contract
 *
 * This contract manages invitation escrows of CRC tokens between inviters and invitees,
 * applying demurrage over time and allowing redemption or revocation of invitations.
 */
export class InvitationEscrowContract extends Contract<typeof invitationEscrowAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: invitationEscrowAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Redeem the invitation escrow from a specific inviter
   * @param inviter The address of the inviter whose escrowed invitation is being redeemed
   * @returns Transaction request
   */
  redeemInvitation(inviter: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('redeemInvitation', [inviter]),
      value: BigInt(0),
    };
  }

  /**
   * Revoke a single invitation escrow
   * @param invitee The address of the invitee whose escrow is being revoked
   * @returns Transaction request
   */
  revokeInvitation(invitee: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('revokeInvitation', [invitee]),
      value: BigInt(0),
    };
  }

  /**
   * Revoke all active invitation escrows
   * @returns Transaction request
   */
  revokeAllInvitations(): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('revokeAllInvitations', []),
      value: BigInt(0),
    };
  }

  /**
   * Get all active inviters for a given invitee
   * @param invitee The address whose inviter list is requested
   * @returns Array of inviter addresses
   */
  async getInviters(invitee: Address): Promise<Address[]> {
    return this.read('getInviters', [invitee]) as Promise<Address[]>;
  }

  /**
   * Get all active invitees for a given inviter
   * @param inviter The address whose invitee list is requested
   * @returns Array of invitee addresses
   */
  async getInvitees(inviter: Address): Promise<Address[]> {
    return this.read('getInvitees', [inviter]) as Promise<Address[]>;
  }

  /**
   * Get the current escrowed amount (after demurrage) and days since last update
   * @param inviter The address of the inviter in the pair
   * @param invitee The address of the invitee in the pair
   * @returns Object containing escrowedAmount (after demurrage) and days_ since last update
   */
  async getEscrowedAmountAndDays(inviter: Address, invitee: Address): Promise<EscrowedAmountAndDays> {
    const [escrowedAmount, days_] = (await this.read('getEscrowedAmountAndDays', [inviter, invitee])) as [bigint, bigint];
    return { escrowedAmount, days_ };
  }
}
