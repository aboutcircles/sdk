import { Contract } from '../contract';
import { referralsModuleMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Minimal ReferralsModule Contract for InvitationBuilder
 * Contains only the methods required for building invitation transactions
 */
export class ReferralsModuleContractMinimal extends Contract<typeof referralsModuleMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: referralsModuleMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Pre-deploys a Safe for an origin inviter's offchain signer
   * @param signer The public address derived from the origin inviter's offchain secret key
   * @returns Transaction request
   */
  createAccount(signer: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('createAccount', [signer]),
      value: 0n,
    };
  }

  /**
   * Batch pre-deploys Safes for multiple signers
   * @param signers The list of public addresses derived from origin inviters' offchain secrets
   * @returns Transaction request
   */
  createAccounts(signers: Address[]): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('createAccounts', [signers]),
      value: 0n,
    };
  }
}
