import type { RpcClient } from '../client.js';
import type { Address, AvatarInfo, TokenBalance, CirclesQueryResponse } from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils.js';

interface InviterRow {
  inviter: Address;
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
   * @param address - The address to check for invitations
   * @returns Array of avatar info for valid inviters
   *
   * @example
   * ```typescript
   * const invitations = await rpc.invitation.getInvitations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(invitations); // Array of AvatarInfo
   * ```
   */
  async getInvitations(address: Address): Promise<AvatarInfo[]> {
    const normalized = normalizeAddress(address);
    const MIN_TOKENS_REQUIRED = 96;

    // Check if the avatar is still on v1
    const avatarInfoResults = await this.client.call<[Address[]], AvatarInfo[]>(
      'circles_getAvatarInfoBatch',
      [[normalized]]
    );

    const avatarInfo = avatarInfoResults.length > 0 ? avatarInfoResults[0] : undefined;

    if (avatarInfo?.version === 2) {
      // Already on v2, no invitations needed
      return [];
    }

    // Get trust relations where others trust this avatar
    const response = await this.client.call<[any], CirclesQueryResponse>('circles_query', [
      {
        Namespace: 'V_Crc',
        Table: 'TrustRelations',
        Columns: ['truster', 'trustee'],
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
                Column: 'trustee',
                Value: normalized,
              },
            ],
          },
        ],
        Order: [],
      },
    ]);

    const trustRelations = this.transformQueryResponse<{ truster: Address; trustee: Address }>(response);
    const v2Trusters = trustRelations.map((r) => r.truster);

    if (v2Trusters.length === 0) {
      return [];
    }

    // Get avatar info for all trusters
    const trusterInfos = await this.client.call<[Address[]], AvatarInfo[]>(
      'circles_getAvatarInfoBatch',
      [v2Trusters]
    );

    const humanInviters: AvatarInfo[] = [];

    for (const trusterInfo of trusterInfos) {
      // Only humans can invite other humans
      if (!trusterInfo?.isHuman) {
        continue;
      }

      // Check if the inviter has enough tokens
      const balances = await this.client.call<[Address], TokenBalance[]>(
        'circles_getTokenBalances',
        [trusterInfo.avatar]
      );

      const inviterOwnToken = balances.find((b) =>
        normalizeAddress(b.tokenAddress) === normalizeAddress(trusterInfo.avatar)
      );
      if (inviterOwnToken && inviterOwnToken.circles >= MIN_TOKENS_REQUIRED) {
        humanInviters.push(trusterInfo);
      }
    }

    return checksumAddresses(humanInviters);
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
}
