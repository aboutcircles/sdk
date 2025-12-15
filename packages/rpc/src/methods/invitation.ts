import type { RpcClient } from '../client';
import type {
  Address,
  AvatarInfo,
  CirclesQueryResponse,
  ValidInvitersResponse,
  TrustInvitation,
  EscrowInvitation,
  AtScaleInvitation,
  Invitation,
  AllInvitationsResponse
} from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils';

interface InviterRow {
  inviter: Address;
}

interface EscrowRow {
  inviter: Address;
  invitee: Address;
  amount: string;
  blockNumber: number;
  timestamp: number;
}

interface AtScaleAccountRow {
  account: Address;
  blockNumber: number;
  timestamp: number;
}

interface AtScaleRegisterHumanRow {
  human: Address;
  originInviter: Address;
  proxyInviter: Address;
  blockNumber: number;
  timestamp: number;
}

/**
 * Invitation RPC methods
 */
export class InvitationMethods {
  constructor(private client: RpcClient) {}

  private transformQueryResponse<T>(response: CirclesQueryResponse): T[] {
    const { columns, rows } = response;
    return rows.map((row) => {
      const obj: any = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj as T;
    });
  }

  /**
   * Get the avatar that invited a specific avatar
   *
   * @param address - The address of the invited avatar
   * @returns The address of the inviting avatar or undefined if not found
   *
   * @example
   * ```typescript
   * const inviter = await rpc.invitation.getInvitedBy('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(inviter); // '0x...'
   * ```
   */
  async getInvitedBy(address: Address): Promise<Address | undefined> {
    const normalized = normalizeAddress(address);

    const results = await this.client.call<[any], InviterRow[]>('circles_query', [
      {
        Namespace: 'CrcV2',
        Table: 'RegisterHuman',
        Columns: ['inviter'],
        Filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'avatar',
            Value: normalized,
          },
        ],
        Order: [
          {
            Column: 'blockNumber',
            SortOrder: 'DESC',
          },
        ],
        Limit: 1,
      },
    ]);

    if (results.length > 0) {
      return checksumAddresses(results[0].inviter);
    }
    return undefined;
  }

  /**
   * Get the list of avatars who have invited this avatar
   * Checks v2 trust relations and validates that inviters have enough balance
   *
   * Uses the native RPC method for efficient server-side filtering and validation.
   * Replaces 6-7 separate RPC calls with a single optimized query.
   *
   * @param address - The address to check for invitations
   * @returns Array of avatar info for valid inviters
   *
   * @example
   * ```typescript
   * const invitations = await rpc.invitation.getInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(invitations); // Array of AvatarInfo
   * ```
   */
  async getInvitations(address: Address, minimumBalance?: string): Promise<AvatarInfo[]> {
    const response = await this.getValidInviters(address, minimumBalance);

    const inviters = response.validInviters
      .map((entry) => entry.avatarInfo)
      .filter((info): info is AvatarInfo => info !== undefined && info !== null);

    return checksumAddresses(inviters);
  }

  /**
   * Fetch valid inviters along with balances and avatar info
   *
   * @param address - Address to find inviters for
   * @param minimumBalance - Optional minimum balance to filter inviters
   * @returns Valid inviters response as provided by the RPC host
   */
  async getValidInviters(address: Address, minimumBalance?: string): Promise<ValidInvitersResponse> {
    const normalized = normalizeAddress(address);
    const response = await this.client.call<[Address, string?], ValidInvitersResponse>(
      'circles_getValidInviters',
      minimumBalance ? [normalized, minimumBalance] : [normalized]
    );

    return checksumAddresses(response);
  }

  /**
   * Get the list of accounts that were invited by a specific avatar
   *
   * @param address - The address of the inviter
   * @param accepted - If true, returns accepted invitations; if false, returns pending invitations
   * @returns Array of invited addresses
   *
   * @example
   * ```typescript
   * // Get accepted invitations
   * const accepted = await rpc.invitation.getInvitationsFrom(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   true
   * );
   *
   * // Get pending invitations
   * const pending = await rpc.invitation.getInvitationsFrom(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   false
   * );
   * ```
   */
  async getInvitationsFrom(address: Address, accepted: boolean = false): Promise<Address[]> {
    const normalized = normalizeAddress(address);

    if (accepted) {
      // Query for accounts that have registered using this avatar as inviter
      const response = await this.client.call<[any], CirclesQueryResponse>('circles_query', [
        {
          Namespace: 'CrcV2',
          Table: 'RegisterHuman',
          Columns: ['avatar'],
          Filter: [
            {
              Type: 'FilterPredicate',
              FilterType: 'Equals',
              Column: 'inviter',
              Value: normalized,
            },
          ],
          Order: [
            {
              Column: 'blockNumber',
              SortOrder: 'DESC',
            },
          ],
        },
      ]);

      const results = this.transformQueryResponse<{ avatar: Address }>(response);
      const avatars = results.map((r) => r.avatar);
      return checksumAddresses(avatars);
    } else {
      // Find accounts that this avatar trusts without mutual trust
      const response = await this.client.call<[any], CirclesQueryResponse>('circles_query', [
        {
          Namespace: 'V_Crc',
          Table: 'TrustRelations',
          Columns: ['trustee', 'truster'],
          Filter: [
            {
              Type: 'Conjunction',
              ConjunctionType: 'And',
              Predicates: [
                {
                  Type: 'FilterPredicate',
                  FilterType: 'Equals',
                  Column: 'version',
                  Value: 2,
                },
                {
                  Type: 'FilterPredicate',
                  FilterType: 'Equals',
                  Column: 'truster',
                  Value: normalized,
                },
              ],
            },
          ],
          Order: [],
        },
      ]);

      const trustRelations = this.transformQueryResponse<{ trustee: Address; truster: Address }>(response);
      const v2Trusted = trustRelations.map((r) => r.trustee);

      if (v2Trusted.length === 0) {
        return [];
      }

      // Get avatar info for trusted accounts
      const trustedAvatarsInfo = await this.client.call<[Address[]], (AvatarInfo | null)[]>(
        'circles_getAvatarInfoBatch',
        [v2Trusted]
      );

      // Create a Set of registered avatars (filter out null values) - normalize for comparison
      const registeredAvatarsSet = new Set(
        trustedAvatarsInfo.filter((a): a is AvatarInfo => a !== null).map((a) => normalizeAddress(a.avatar))
      );

      // Return only unregistered accounts (pending invitations)
      const pending = v2Trusted.filter((addr) => !registeredAvatarsSet.has(normalizeAddress(addr)));
      return checksumAddresses(pending);
    }
  }

  /**
   * Get escrow-based invitations for an address
   * Queries CrcV2_InvitationEscrow.InvitationEscrowed for active escrows
   *
   * @param address - The address to check for escrow invitations
   * @returns Array of escrow invitations
   *
   * @example
   * ```typescript
   * const escrowInvites = await rpc.invitation.getEscrowInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(escrowInvites); // Array of EscrowInvitation
   * ```
   */
  async getEscrowInvitations(address: Address): Promise<EscrowInvitation[]> {
    const normalized = normalizeAddress(address);

    // Get all escrowed invitations for this invitee
    const escrowedResponse = await this.client.call<[any], CirclesQueryResponse>('circles_query', [
      {
        Namespace: 'CrcV2_InvitationEscrow',
        Table: 'InvitationEscrowed',
        Columns: ['inviter', 'invitee', 'amount', 'blockNumber', 'timestamp'],
        Filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'invitee',
            Value: normalized,
          },
        ],
        Order: [
          {
            Column: 'blockNumber',
            SortOrder: 'DESC',
          },
        ],
      },
    ]);

    const escrowed = this.transformQueryResponse<EscrowRow>(escrowedResponse);

    // Get redeemed/revoked/refunded to filter out inactive escrows
    const [redeemedResponse, revokedResponse, refundedResponse] = await Promise.all([
      this.client.call<[any], CirclesQueryResponse>('circles_query', [
        {
          Namespace: 'CrcV2_InvitationEscrow',
          Table: 'InvitationRedeemed',
          Columns: ['inviter', 'invitee'],
          Filter: [
            {
              Type: 'FilterPredicate',
              FilterType: 'Equals',
              Column: 'invitee',
              Value: normalized,
            },
          ],
          Order: [],
        },
      ]),
      this.client.call<[any], CirclesQueryResponse>('circles_query', [
        {
          Namespace: 'CrcV2_InvitationEscrow',
          Table: 'InvitationRevoked',
          Columns: ['inviter', 'invitee'],
          Filter: [
            {
              Type: 'FilterPredicate',
              FilterType: 'Equals',
              Column: 'invitee',
              Value: normalized,
            },
          ],
          Order: [],
        },
      ]),
      this.client.call<[any], CirclesQueryResponse>('circles_query', [
        {
          Namespace: 'CrcV2_InvitationEscrow',
          Table: 'InvitationRefunded',
          Columns: ['inviter', 'invitee'],
          Filter: [
            {
              Type: 'FilterPredicate',
              FilterType: 'Equals',
              Column: 'invitee',
              Value: normalized,
            },
          ],
          Order: [],
        },
      ]),
    ]);

    const redeemed = this.transformQueryResponse<{ inviter: Address; invitee: Address }>(redeemedResponse);
    const revoked = this.transformQueryResponse<{ inviter: Address; invitee: Address }>(revokedResponse);
    const refunded = this.transformQueryResponse<{ inviter: Address; invitee: Address }>(refundedResponse);

    // Create set of inactive inviter addresses (normalized for comparison)
    const inactiveInviters = new Set([
      ...redeemed.map((r) => normalizeAddress(r.inviter)),
      ...revoked.map((r) => normalizeAddress(r.inviter)),
      ...refunded.map((r) => normalizeAddress(r.inviter)),
    ]);

    // Filter to only active escrows
    const activeEscrows = escrowed.filter(
      (e) => !inactiveInviters.has(normalizeAddress(e.inviter))
    );

    if (activeEscrows.length === 0) {
      return [];
    }

    // Get avatar info for inviters
    const inviterAddresses = activeEscrows.map((e) => e.inviter);
    const avatarInfos = await this.client.call<[Address[]], (AvatarInfo | null)[]>(
      'circles_getAvatarInfoBatch',
      [inviterAddresses]
    );

    // Calculate escrow days (approximate based on timestamp)
    const now = Math.floor(Date.now() / 1000);

    const escrowInvitations: EscrowInvitation[] = activeEscrows.map((escrow, index) => {
      const daysSinceEscrow = Math.floor((now - escrow.timestamp) / 86400);
      return {
        address: checksumAddresses(escrow.inviter),
        source: 'escrow' as const,
        escrowedAmount: escrow.amount,
        escrowDays: daysSinceEscrow,
        blockNumber: escrow.blockNumber,
        timestamp: escrow.timestamp,
        avatarInfo: avatarInfos[index] ? checksumAddresses(avatarInfos[index]) : undefined,
      };
    });

    return escrowInvitations;
  }

  /**
   * Get at-scale invitations for an address
   * Queries CrcV2_InvitationsAtScale.AccountCreated for pre-created accounts
   *
   * @param address - The address to check for at-scale invitations
   * @returns Array of at-scale invitations
   *
   * @example
   * ```typescript
   * const atScaleInvites = await rpc.invitation.getAtScaleInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(atScaleInvites); // Array of AtScaleInvitation
   * ```
   */
  async getAtScaleInvitations(address: Address): Promise<AtScaleInvitation[]> {
    const normalized = normalizeAddress(address);

    // Check if this address has a pre-created account (AccountCreated event)
    const accountCreatedResponse = await this.client.call<[any], CirclesQueryResponse>('circles_query', [
      {
        Namespace: 'CrcV2_InvitationsAtScale',
        Table: 'AccountCreated',
        Columns: ['account', 'blockNumber', 'timestamp'],
        Filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'account',
            Value: normalized,
          },
        ],
        Order: [
          {
            Column: 'blockNumber',
            SortOrder: 'DESC',
          },
        ],
        Limit: 1,
      },
    ]);

    const accountCreated = this.transformQueryResponse<AtScaleAccountRow>(accountCreatedResponse);

    if (accountCreated.length === 0) {
      return [];
    }

    // Check if account has been claimed
    const accountClaimedResponse = await this.client.call<[any], CirclesQueryResponse>('circles_query', [
      {
        Namespace: 'CrcV2_InvitationsAtScale',
        Table: 'AccountClaimed',
        Columns: ['account'],
        Filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'account',
            Value: normalized,
          },
        ],
        Limit: 1,
      },
    ]);

    const accountClaimed = this.transformQueryResponse<{ account: Address }>(accountClaimedResponse);

    // If already claimed, no pending invitation
    if (accountClaimed.length > 0) {
      return [];
    }

    // Account is created but not claimed - this is a valid at-scale invitation
    // Try to find the origin inviter from RegisterHuman events (if the account was used to register someone)
    // For now, we return the invitation without origin info since the account hasn't been used yet

    const account = accountCreated[0];

    const atScaleInvitation: AtScaleInvitation = {
      address: checksumAddresses(account.account),
      source: 'atScale' as const,
      blockNumber: account.blockNumber,
      timestamp: account.timestamp,
      originInviter: undefined, // Will be set when/if account is used for registration
    };

    return [atScaleInvitation];
  }

  /**
   * Get all invitations from all sources (trust, escrow, at-scale)
   * This is the recommended method to use for getting a complete view of available invitations
   *
   * @param address - The address to check for invitations
   * @param minimumBalance - Optional minimum balance for trust-based invitations
   * @returns All invitations from all sources
   *
   * @example
   * ```typescript
   * const allInvites = await rpc.invitation.getAllInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(`Trust invites: ${allInvites.trustInvitations.length}`);
   * console.log(`Escrow invites: ${allInvites.escrowInvitations.length}`);
   * console.log(`At-scale invites: ${allInvites.atScaleInvitations.length}`);
   * console.log(`Total: ${allInvites.all.length}`);
   * ```
   */
  async getAllInvitations(address: Address, minimumBalance?: string): Promise<AllInvitationsResponse> {
    const normalized = normalizeAddress(address);

    // Fetch all invitation types in parallel
    const [validInvitersResponse, escrowInvitations, atScaleInvitations] = await Promise.all([
      this.getValidInviters(normalized, minimumBalance),
      this.getEscrowInvitations(normalized),
      this.getAtScaleInvitations(normalized),
    ]);

    // Transform trust-based invitations
    const trustInvitations: TrustInvitation[] = validInvitersResponse.validInviters.map((inviter) => ({
      address: inviter.address,
      source: 'trust' as const,
      balance: inviter.balance,
      avatarInfo: inviter.avatarInfo,
    }));

    // Combine all invitations
    const all: Invitation[] = [
      ...trustInvitations,
      ...escrowInvitations,
      ...atScaleInvitations,
    ];

    return checksumAddresses({
      address: normalized,
      trustInvitations,
      escrowInvitations,
      atScaleInvitations,
      all,
    });
  }
}
