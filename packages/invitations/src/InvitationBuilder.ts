import type { Address, TransactionRequest, SimulatedBalance } from '@aboutcircles/sdk-types';
import { CirclesRpc } from '@aboutcircles/sdk-rpc';
import type { Core } from '@aboutcircles/sdk-core';
import { InvitationError } from './errors';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import { createFlowMatrix } from '@aboutcircles/sdk-pathfinder';
import { bytesToHex } from '@aboutcircles/sdk-utils';

const INVITATION_MODULE_ADDRESS = '0x00738aca013B7B2e6cfE1690F0021C3182Fa40B5' as Address;
const INVITATION_FEE = BigInt(96) * BigInt(10 ** 18);

export interface ProxyInviter {
  address: Address;
  possibleInvites: number;
}

export interface InvitationResult {
  privateKey: `0x${string}`;
  signerAddress: Address;
  transactions: TransactionRequest[];
}

export class InvitationBuilder {
  private core: Core;
  private rpc: CirclesRpc;

  constructor(core: Core) {
    this.core = core;
    this.rpc = new CirclesRpc(core.config.circlesRpcUrl);
  }
  /*
    1.1 User creates an invitation link
    1.2 New user joins usin the invitation link, by calling claim account

    2.1 New user creates a Safe, with all the required modules (invitation module, either passkeys or regular EOA owner)
    2.2 User invites the created Safe



    Go with the replenishment flow, because the tokens might come splited to the invitation module for exmple 50gCRC and 46gCRC
    
    For direct invitation:
    Our goal is to obtain the 96CRC, we should check if the inviter has in total enough CRC
    If yes:
      we preapare unwrap calls for the amount we need
    If no:
      we prepare the unwrap calls for all the amount
      and we check the diff the inviter needs

    Create the safeTransferFrom with the invitation module as a recipient

    We calculate the path from the inviter to the inviter, trying to get 96 CRC if needed



    * generalise the direct invitation an proxy invitation
  */

  

  // make call to the function trustInviter(address inviter) external 
  // simulate trust if needed

  // @todo function to generate an invite
  async createNewSafe(owners: [], modules: Address[]): Promise<Address> {
    // @todo precalculated addess
    return '0x0000000000000000000000000000000000000000' as Address;
  }
  // @todo rework fully
  async directInvite(inviter: Address, invitee: Address): Promise<TransactionRequest[]> {
    const inviterLower = inviter.toLowerCase() as Address;
    const inviteeLower = invitee.toLowerCase() as Address;
    const invitationFee = BigInt(96e18); // @todo move to constant

    // -------

    const path = await this.rpc.pathfinder.findPath({
      from: inviterLower,
      to: INVITATION_MODULE_ADDRESS,
      targetFlow: invitationFee,
      toTokens: [inviterLower]
    });

    if (!path.transfers || path.transfers.length === 0) {
      throw InvitationError.noPathFound(inviterLower, INVITATION_MODULE_ADDRESS);
    }

    if (path.maxFlow < invitationFee) {
      throw Error('Update with the new one');
    }

    // @todo check if there is a path found
    const transactions: TransactionRequest[] = [];
    // @todo check if we need it

    const isApproved = await this.core.hubV2.isApprovedForAll(inviterLower, inviterLower);
    if (!isApproved) {
      transactions.push(this.core.hubV2.setApprovalForAll(inviterLower, true));
    }

    const flowMatrix = createFlowMatrix(inviterLower, INVITATION_MODULE_ADDRESS, path.maxFlow, path.transfers);

    //@todo here is gonna be only one stream
    const streamsWithHexData = flowMatrix.streams.map((stream) => ({
      sourceCoordinate: stream.sourceCoordinate,
      flowEdgeIds: stream.flowEdgeIds,
      data: stream.data instanceof Uint8Array ? bytesToHex(stream.data) as `0x${string}` : stream.data as `0x${string}`,
    }));

    const operateFlowMatrixTx = this.core.hubV2.operateFlowMatrix(
      flowMatrix.flowVertices as readonly Address[],
      flowMatrix.flowEdges,
      streamsWithHexData,
      flowMatrix.packedCoordinates as `0x${string}`
    );
    transactions.push(operateFlowMatrixTx);

    // @todo encode data of the address to invite

    return [];
  }

  async createInviter() {

  }

