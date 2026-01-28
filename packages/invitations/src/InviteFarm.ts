import type { Address, CirclesConfig, TransactionRequest, Hex } from '@aboutcircles/sdk-types';
import {
  InvitationFarmContractMinimal,
  ReferralsModuleContractMinimal,
  HubV2ContractMinimal
} from '@aboutcircles/sdk-core/minimal';
import { InvitationError } from './errors';
import type { ReferralPreviewList } from './types';
import { Invitations } from './Invitations';
import {
  generatePrivateKey,
  privateKeyToAddress,
  encodeAbiParameters,
  INVITATION_FEE
} from '@aboutcircles/sdk-utils';

export interface GeneratedInvite {
  secret: Hex;
  signer: Address;
}

export interface GenerateInvitesResult {
  invites: GeneratedInvite[];
  transactions: TransactionRequest[];
}

/**
 * InviteFarm handles batch invitation generation via the InvitationFarm contract
 *
 * This class provides methods to generate multiple invitations at once using
 * the InvitationFarm contract, which manages a farm of InvitationBot instances.
 */
export class InviteFarm {
  private config: CirclesConfig;
  private invitations: Invitations;
  private invitationFarm: InvitationFarmContractMinimal;
  private referralsModule: ReferralsModuleContractMinimal;
  private hubV2: HubV2ContractMinimal;

  constructor(config: CirclesConfig) {
    this.config = config;
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

  /**
   * Get the remaining invite quota for a specific inviter
   */
  async getQuota(inviter: Address): Promise<bigint> {
    return this.invitationFarm.inviterQuota(inviter);
  }

  /**
   * Get the invitation fee (96 CRC)
   */
  async getInvitationFee(): Promise<bigint> {
    return this.invitationFarm.invitationFee();
  }

  /**
   * Get the invitation module address from the farm
   */
  async getInvitationModule(): Promise<Address> {
    return this.invitationFarm.invitationModule();
  }

  /**
   * Generate batch invitations using the InvitationFarm
   *
   * This method:
   * 1. Simulates claimInvites to get token IDs that will be claimed
   * 2. Generates random secrets and derives signer addresses
   * 3. Builds transaction batch: claimInvites + safeBatchTransferFrom
   *
   * @param inviter - Address of the inviter (must have quota)
   * @param count - Number of invitations to generate
   * @returns Generated invites with secrets/signers and transactions to execute
   */
  async generateInvites(inviter: Address, count: number): Promise<GenerateInvitesResult> {
    if (count <= 0) {
      throw new InvitationError('Count must be greater than 0', {
        code: 'INVITATION_INVALID_COUNT',
        source: 'VALIDATION',
        context: { count },
      });
    }

    const inviterLower = inviter.toLowerCase() as Address;
    const numberOfInvites = BigInt(count);

    // Step 1: Simulate claimInvites to get token IDs
    const ids = await this.invitationFarm.read('claimInvites', [numberOfInvites], {
      from: inviterLower
    }) as bigint[];

    if (!ids || ids.length === 0) {
      throw new InvitationError('No invitation IDs returned from claimInvites', {
        code: 'INVITATION_NO_IDS',
        source: 'INVITATIONS',
        context: { inviter: inviterLower, count },
      });
    }

    // Step 2: Generate secrets and signers
    const invites: GeneratedInvite[] = [];
    const signers: Address[] = [];

    for (let i = 0; i < count; i++) {
      const secret = generatePrivateKey();
      const signer = privateKeyToAddress(secret).toLowerCase() as Address;
      invites.push({ secret, signer });
      signers.push(signer);
    }

    // Step 3: Get addresses
    const invitationModuleAddress = await this.invitationFarm.invitationModule();

    // Step 4: Build transactions
    const claimTx = this.invitationFarm.claimInvites(numberOfInvites);

    // Encode createAccounts call
    const createAccountsTx = this.referralsModule.createAccounts(signers);
    const createAccountsData = createAccountsTx.data as Hex;

    // Encode data for safeBatchTransferFrom
    const encodedData = encodeAbiParameters(
      ['address', 'bytes'],
      [this.config.referralsModuleAddress, createAccountsData]
    );

    // Build amounts array (96 CRC per invite)
    const amounts = ids.map(() => INVITATION_FEE);

    const batchTransferTx = this.hubV2.safeBatchTransferFrom(
      inviterLower,
      invitationModuleAddress,
      ids,
      amounts,
      encodedData
    );

    // Save all referrals to database
    await Promise.all(
      invites.map((inv) => this.invitations.saveReferralData(inviterLower, inv.secret))
    );

    return {
      invites,
      transactions: [claimTx, batchTransferTx],
    };
  }

  /**
   * List referrals for a given inviter with key previews
   *
   * @param inviter - Address of the inviter
   * @param limit - Maximum number of referrals to return (default 10)
   * @param offset - Number of referrals to skip for pagination (default 0)
   * @returns Paginated list of referral previews with masked keys
   */
  async listReferrals(
    inviter: Address,
    limit: number = 10,
    offset: number = 0
  ): Promise<ReferralPreviewList> {
    return this.invitations.listReferrals(inviter, limit, offset);
  }
}
