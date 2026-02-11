import type { Address, TransactionRequest, CirclesConfig, Hex } from '@aboutcircles/sdk-types';
import { RpcClient, PathfinderMethods, TrustMethods } from '@aboutcircles/sdk-rpc';
import { HubV2ContractMinimal, ReferralsModuleContractMinimal, InvitationFarmContractMinimal } from '@aboutcircles/sdk-core/minimal';
import { InvitationError } from './errors';
import type { ReferralPreviewList } from './types';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import {
  hexToBytes,
  INVITATION_FEE,
  MAX_FLOW,
  generatePrivateKey,
  privateKeyToAddress,
  encodeAbiParameters,
  keccak256,
  SAFE_PROXY_FACTORY,
  ACCOUNT_INITIALIZER_HASH,
  ACCOUNT_CREATION_CODE_HASH,
  checksumAddress,
  GNOSIS_GROUP_ADDRESS,
  FARM_DESTINATION
} from '@aboutcircles/sdk-utils';

export interface ProxyInviter {
  address: Address;
  possibleInvites: number;
}

/**
 * Token address used for farm-based invitations (same as Gnosis group address)
 */
const FARM_TO_TOKEN = GNOSIS_GROUP_ADDRESS;

/**
 * Invitations handles invitation operations for Circles
 * Supports both referral invitations (new users) and direct invitations (existing Safe wallets)
 */
export class Invitations {
  private config: CirclesConfig;
  private rpcClient: RpcClient;
  private pathfinder: PathfinderMethods;
  private trust: TrustMethods;
  private hubV2: HubV2ContractMinimal;
  private referralsModule: ReferralsModuleContractMinimal;
  private invitationFarm: InvitationFarmContractMinimal;

  constructor(config: CirclesConfig) {
    if (!config.referralsServiceUrl) {
      throw new InvitationError('referralsServiceUrl is required in config', {
        code: 'INVITATION_MISSING_CONFIG',
        source: 'INVITATIONS',
        context: { missingField: 'referralsServiceUrl' }
      });
    }
    this.config = config;
    this.rpcClient = new RpcClient(config.circlesRpcUrl);
    this.pathfinder = new PathfinderMethods(this.rpcClient);
    this.trust = new TrustMethods(this.rpcClient);
    this.hubV2 = new HubV2ContractMinimal({
      address: config.v2HubAddress,
      rpcUrl: config.circlesRpcUrl,
    });
    this.referralsModule = new ReferralsModuleContractMinimal({
      address: config.referralsModuleAddress,
      rpcUrl: config.circlesRpcUrl,
    });
    this.invitationFarm = new InvitationFarmContractMinimal({
      address: config.invitationFarmAddress,
      rpcUrl: config.circlesRpcUrl,
    });
  }

