import { Contract } from '../contract.js';
import { gnosisPayInviteQuotaGranteeMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Minimal GnosisPayInviteQuotaGrantee Contract.
 *
 * Lets Gnosis Pay Circles users claim free invites: claiming grants the caller
 * invite quota in the InvitationFarm (via the InvitationQuotaGrantModule), so a
 * subsequent `claimInvite()` succeeds without the inviter having to fund 96 CRC.
 */
export class GnosisPayInviteQuotaGranteeContractMinimal extends Contract<
  typeof gnosisPayInviteQuotaGranteeMinimalAbi
> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: gnosisPayInviteQuotaGranteeMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * How many free invites `inviter` can still claim right now.
   * Returns 0 when the address is not an eligible Gnosis Pay user or has
   * already claimed its allowance.
   */
  async claimableFreeInvites(inviter: Address): Promise<bigint> {
    return this.read('claimableFreeInvites', [inviter]) as Promise<bigint>;
  }

  /** Claim a single free invite — grants the caller +1 quota in the farm. */
  claimFreeInvite(): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimFreeInvite', []),
      value: 0n,
    };
  }
}
