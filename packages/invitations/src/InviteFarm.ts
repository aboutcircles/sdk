import type { Address, CirclesConfig, TransactionRequest, Hex } from '@aboutcircles/sdk-types';
import {
  InvitationFarmContractMinimal,
  ReferralsModuleContractMinimal,
  HubV2ContractMinimal
} from '@aboutcircles/sdk-core/minimal';
import { InvitationError } from './errors';
import type { ReferralPreviewList } from './types';
import { Invitations } from './Invitations';
import { encodeAbiParameters, INVITATION_FEE } from '@aboutcircles/sdk-utils';

export interface GeneratedReferral {
  secret: Hex;
  signer: Address;
}

export interface GenerateReferralsResult {
  referrals: GeneratedReferral[];
  transactions: TransactionRequest[];
}

export interface GenerateInvitesResult {
  invitees: Address[];
  transactions: TransactionRequest[];
}

/**
 * InviteFarm handles batch invitation generation via the InvitationFarm contract.
 * Manages a farm of InvitationBot instances for generating multiple invitations at once.
 */
export class InviteFarm {
  private readonly referralsModuleAddress: Address;
  private readonly invitations: Invitations;
  private readonly invitationFarm: InvitationFarmContractMinimal;
  private readonly referralsModule: ReferralsModuleContractMinimal;
  private readonly hubV2: HubV2ContractMinimal;

  constructor(config: CirclesConfig) {
    this.referralsModuleAddress = config.referralsModuleAddress;
    this.invitations = new Invitations(config);
    this.invitationFarm = new InvitationFarmContractMinimal({
      address: config.invitationFarmAddress,
      rpcUrl: config.circlesRpcUrl,
    });
    this.referralsModule = new ReferralsModuleContractMinimal({
      address: config.referralsModuleAddress,
      rpcUrl: config.circlesRpcUrl,
    });
    this.hubV2 = new HubV2ContractMinimal({
      address: config.v2HubAddress,
      rpcUrl: config.circlesRpcUrl,
    });
  }

  /** Get the remaining invite quota for a specific inviter */
  async getQuota(inviter: Address): Promise<bigint> {
    return this.invitationFarm.inviterQuota(inviter);
  }

  /** Get the invitation fee (96 CRC) */
  async getInvitationFee(): Promise<bigint> {
    return this.invitationFarm.invitationFee();
  }

  /** Get the invitation module address from the farm */
  async getInvitationModule(): Promise<Address> {
    return this.invitationFarm.invitationModule();
  }

  /**
   * Generate batch referrals using the InvitationFarm.
   * Creates new secrets/signers for users who don't have a Safe yet.
   * The transfer data encodes the ReferralsModule address + createAccount calldata.
   * @param inviter Address of the inviter (must have quota)
   * @param count Number of referrals to generate
   */
  async generateReferrals(inviter: Address, count: number): Promise<GenerateReferralsResult> {
    if (count <= 0) {
      throw new InvitationError('Count must be greater than 0', {
        code: 'INVITATION_INVALID_COUNT',
        source: 'VALIDATION',
        context: { count },
      });
    }

    const inviterLower = inviter.toLowerCase() as Address;
    const isSingle = count === 1;

    const ids = await this.simulateClaim(inviterLower, count);
    if (!ids.length) {
      throw new InvitationError('No invitation IDs returned from claim', {
        code: 'INVITATION_NO_IDS',
        source: 'INVITATIONS',
        context: { inviter: inviterLower, count },
      });
    }

    const referrals = this.invitations.generateSecrets(count);
    const signers = referrals.map(r => r.signer);
    const invitationModule = await this.invitationFarm.invitationModule();

    const claimTx = isSingle
      ? this.invitationFarm.claimInvite()
      : this.invitationFarm.claimInvites(BigInt(count));

    const transferTx = isSingle
      ? this.buildReferralTransfer(inviterLower, invitationModule, ids[0], signers[0])
      : this.buildBatchReferralTransfer(inviterLower, invitationModule, ids, signers);

    // @dev ignore saving referral data for now
    // await Promise.all(
    //   referrals.map(r => this.invitations.saveReferralData(inviterLower, r.secret))
    //);

    return { referrals, transactions: [claimTx, transferTx] };
  }