  /**
   * Get proxy inviters who have enough balance to cover invitation fees
   *
   * @param inviter - Address of the inviter
   * @returns Array of proxy inviters with their addresses and possible number of invitations
   *
   * @description
   * This function:
   * 1. Gets all addresses that trust the inviter (set1) - includes both one-way trusts and mutual trusts
   * 2. Gets all addresses trusted by the invitation module (set2) - includes both one-way trusts and mutual trusts
   * 3. Finds the intersection of set1 and set2
   * 4. Creates simulated balances of 10000 CRC for each intersection token held by the inviter
   * 5. Builds a path from inviter to invitation module using simulated balances and intersection addresses as toTokens
   * 6. Sums up transferred token amounts by tokenOwner
   * 7. Calculates possible invites (1 invite = 96 CRC)
   * 8. Returns only those token owners whose total amounts exceed the invitation fee (96 CRC)
   */
  async getProxyInviters(inviter: Address): Promise<ProxyInviter[]> {
    // @todo separately check if the inviter is trusted by the invitation module and direct invite is possible 
    const inviterLower = inviter.toLowerCase() as Address;

    // Step 1: Get addresses that trust the inviter (set1)
    // This includes both one-way incoming trusts and mutual trusts
    const trustedByRelations = await this.rpc.trust.getTrustedBy(inviterLower);
    const mutualTrustRelations = await this.rpc.trust.getMutualTrusts(inviterLower);

    if (trustedByRelations.length === 0 && mutualTrustRelations.length === 0) {
      return [];
    }

    // Extract the addresses of avatars who trust the inviter
    // Combine both trustedBy (one-way) and mutualTrusts
    const trustedByInviter = new Set<Address>([
      ...trustedByRelations.map(relation => relation.objectAvatar.toLowerCase() as Address),
      ...mutualTrustRelations.map(relation => relation.objectAvatar.toLowerCase() as Address)
    ]);

    // Step 2: Get addresses trusted by the invitation module (set2)
    // This includes both one-way outgoing trusts and mutual trusts
    const trustsRelations = await this.rpc.trust.getTrusts(INVITATION_MODULE_ADDRESS);
    const mutualTrustRelationsModule = await this.rpc.trust.getMutualTrusts(INVITATION_MODULE_ADDRESS);

    const trustedByModule = new Set<Address>([
      ...trustsRelations.map(relation => relation.objectAvatar.toLowerCase() as Address),
      ...mutualTrustRelationsModule.map(relation => relation.objectAvatar.toLowerCase() as Address)
    ]);

    // Step 3: Find intersection - addresses that trust inviter AND are trusted by invitation module
    const intersection: Address[] = [];
    for (const address of trustedByInviter) {
      if (trustedByModule.has(address)) {
        intersection.push(address);
      }
    }

    if (intersection.length === 0) {
      return [];
    }

    const tokensToUse = intersection;
    console.log('Invitation Module Address:', INVITATION_MODULE_ADDRESS);
    console.log('Addresses that trust inviter:', trustedByInviter.size);
    console.log('Addresses trusted by module:', trustedByModule.size);
    console.log('Intersection (toTokens):', tokensToUse.length, tokensToUse);

    // Step 4: Create simulated balances for the inviter (10000 CRC of each intersection token)
    const simulatedAmount = BigInt(10000) * BigInt(10 ** 18); // 10000 CRC
    const simulatedBalances: SimulatedBalance[] = tokensToUse.map(tokenAddress => ({
      holder: inviterLower,
      token: tokenAddress,
      amount: simulatedAmount,
      isWrapped: false,
      isStatic: false
    }));

    console.log('Simulated balances created:', simulatedBalances.length);

    // Step 5: Build path from inviter to invitation module with simulated balances
    const path = await this.rpc.pathfinder.findPath({
      from: inviterLower,
      to: INVITATION_MODULE_ADDRESS,
      useWrappedBalances: true,
      targetFlow: BigInt('9999999999999999999999999999999999999'), // @todo move to universal constant file
      toTokens: tokensToUse,
      //simulatedBalances,
    });

    if (!path.transfers || path.transfers.length === 0) {
      return [];
    }
    //console.log("generated path: ", path);
    // Step 6: Sum up transferred token amounts by tokenOwner (only terminal transfers to invitation module)
    const tokenOwnerAmounts = new Map<string, bigint>();
    const invitationModuleLower = INVITATION_MODULE_ADDRESS.toLowerCase();

    for (const transfer of path.transfers) {
      // Only count transfers that go to the invitation module (terminal transfers)
      if (transfer.to.toLowerCase() === invitationModuleLower) {
        const tokenOwnerLower = transfer.tokenOwner.toLowerCase();
        const currentAmount = tokenOwnerAmounts.get(tokenOwnerLower) || BigInt(0);
        tokenOwnerAmounts.set(tokenOwnerLower, currentAmount + transfer.value);
      }
    }

    // Step 7: Calculate possible invites and filter token owners
    const proxyInviters: ProxyInviter[] = [];

    for (const [tokenOwner, amount] of tokenOwnerAmounts.entries()) {
      const possibleInvites = Number(amount / INVITATION_FEE);
      console.log(`Token Owner: ${tokenOwner}, Total Amount to Module: ${amount / BigInt(10 ** 18)} CRC, Possible Invites: ${possibleInvites}`);

      if (possibleInvites >= 1) {
        proxyInviters.push({
          address: tokenOwner as Address,
          possibleInvites
        });
      }
    }

    return proxyInviters;
  }
  // @todo update to the conventional errors
  async createInvitation(
    inviter: Address
  ): Promise<InvitationResult> {
    const inviterLower = inviter.toLowerCase() as Address;

    // Step 0: Generate private key and derive signer address
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const signerAddress = account.address;
    console.log(`  Private Key: ${privateKey}`);
    console.log(`  Signer Address: ${signerAddress}`);

    // Step 1: Get proxy inviters
    const proxyInviters = await this.getProxyInviters(inviterLower);

    if (proxyInviters.length === 0) {
      // @todo allow to be a direct inviter
      throw new Error('No proxy inviters found');
    }

    // Step 2: Pick the first proxy inviter
    const firstProxyInviter = proxyInviters[0];
    const proxyInviterAddress = firstProxyInviter.address;

    // Step 3: Check if inviter trusts proxy inviter
    const initiallyTrustsProxy = await this.core.hubV2.isTrusted(inviterLower, proxyInviterAddress);

    // Step 4: Build transactions using TransferBuilder to properly handle wrapped tokens
    const invitationAmount = INVITATION_FEE; // 96 CRC

    // Use TransferBuilder to construct the transfer transactions
    // This handles wrapped tokens, unwrapping, wrapping, and flow matrix creation
    const transferBuilder = new TransferBuilder(this.core);

    let transferTransactions: TransactionRequest[];
    try {
      transferTransactions = await transferBuilder.constructAdvancedTransfer(
        inviterLower,
        inviterLower,
        invitationAmount,
        {
          toTokens: [proxyInviterAddress],
          useWrappedBalances: true,
          simulatedTrusts: initiallyTrustsProxy ? undefined : [
            {
              truster: inviterLower,
              trustee: proxyInviterAddress
            }
          ]
        }
      );
    } catch (error) {
      throw InvitationError.noPathFound(inviterLower, proxyInviterAddress);
    }

    // Step 6: Build final transaction batch
    const transactions: TransactionRequest[] = [];

    // TX 1: Trust proxy inviter if not already trusted
    // (TransferBuilder includes approval if needed, so we only add trust if needed)
    if (!initiallyTrustsProxy) {
      transactions.push(
        this.core.hubV2.trust(proxyInviterAddress, BigInt(2) ** BigInt(96) - BigInt(1))
      );
    }

    // TX 2: Add all transfer transactions (approval, unwraps, operateFlowMatrix, wraps)
    transactions.push(...transferTransactions);

    // TX 3: Encode createAccount call and use as data for Safe ERC1155 transfer
    const createAccountTx = this.core.referralsModule.createAccount(signerAddress);
    const createAccountData = createAccountTx.data as `0x${string}`;

    // Encode (address target, bytes callData) for the invitation module
    const transferData = encodeAbiParameters(
      parseAbiParameters('address, bytes'),
      [this.core.config.referralsModuleAddress, createAccountData]
    );

    const tokenId = BigInt(proxyInviterAddress);

    const safeTransferTx = this.core.hubV2.safeTransferFrom(
      inviterLower,
      INVITATION_MODULE_ADDRESS,
      tokenId,
      invitationAmount,
      transferData
    );
    transactions.push(safeTransferTx);

    // TX 4: Untrust proxy inviter if it wasn't trusted before
    if (!initiallyTrustsProxy) {
      transactions.push(
        this.core.hubV2.trust(proxyInviterAddress, BigInt(0))
      );
    }
    // @todo remove before production
    console.log(`\nTotal transactions: ${transactions.length}`);
    console.log('\n=== TRANSACTION BATCH ===');
    console.dir(transactions, { depth: null });

    console.log('\n=== INVITATION RESULT ===');
    console.log(`Private Key: ${privateKey}`);
    console.log(`Signer Address: ${signerAddress}`);

    return {
      privateKey,
      signerAddress,
      transactions
    };
  }
}