  /**
   * Save referral data to the referrals service
   *
   * @param inviter - Address of the inviter
   * @param privateKey - Private key generated for the new user
   *
   * @description
   * Sends a POST request to the referrals service to store referral data.
   */
  async saveReferralData(
    inviter: Address,
    privateKey: `0x${string}`
  ): Promise<void> {
    try {
      const response = await fetch(`${this.config.referralsServiceUrl}/store`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          privateKey,
          inviter
        })
      });

      if (!response.ok) {
        throw new InvitationError(`HTTP error! status: ${response.status}`, {
          code: 'INVITATION_HTTP_ERROR',
          source: 'INVITATIONS',
          context: { status: response.status, url: `${this.config.referralsServiceUrl}/store` }
        });
      }

    } catch (error) {
      throw new InvitationError(`Failed to save referral data: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        code: 'INVITATION_SAVE_REFERRAL_FAILED',
        source: 'INVITATIONS',
        cause: error
      });
    }
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
    try {
      const url = new URL(`${this.config.referralsServiceUrl}/list/${inviter}`);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('offset', String(offset));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'accept': 'application/json' },
      });

      if (!response.ok) {
        throw new InvitationError(`HTTP error! status: ${response.status}`, {
          code: 'INVITATION_HTTP_ERROR',
          source: 'INVITATIONS',
          context: { status: response.status, url: url.toString() },
        });
      }

      return await response.json() as ReferralPreviewList;
    } catch (error) {
      if (error instanceof InvitationError) throw error;
      throw new InvitationError(
        `Failed to list referrals: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          code: 'INVITATION_LIST_REFERRALS_FAILED',
          source: 'INVITATIONS',
          cause: error,
        }
      );
    }
  }

  /**
   * Order real inviters by preference (best to worst)
   *
   * @param realInviters - Array of valid real inviters with their addresses and possible invites
   * @param inviter - Address of the current inviter (prioritized first)
   * @returns Ordered array of real inviters (best candidates first)
   *
   * @description
   * This function determines the optimal order for selecting real inviters.
   * Prioritizes the inviter's own tokens first, then others.
   */
  private orderRealInviters(realInviters: ProxyInviter[], inviter: Address): ProxyInviter[] {
    const inviterLower = inviter.toLowerCase();

    return realInviters.sort((a, b) => {
      const aIsInviter = a.address.toLowerCase() === inviterLower;
      const bIsInviter = b.address.toLowerCase() === inviterLower;

      // Prioritize the inviter's own tokens first
      if (aIsInviter && !bIsInviter) return -1;
      if (!aIsInviter && bIsInviter) return 1;

      return 0;
    });
  }

  /**
   * Generate invitation transaction for a user who already has a Safe wallet but is not yet registered in Circles Hub
   *
   * @param inviter - Address of the inviter
   * @param invitee - Address of the invitee (must have an existing Safe wallet but NOT be registered in Circles Hub)
   * @returns Array of transactions to execute in order
   *
   * @description
   * This function:
   * 1. Verifies the invitee is NOT already registered as a human in Circles Hub
   * 2. Finds a path from inviter to invitation module using available proxy inviters
   * 3. Generates invitation data for the existing Safe wallet address
   * 4. Builds transaction batch with proper wrapped token handling
   * 5. Returns transactions ready to execute
   *
   * Note: The invitee MUST have a Safe wallet but MUST NOT be registered in Circles Hub yet.
   * If they are already registered, an error will be thrown.
   */
  async generateInvite(inviter: Address, invitee: Address): Promise<TransactionRequest[]> {

    const inviterLower = inviter.toLowerCase() as Address;
    const inviteeLower = invitee.toLowerCase() as Address;

    // Step 1: Verify invitee is NOT already registered as a human in Circles Hub
    const isHuman = await this.hubV2.isHuman(inviteeLower);

    if (isHuman) {
      throw InvitationError.inviteeAlreadyRegistered(inviterLower, inviteeLower);
    }

    // Step 2: Try to find proxy inviters
    const realInviters = await this.getRealInviters(inviterLower);

    const transactions: TransactionRequest[] = [];

    if (realInviters.length > 0) {
      // Standard path: use proxy inviters
      console.log('[generateInvite] Using STANDARD PATH (proxy inviters available)');
      const realInviterAddress = realInviters[0].address;

      const path = await this.findInvitePath(inviterLower, realInviterAddress);

      const transferData = await this.generateInviteData([inviteeLower], false);
      const transferBuilder = new TransferBuilder(this.config);

      const transferTransactions = await transferBuilder.buildFlowMatrixTx(
        inviterLower,
        this.config.invitationModuleAddress,
        path,
        {
          toTokens: [realInviterAddress],
          useWrappedBalances: true,
          txData: hexToBytes(transferData)
        },
        true
      );
      transactions.push(...transferTransactions);
    } else {
      // Fallback: farm-based invitation
      // 1. Send 96 CRC to the farm destination (invitation market) to increase quota
      // 2. claimInvite() to claim a token ID from the farm
      // 3. safeTransferFrom() to transfer the claimed token to the invitation module
      //    with the invitee address encoded as data
      console.log('[generateInvite] Using FARM FALLBACK PATH (no proxy inviters available)');

      // Farm Step 1: Send 96 CRC to farm destination to increase quota
      const transferBuilder = new TransferBuilder(this.config);
      const farmPath = await this.findFarmInvitePath(inviterLower);

      const quotaTransactions = await transferBuilder.buildFlowMatrixTx(
        inviterLower,
        FARM_DESTINATION,
        farmPath,
        {
          toTokens: [GNOSIS_GROUP_ADDRESS],
          useWrappedBalances: true
        },
        true
      );
      transactions.push(...quotaTransactions);

      // Farm Step 2: Simulate claim to get the token ID (use an address with existing quota for simulation)
      const QUOTA_HOLDER = '0x20EcD8bDeb2F48d8a7c94E542aA4feC5790D9676' as Address;
      const claimedId = await this.invitationFarm.read('claimInvite', [], { from: QUOTA_HOLDER }) as bigint;

      const claimTx = this.invitationFarm.claimInvite();
      transactions.push(claimTx);

      // Farm Step 3: Transfer claimed token to invitation module with invitee address
      const invitationModule = await this.invitationFarm.invitationModule();
      const transferData = encodeAbiParameters(['address'], [inviteeLower]);

      const safeTransferTx = this.hubV2.safeTransferFrom(
        inviterLower,
        invitationModule,
        claimedId,
        INVITATION_FEE,
        transferData
      );
      transactions.push(safeTransferTx);

    }

    return transactions;
  }

  /**
   * Find a path from inviter to the invitation module for a specific proxy inviter
   *
   * @param inviter - Address of the inviter
   * @param proxyInviterAddress - Optional specific proxy inviter address to use for the path
   * @returns PathfindingResult containing the transfer path
   *
   * @description
   * This function finds a path from the inviter to the invitation module.
   * If proxyInviterAddress is provided, it will find a path using that specific token.
   * Otherwise, it will use the first available proxy inviter.
   */
  async findInvitePath(inviter: Address, proxyInviterAddress?: Address) {

    const inviterLower = inviter.toLowerCase() as Address;

    let tokenToUse: Address;

    if (proxyInviterAddress) {
      tokenToUse = proxyInviterAddress.toLowerCase() as Address;
    } else {
      // Get real inviters and use the first one
      const realInviters = await this.getRealInviters(inviterLower);

      if (realInviters.length === 0) {
        throw InvitationError.noPathFound(inviterLower, this.config.invitationModuleAddress);
      }

      tokenToUse = realInviters[0].address;
    }

    // Find path using the selected token
    const path = await this.pathfinder.findPath({
      from: inviterLower,
      to: this.config.invitationModuleAddress,
      targetFlow: INVITATION_FEE,
      toTokens: [tokenToUse],
      useWrappedBalances: true
    });


    if (!path.transfers || path.transfers.length === 0) {
      throw InvitationError.noPathFound(inviterLower, this.config.invitationModuleAddress);
    }

    if (path.maxFlow < INVITATION_FEE) {
      const requestedInvites = 1;
      const availableInvites = Number(path.maxFlow / INVITATION_FEE);
      throw InvitationError.insufficientBalance(
        requestedInvites,
        availableInvites,
        INVITATION_FEE,
        path.maxFlow,
        inviterLower,
        this.config.invitationModuleAddress
      );
    }

    return path;
  }

  /**
   * Find a fallback path from inviter to the farm destination
   *
   * @param inviter - Address of the inviter
   * @returns PathfindingResult containing the transfer path to the farm
   *
   * @description
   * This function finds a path from the inviter to the farm destination (0x9Eb51E6A39B3F17bB1883B80748b56170039ff1d)
   * using FARM_TO_TOKEN as the target token. Used when no standard proxy inviters are available.
   */
  async findFarmInvitePath(inviter: Address) {

    const inviterLower = inviter.toLowerCase() as Address;

    // Find path to farm destination using the farm token
    const path = await this.pathfinder.findPath({
      from: inviterLower,
      to: FARM_DESTINATION,
      targetFlow: INVITATION_FEE,
      toTokens: [FARM_TO_TOKEN],
      useWrappedBalances: true
    });


    if (!path.transfers || path.transfers.length === 0) {
      throw InvitationError.noPathFound(inviterLower, FARM_DESTINATION);
    }

    if (path.maxFlow < INVITATION_FEE) {
      const requestedInvites = 1;
      const availableInvites = Number(path.maxFlow / INVITATION_FEE);
      throw InvitationError.insufficientBalance(
        requestedInvites,
        availableInvites,
        INVITATION_FEE,
        path.maxFlow,
        inviterLower,
        FARM_DESTINATION
      );
    }

    return path;
  }

  /**
   * Get real inviters who have enough balance to cover invitation fees
   *
   * @param inviter - Address of the inviter
   * @returns Array of real inviters with their addresses and possible number of invitations
   * @throws InvitationError if inviter has not enabled the invitation module
   *
   * @description
   * This function:
   * 1. Gets all addresses that trust the inviter (set1) - includes both one-way trusts and mutual trusts
   * 2. Gets all addresses trusted by the invitation module (set2) - includes both one-way trusts and mutual trusts
   * 3. Gets all addresses trusted by the gnosis group (set3) - these will be excluded
   * 4. Verifies that the inviter is trusted by the invitation module (throws error if not)
   * 5. Finds the intersection of set1 and set2, excluding addresses in set3
   * 6. Adds the inviter's own address to the list of possible tokens
   * 7. Builds a path from inviter to invitation module using intersection addresses as toTokens
   * 8. Sums up transferred token amounts by tokenOwner
   * 9. Calculates possible invites (1 invite = 96 CRC)
   * 10. Orders real inviters by preference (best candidates first)
   * 11. Returns only those token owners whose total amounts exceed the invitation fee (96 CRC)
   */
  async getRealInviters(inviter: Address): Promise<ProxyInviter[]> {
    console.log('[getRealInviters] Finding valid proxy inviters for:', inviter);

    const inviterLower = inviter.toLowerCase() as Address;

    // Step 1: Get addresses that trust the inviter (set1)
    const trustedByRelations = await this.trust.getTrustedBy(inviterLower);
    const mutualTrustRelations = await this.trust.getMutualTrusts(inviterLower);

    // Extract the addresses of avatars who trust the inviter
    // Combine both trustedBy (one-way) and mutualTrusts
    const trustedByInviter = new Set<Address>([
      ...trustedByRelations.map(relation => relation.objectAvatar.toLowerCase() as Address),
      ...mutualTrustRelations.map(relation => relation.objectAvatar.toLowerCase() as Address)
    ]);

    // Step 2: Get addresses trusted by the invitation module (set2)
    // This includes both one-way outgoing trusts and mutual trusts
    // getTrusts returns only one-way outgoing trusts, so we also need getMutualTrusts
    // to catch addresses that trusted the module back (creating a mutual trust)
    const [trustsRelations, moduleMutualTrustRelations] = await Promise.all([
      this.trust.getTrusts(this.config.invitationModuleAddress),
      this.trust.getMutualTrusts(this.config.invitationModuleAddress),
    ]);
    const trustedByModule = new Set<Address>([
      ...trustsRelations.map(relation => relation.objectAvatar.toLowerCase() as Address),
      ...moduleMutualTrustRelations.map(relation => relation.objectAvatar.toLowerCase() as Address),
    ]);

    // Step 3: Get addresses trusted by the gnosis group (set3) - these will be excluded
    let trustedByGnosisGroup = new Set<Address>();
    if (GNOSIS_GROUP_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      const gnosisGroupTrusts = await this.trust.getTrusts(GNOSIS_GROUP_ADDRESS);
      trustedByGnosisGroup = new Set<Address>([
        ...gnosisGroupTrusts.map(relation => relation.objectAvatar.toLowerCase() as Address),
      ]);
    } else {
    }

    // Step 4: Check if inviter is trusted by the invitation module
    const inviterTrustedByModule = trustedByModule.has(inviterLower);
    if (!inviterTrustedByModule) {
      throw new InvitationError('Inviter must enable the invitation module before creating invitations', {
        code: 'INVITATION_MODULE_NOT_ENABLED',
        source: 'INVITATIONS',
        context: { inviter: inviterLower, invitationModule: this.config.invitationModuleAddress }
      });
    }

    // Step 5: Find intersection - addresses that trust inviter AND are trusted by invitation module
    // AND are NOT trusted by the gnosis group
    const intersection: Address[] = [];
    for (const address of trustedByInviter) {
      if (trustedByModule.has(address) && !trustedByGnosisGroup.has(address)) {
        intersection.push(address);
      }
    }

    // Step 6: Add the inviter's own address to the list of possible tokens
    const tokensToUse = [...intersection];
    const inviterExcluded = trustedByGnosisGroup.has(inviterLower);
    if (!inviterExcluded) {
      tokensToUse.push(inviterLower);
    }

    // If no tokens available at all, return empty
    if (tokensToUse.length === 0) {
      return [];
    }

    // Step 7: Build path from inviter to invitation module
    const path = await this.pathfinder.findPath({
      from: inviterLower,
      to: this.config.invitationModuleAddress,
      useWrappedBalances: true,
      targetFlow: MAX_FLOW,
      toTokens: tokensToUse,
    });

    if (!path.transfers || path.transfers.length === 0) {
      return [];
    }

    // Step 8: Sum up transferred token amounts by tokenOwner (only terminal transfers to invitation module)
    const tokenOwnerAmounts = new Map<string, bigint>();
    const invitationModuleLower = this.config.invitationModuleAddress.toLowerCase();

    for (const transfer of path.transfers) {
      // Only count transfers that go to the invitation module (terminal transfers)
      if (transfer.to.toLowerCase() === invitationModuleLower) {
        const tokenOwnerLower = transfer.tokenOwner.toLowerCase();
        const currentAmount = tokenOwnerAmounts.get(tokenOwnerLower) || BigInt(0);
        tokenOwnerAmounts.set(tokenOwnerLower, currentAmount + transfer.value);
      }
    }

    // Step 9: Calculate possible invites and filter token owners
    const realInviters: ProxyInviter[] = [];

    for (const [tokenOwner, amount] of tokenOwnerAmounts.entries()) {
      const possibleInvites = Number(amount / INVITATION_FEE);

      if (possibleInvites >= 1) {
        realInviters.push({
          address: tokenOwner as Address,
          possibleInvites
        });
      }
    }

    // Step 10: Order real inviters by preference (best candidates first)
    const orderedRealInviters = this.orderRealInviters(realInviters, inviterLower);

    console.log('[getRealInviters] Final result:', orderedRealInviters.length, 'valid proxy inviters');
    for (const ri of orderedRealInviters) {
    }

    return orderedRealInviters;
  }
  /**
   * Generate a referral for inviting a new user
   *
   * @param inviter - Address of the inviter
   * @returns Object containing transactions, the generated private key, and whether farm was used
   *
   * @description
   * This function:
   * 1. Generates a new private key and signer address for the invitee
   * 2. Tries to find proxy inviters (accounts that trust inviter, trusted by module, NOT trusted by gnosis group)
   * 3. If no proxy inviters found, falls back to farm-based invitation:
   *    - Sends 96 CRC to FARM_DESTINATION to increase quota on the invitation farm
   *    - Then uses the farm (claimInvite + safeTransferFrom) to create the referral
   * 4. Builds transaction batch including transfers and invitation
   * 5. Uses generateInviteData to properly encode the Safe account creation data
   * 6. Saves the referral data (private key, signer, inviter) to database
   * 7. Returns transactions and the generated private key
   */
  async generateReferral(
    inviter: Address
  ): Promise<{ transactions: TransactionRequest[]; privateKey: `0x${string}` }> {

    const inviterLower = inviter.toLowerCase() as Address;

    // Step 1: Generate private key and derive signer address
    const privateKey = generatePrivateKey();
    const signerAddress = privateKeyToAddress(privateKey);

    // Step 2: Get real inviters (filtered by gnosis group)
    const realInviters = await this.getRealInviters(inviterLower);

    const transactions: TransactionRequest[] = [];

    if (realInviters.length > 0) {
      // Standard path: use proxy inviters
      console.log('[generateReferral] Using STANDARD PATH (proxy inviters available)');
      const transferBuilder = new TransferBuilder(this.config);
      const transferData = await this.generateInviteData([signerAddress], true);

      const realInviterAddress = realInviters[0].address;
      const path = await this.findInvitePath(inviterLower, realInviterAddress);

      const transferTransactions = await transferBuilder.buildFlowMatrixTx(
        inviterLower,
        this.config.invitationModuleAddress,
        path,
        {
          toTokens: [realInviterAddress],
          useWrappedBalances: true,
          txData: hexToBytes(transferData)
        },
        true
      );
      transactions.push(...transferTransactions);
    } else {
      // Fallback: use farm-based invitation path
      // 1. Send 96 CRC to the dispatcher to increase quota on the farm
      // 2. claimInvite() to claim a token ID from the farm (uses the quota)
      // 3. safeTransferFrom() to transfer the claimed token to the invitation module
      //    with createAccount calldata for the new signer
      console.log('[generateReferral] Using FARM FALLBACK PATH (no proxy inviters available)');

      // Farm Step 1: Send 96 CRC to dispatcher to increase quota
      const transferBuilder = new TransferBuilder(this.config);
      const farmPath = await this.findFarmInvitePath(inviterLower);

      const quotaTransactions = await transferBuilder.buildFlowMatrixTx(
        inviterLower,
        FARM_DESTINATION,
        farmPath,
        {
          toTokens: [FARM_TO_TOKEN],
          useWrappedBalances: true
        },
        true
      );
      transactions.push(...quotaTransactions);

      // Farm Step 2: Simulate claim to get the token ID, then build claim tx
      const QUOTA_HOLDER = '0x20EcD8bDeb2F48d8a7c94E542aA4feC5790D9676' as Address;
      const claimedId = await this.invitationFarm.read('claimInvite', [], { from: QUOTA_HOLDER }) as bigint;

      const claimTx = this.invitationFarm.claimInvite();
      transactions.push(claimTx);

      // Farm Step 3: Transfer claimed token to invitation module with createAccount calldata
      const invitationModule = await this.invitationFarm.invitationModule();
      const createAccountCalldata = this.referralsModule.createAccount(signerAddress).data as Hex;
      const transferData = encodeAbiParameters(
        ['address', 'bytes'],
        [this.config.referralsModuleAddress, createAccountCalldata]
      );

      const safeTransferTx = this.hubV2.safeTransferFrom(
        inviterLower,
        invitationModule,
        claimedId,
        INVITATION_FEE,
        transferData
      );
      transactions.push(safeTransferTx);

    }

    return { transactions, privateKey };
  }

  /**
   * Generate invitation data based on whether addresses need Safe account creation or already have Safe wallets
   *
   * @param addresses - Array of addresses to check and encode
   * @param useSafeCreation - If true, uses ReferralsModule to create Safe accounts (for new users without wallets)
   * @returns Encoded data for the invitation transfer
   *
   * @description
   * Two modes:
   * 1. Direct invitation (useSafeCreation = false): Encodes addresses directly for existing Safe wallets
   * 2. Safe creation (useSafeCreation = true): Uses ReferralsModule to create Safe accounts for new users
   *
   * Note: Addresses passed here should NEVER be registered humans in the hub (that's validated before calling this)
   */
  async generateInviteData(addresses: Address[], useSafeCreation: boolean = true): Promise<`0x${string}`> {
    if (addresses.length === 0) {
      throw InvitationError.noAddressesProvided();
    }

    // If NOT using Safe creation, encode addresses directly (for existing Safe wallets)
    if (!useSafeCreation) {
      if (addresses.length === 1) {
        // Single address - encode as single address (not array)
        return encodeAbiParameters(
          ['address'],
          [addresses[0]]
        );
      } else {
        // Multiple addresses - encode as address array
        return encodeAbiParameters(
          ['address[]'],
          [addresses]
        );
      }
    }

    // Use ReferralsModule to create Safe accounts for new users (signers without Safe wallets)
    if (addresses.length === 1) {
      // Single address - use createAccount(address signer)
      const createAccountTx = this.referralsModule.createAccount(addresses[0]);
      const createAccountData = createAccountTx.data as `0x${string}`;

      // Encode (address target, bytes callData) for the invitation module
      return encodeAbiParameters(
        ['address', 'bytes'],
        [this.config.referralsModuleAddress, createAccountData]
      );
    } else {
      // Multiple addresses - use createAccounts(address[] signers)
      const createAccountsTx = this.referralsModule.createAccounts(addresses);
      const createAccountsData = createAccountsTx.data as `0x${string}`;

      // Encode (address target, bytes callData) for the invitation module
      return encodeAbiParameters(
        ['address', 'bytes'],
        [this.config.referralsModuleAddress, createAccountsData]
      );
    }
  }

  /**
   * Predicts the pre-made Safe address for a given signer without deploying it
   * Uses CREATE2 with ACCOUNT_INITIALIZER_HASH and ACCOUNT_CREATION_CODE_HASH via SAFE_PROXY_FACTORY
   *
   * @param signer - The offchain public address chosen by the origin inviter as the pre-deployment key
   * @returns The deterministic Safe address that would be deployed for the signer
   *
   * @description
   * This implements the same logic as the ReferralsModule.computeAddress() contract function:
   * ```solidity
   * bytes32 salt = keccak256(abi.encodePacked(ACCOUNT_INITIALIZER_HASH, uint256(uint160(signer))));
   * predictedAddress = address(
   *   uint160(
   *     uint256(
   *       keccak256(
   *         abi.encodePacked(bytes1(0xff), address(SAFE_PROXY_FACTORY), salt, ACCOUNT_CREATION_CODE_HASH)
   *       )
   *     )
   *   )
   * );
   * ```
   */
  computeAddress(signer: Address): Address {
    // Step 1: Calculate salt = keccak256(abi.encodePacked(ACCOUNT_INITIALIZER_HASH, uint256(uint160(signer))))
    // abi.encodePacked means concatenate without padding
    // uint256(uint160(signer)) converts address to uint256 (32 bytes, left-padded with zeros)

    const signerLower = signer.toLowerCase().replace('0x', '');
    const signerUint256 = signerLower.padStart(64, '0'); // 32 bytes as hex string

    // Concatenate: ACCOUNT_INITIALIZER_HASH (32 bytes) + signerUint256 (32 bytes)
    const saltPreimage = ACCOUNT_INITIALIZER_HASH.replace('0x', '') + signerUint256;
    const salt = keccak256(('0x' + saltPreimage) as `0x${string}`);

    // Step 2: Calculate CREATE2 address
    // address = keccak256(0xff ++ factory ++ salt ++ initCodeHash)[12:]

    const ff = 'ff';
    const factory = SAFE_PROXY_FACTORY.toLowerCase().replace('0x', '');
    const saltClean = salt.replace('0x', '');
    const initCodeHash = ACCOUNT_CREATION_CODE_HASH.replace('0x', '');

    // Concatenate all parts
    const create2Preimage = ff + factory + saltClean + initCodeHash;
    const hash = keccak256(('0x' + create2Preimage) as `0x${string}`);

    // Take last 20 bytes (40 hex chars) as the address
    const addressHex = '0x' + hash.slice(-40);

    return checksumAddress(addressHex) as Address;
  }

  /**
   * Generate secrets and derive signer addresses for multiple invitations
   * @param count Number of secrets to generate
   */
  generateSecrets(count: number): Array<{ secret: `0x${string}`; signer: Address }> {
    return Array.from({ length: count }, () => {
      const secret = generatePrivateKey();
      const signer = privateKeyToAddress(secret).toLowerCase() as Address;
      return { secret, signer };
    });
  }
}