  /**
   * Generate invitations for existing accounts using the InvitationFarm.
   * Invites users who already have a Safe wallet but are not registered in Circles Hub.
   * The transfer data encodes the invitee address(es) directly (no Safe creation).
   * @param inviter Address of the inviter (must have quota)
   * @param invitees Array of addresses to invite (must have existing Safe wallets)
   */
  async generateInvites(inviter: Address, invitees: Address[]): Promise<GenerateInvitesResult> {
    if (invitees.length === 0) {
      throw new InvitationError('At least one invitee address must be provided', {
        code: 'INVITATION_INVALID_COUNT',
        source: 'VALIDATION',
        context: { count: 0 },
      });
    }

    const inviterLower = inviter.toLowerCase() as Address;
    const inviteesLower = invitees.map(a => a.toLowerCase() as Address);
    const count = inviteesLower.length;
    const isSingle = count === 1;

    const ids = await this.simulateClaim(inviterLower, count);
    if (!ids.length) {
      throw new InvitationError('No invitation IDs returned from claim', {
        code: 'INVITATION_NO_IDS',
        source: 'INVITATIONS',
        context: { inviter: inviterLower, count },
      });
    }

    const invitationModule = await this.invitationFarm.invitationModule();

    const claimTx = isSingle
      ? this.invitationFarm.claimInvite()
      : this.invitationFarm.claimInvites(BigInt(count));

    const transferTx = isSingle
      ? this.buildInviteTransfer(inviterLower, invitationModule, ids[0], inviteesLower[0])
      : this.buildBatchInviteTransfer(inviterLower, invitationModule, ids, inviteesLower);

    return { invitees: inviteesLower, transactions: [claimTx, transferTx] };
  }

  /**
   * List referrals for a given inviter with key previews
   * @param inviter Address of the inviter
   * @param limit Max referrals to return (default 10)
   * @param offset Pagination offset (default 0)
   */
  async listReferrals(inviter: Address, limit = 10, offset = 0): Promise<ReferralPreviewList> {
    return this.invitations.listReferrals(inviter, limit, offset);
  }

  /** Simulate claim to get token IDs that will be claimed */
  private async simulateClaim(inviter: Address, count: number): Promise<bigint[]> {
    if (count === 1) {
      const id = await this.invitationFarm.read('claimInvite', [], { from: inviter }) as bigint;
      return [id];
    }
    return this.invitationFarm.read('claimInvites', [BigInt(count)], { from: inviter }) as Promise<bigint[]>;
  }

  /** Build single safeTransferFrom with createAccount calldata (for referrals - new users) */
  private buildReferralTransfer(
    from: Address,
    to: Address,
    id: bigint,
    signer: Address
  ): TransactionRequest {
    const calldata = this.referralsModule.createAccount(signer).data as Hex;
    const data = encodeAbiParameters(['address', 'bytes'], [this.referralsModuleAddress, calldata]);
    return this.hubV2.safeTransferFrom(from, to, id, INVITATION_FEE, data);
  }

  /** Build batch safeBatchTransferFrom with createAccounts calldata (for referrals - new users) */
  private buildBatchReferralTransfer(
    from: Address,
    to: Address,
    ids: bigint[],
    signers: Address[]
  ): TransactionRequest {
    const calldata = this.referralsModule.createAccounts(signers).data as Hex;
    const data = encodeAbiParameters(['address', 'bytes'], [this.referralsModuleAddress, calldata]);
    const amounts = ids.map(() => INVITATION_FEE);
    return this.hubV2.safeBatchTransferFrom(from, to, ids, amounts, data);
  }

  /** Build single safeTransferFrom with invitee address encoded (for existing accounts) */
  private buildInviteTransfer(
    from: Address,
    to: Address,
    id: bigint,
    invitee: Address
  ): TransactionRequest {
    const data = encodeAbiParameters(['address'], [invitee]);
    return this.hubV2.safeTransferFrom(from, to, id, INVITATION_FEE, data);
  }

  /** Build batch safeBatchTransferFrom with invitee addresses encoded (for existing accounts) */
  private buildBatchInviteTransfer(
    from: Address,
    to: Address,
    ids: bigint[],
    invitees: Address[]
  ): TransactionRequest {
    const data = encodeAbiParameters(['address[]'], [invitees]);
    const amounts = ids.map(() => INVITATION_FEE);
    return this.hubV2.safeBatchTransferFrom(from, to, ids, amounts, data);
  }
}
