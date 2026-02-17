import type { RpcClient } from '../client';
import type {
  Address,
  AvatarInfo,
  CirclesQueryResponse,
  ValidInvitersResponse,
  TrustInvitation,
  EscrowInvitation,
  AtScaleInvitation,
  InvitationOriginResponse,
  AllInvitationsResponse
} from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils';

/**
 * Invitation RPC methods
 *
 * Most methods delegate to dedicated RPC endpoints for server-side SQL optimization.
 * `getInvitationsFrom` still uses raw circles_query (no dedicated endpoint yet).
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
   * Get the invitation origin for an address — how they were invited to Circles
   *
   * @param address - The address of the invited avatar
   * @returns Full invitation origin details or null if not registered
   *
   * @example
   * ```typescript
   * const origin = await rpc.invitation.getInvitationOrigin('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(origin?.invitationType); // 'v2_standard', 'v2_escrow', 'v2_at_scale', 'v1_signup'
   * console.log(origin?.inviter); // '0x...' or null
   * ```
   */
  async getInvitationOrigin(address: Address): Promise<InvitationOriginResponse | null> {
    const normalized = normalizeAddress(address);
    const response = await this.client.call<[Address], InvitationOriginResponse | null>(
      'circles_getInvitationOrigin',
      [normalized]
    );
    return response ? checksumAddresses(response) : null;
  }

  /**
   * Get the avatar that invited a specific avatar
   *
   * Uses `circles_getInvitationOrigin` for a single optimized query that checks
   * all invitation mechanisms (at-scale, escrow, v2 standard, v1 signup).
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
    const origin = await this.getInvitationOrigin(address);
    if (origin?.inviter) {
      return checksumAddresses(origin.inviter);
    }
    return undefined;
  }

  /**
   * Get trust-based invitations (addresses that trust you with sufficient balance)
   *
   * Uses dedicated `circles_getTrustInvitations` endpoint.
   *
   * @param address - The address to check for trust invitations
   * @param minimumBalance - Optional minimum balance threshold (as CRC string)
   * @returns Array of trust invitations
   */
  async getTrustInvitations(address: Address, minimumBalance?: string): Promise<TrustInvitation[]> {
    const normalized = normalizeAddress(address);
    const response = await this.client.call<[Address, string?], TrustInvitation[]>(
      'circles_getTrustInvitations',
      minimumBalance ? [normalized, minimumBalance] : [normalized]
    );
    return checksumAddresses(response);
  }

  /**
   * Get the list of avatars who have invited this avatar
   * Checks v2 trust relations and validates that inviters have enough balance
   *
   * Uses the native RPC method for efficient server-side filtering and validation.
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

    const inviters = response.results
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
   * Note: This method still uses raw circles_query — no dedicated RPC endpoint yet.
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
   *
   * Uses dedicated `circles_getEscrowInvitations` endpoint which handles all filtering
   * server-side (redeemed, revoked, refunded) in a single optimized SQL query.
   *
   * @param address - The address to check for escrow invitations
   * @returns Array of active escrow invitations
   *
   * @example
   * ```typescript
   * const escrowInvites = await rpc.invitation.getEscrowInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(escrowInvites); // Array of EscrowInvitation
   * ```
   */
  async getEscrowInvitations(address: Address): Promise<EscrowInvitation[]> {
    const normalized = normalizeAddress(address);
    const response = await this.client.call<[Address], EscrowInvitation[]>(
      'circles_getEscrowInvitations',
      [normalized]
    );
    return checksumAddresses(response);
  }

  /**
   * Get at-scale invitations for an address
   *
   * Uses dedicated `circles_getAtScaleInvitations` endpoint which checks for
   * unclaimed pre-created accounts in a single optimized SQL query.
   *
   * @param address - The address to check for at-scale invitations
   * @returns Array of at-scale invitations (unclaimed pre-created accounts)
   *
   * @example
   * ```typescript
   * const atScaleInvites = await rpc.invitation.getAtScaleInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(atScaleInvites); // Array of AtScaleInvitation
   * ```
   */
  async getAtScaleInvitations(address: Address): Promise<AtScaleInvitation[]> {
    const normalized = normalizeAddress(address);
    const response = await this.client.call<[Address], AtScaleInvitation[]>(
      'circles_getAtScaleInvitations',
      [normalized]
    );
    return checksumAddresses(response);
  }

  /**
   * Get all invitations from all sources (trust, escrow, at-scale)
   * This is the recommended method to use for getting a complete view of available invitations
   *
   * Uses the optimized `circles_getAllInvitations` RPC method which fetches all invitation
   * types in a single round-trip with server-side SQL JOINs for efficiency.
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
   * ```
   */
  async getAllInvitations(address: Address, minimumBalance?: string): Promise<AllInvitationsResponse> {
    const normalized = normalizeAddress(address);

    // Use the optimized RPC method that fetches all invitation types in a single call
    const response = await this.client.call<[Address, string?], AllInvitationsResponse>(
      'circles_getAllInvitations',
      minimumBalance ? [normalized, minimumBalance] : [normalized]
    );

    return checksumAddresses(response);
  }
}
