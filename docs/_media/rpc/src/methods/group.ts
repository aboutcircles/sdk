import type { RpcClient } from '../client';
import type {
  Address,
  GroupRow,
  GroupMembershipRow,
  GroupQueryParams,
  Filter,
  PagedResponse
} from '@aboutcircles/sdk-types';
import type { GroupTokenHolderRow } from '../types';
import { normalizeAddress, checksumAddresses } from '../utils';
import { PagedQuery } from '../pagedQuery';

/**
 * Group query RPC methods
 */
export class GroupMethods {
  constructor(private client: RpcClient) {}

  /**
   * Find groups with optional filters
   *
   * Uses the native RPC method for efficient server-side filtering and pagination.
   * Fetches all results using cursor-based pagination up to the specified limit.
   *
   * @param limit - Maximum number of groups to return (default: 50)
   * @param params - Optional query parameters to filter groups
   * @returns Array of group rows
   *
   * @example
   * ```typescript
   * // Find all groups
   * const allGroups = await rpc.group.findGroups(50);
   *
   * // Find groups by name prefix
   * const groups = await rpc.group.findGroups(50, {
   *   nameStartsWith: 'Community'
   * });
   *
   * // Find groups by owner (single)
   * const myGroups = await rpc.group.findGroups(50, {
   *   ownerIn: ['0xde374ece6fa50e781e81aac78e811b33d16912c7']
   * });
   *
   * // Find groups by multiple owners (OR query)
   * const multiOwnerGroups = await rpc.group.findGroups(50, {
   *   ownerIn: ['0xOwner1...', '0xOwner2...']
   * });
   * ```
   */
  async findGroups(
    limit: number = 50,
    params?: GroupQueryParams,
    cursor?: string | null
  ): Promise<PagedResponse<GroupRow>> {
    const normalizedParams = params
      ? {
          nameStartsWith: params.nameStartsWith,
          symbolStartsWith: params.symbolStartsWith,
          ownerIn: params.ownerIn?.map((owner) => normalizeAddress(owner)),
        }
      : undefined;

    const response = await this.client.call<[number, typeof normalizedParams | null, string | null], PagedResponse<GroupRow>>(
      'circles_findGroups',
      [limit, normalizedParams ?? null, cursor ?? null]
    );

    const rows = checksumAddresses(response.results).map((row) => {
      const enriched = row as GroupRow & { mint?: Address };
      if (!enriched.owner && enriched.mint) {
        return { ...enriched, owner: enriched.mint } as GroupRow;
      }
      return enriched;
    });

    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: rows,
    };
  }

  /**
   * Get group memberships for an avatar
   *
   * Uses the native RPC method for efficient server-side queries.
   * Fetches all results using cursor-based pagination up to the specified limit.
   *
   * @param avatar - Avatar address to query group memberships for
   * @param limit - Maximum number of memberships to return (default: 50)
   * @returns Array of group membership rows
   *
   * @example
   * ```typescript
   * const memberships = await rpc.group.getGroupMemberships(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   50
   * );
   * console.log(memberships);
   * ```
   */
  async getGroupMemberships(
    avatar: Address,
    limit: number = 50,
    cursor?: string | null
  ): Promise<PagedResponse<GroupMembershipRow>> {
    const response = await this.client.call<[Address, number, string | null], PagedResponse<GroupMembershipRow>>(
      'circles_getGroupMemberships',
      [normalizeAddress(avatar), limit, cursor ?? null]
    );

    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }

  /**
   * Get members of a group
   *
   * Uses the native RPC method for efficient server-side queries.
   * Fetches all results using cursor-based pagination up to the specified limit.
   *
   * @param groupAddress - Group address to query members for
   * @param limit - Maximum number of members to return (default: 100)
   * @returns Array of group membership rows (members of the group)
   *
   * @example
   * ```typescript
   * const members = await rpc.group.getGroupMembers('0xGroupAddress...', 100);
   * console.log(`Group has ${members.length} members`);
   * ```
   */
  async getGroupMembers(
    groupAddress: Address,
    limit: number = 100,
    cursor?: string | null
  ): Promise<PagedResponse<GroupMembershipRow>> {
    const response = await this.client.call<[Address, number, string | null], PagedResponse<GroupMembershipRow>>(
      'circles_getGroupMembers',
      [normalizeAddress(groupAddress), limit, cursor ?? null]
    );

    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }

  /**
   * Get groups using cursor-based pagination
   *
   * Returns a PagedQuery instance that can be used to fetch groups page by page
   * using cursor-based pagination.
   *
   * @param limit - Number of groups per page (default: 50)
   * @param params - Optional query parameters to filter groups
   * @param sortOrder - Sort order for results (default: 'DESC')
   * @returns PagedQuery instance for iterating through groups
   *
   * @example
   * ```typescript
   * // Query all groups
   * const query = rpc.group.getGroups(50);
   *
   * // Query groups by owner(s)
   * const myGroupsQuery = rpc.group.getGroups(50, {
   *   ownerIn: ['0xMyAddress...']
   * });
   *
   * await myGroupsQuery.queryNextPage();
   * console.log(myGroupsQuery.currentPage.results);
   * ```
   */
  getGroups(
    limit: number = 50,
    params?: GroupQueryParams,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): PagedQuery<GroupRow> {
    const filter: Filter[] = [];

    if (params) {
      if (params.nameStartsWith) {
        filter.push({
          Type: 'FilterPredicate',
          FilterType: 'Like',
          Column: 'name',
          Value: params.nameStartsWith + '%',
        });
      }

      if (params.symbolStartsWith) {
        filter.push({
          Type: 'FilterPredicate',
          FilterType: 'Like',
          Column: 'symbol',
          Value: params.symbolStartsWith + '%',
        });
      }

      if (params.groupAddressIn && params.groupAddressIn.length > 0) {
        // Create an OR conjunction for matching any of the group addresses
        const addressPredicates = params.groupAddressIn.map((addr) => ({
          Type: 'FilterPredicate' as const,
          FilterType: 'Equals' as const,
          Column: 'group',
          Value: normalizeAddress(addr),
        }));

        if (addressPredicates.length === 1) {
          filter.push(addressPredicates[0]);
        } else {
          filter.push({
            Type: 'Conjunction',
            ConjunctionType: 'Or',
            Predicates: addressPredicates,
          });
        }
      }

      if (params.groupTypeIn && params.groupTypeIn.length > 0) {
        // Create an OR conjunction for matching any of the group types
        const typePredicates = params.groupTypeIn.map((type) => ({
          Type: 'FilterPredicate' as const,
          FilterType: 'Equals' as const,
          Column: 'type',
          Value: type,
        }));

        if (typePredicates.length === 1) {
          filter.push(typePredicates[0]);
        } else {
          filter.push({
            Type: 'Conjunction',
            ConjunctionType: 'Or',
            Predicates: typePredicates,
          });
        }
      }

      if (params.ownerIn && params.ownerIn.length > 0) {
        // Create an OR conjunction for matching any of the owners
        const ownerPredicates = params.ownerIn.map((addr) => ({
          Type: 'FilterPredicate' as const,
          FilterType: 'Equals' as const,
          Column: 'owner',
          Value: normalizeAddress(addr),
        }));

        if (ownerPredicates.length === 1) {
          filter.push(ownerPredicates[0]);
        } else {
          filter.push({
            Type: 'Conjunction',
            ConjunctionType: 'Or',
            Predicates: ownerPredicates,
          });
        }
      }

      if (params.mintHandlerEquals) {
        filter.push({
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'mintHandler',
          Value: normalizeAddress(params.mintHandlerEquals),
        });
      }

      if (params.treasuryEquals) {
        filter.push({
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'treasury',
          Value: normalizeAddress(params.treasuryEquals),
        });
      }
    }

    const finalFilter: Filter[] =
      filter.length > 1
        ? [
            {
              Type: 'Conjunction',
              ConjunctionType: 'And',
              Predicates: filter,
            },
          ]
        : filter;

    return new PagedQuery<GroupRow>(
      this.client,
      {
        namespace: 'V_CrcV2',
        table: 'Groups',
        sortOrder,
        columns: [
          'blockNumber',
          'timestamp',
          'transactionIndex',
          'logIndex',
          'transactionHash',
          'group',
          'type',
          'owner',
          'mintPolicy',
          'mintHandler',
          'treasury',
          'service',
          'feeCollection',
          'memberCount',
          'name',
          'symbol',
          'cidV0Digest',
          'erc20WrapperDemurraged',
          'erc20WrapperStatic',
        ],
        filter: finalFilter,
        limit,
      },
      (row) => checksumAddresses(row) as GroupRow
    );
  }

  /**
   * Get holders of a group token
   *
   * @param groupAddress - Group address (which is also the token address)
   * @param limit - Maximum number of holders to return (default: 100)
   * @returns PagedQuery instance for iterating through holders
   */
  getGroupHolders(
    groupAddress: Address,
    limit: number = 100
  ): PagedQuery<GroupTokenHolderRow> {
    const normalized = normalizeAddress(groupAddress);

    return new PagedQuery<GroupTokenHolderRow>(
      this.client,
      {
        namespace: 'V_Crc',
        table: 'TokenBalances',
        sortOrder: 'DESC',
        columns: [
          'blockNumber',
          'timestamp',
          'transactionIndex',
          'logIndex',
          'transactionHash',
          'token',
          'account',
          'balance',
          'lastChangedAt'
        ],
        filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'token',
            Value: normalized,
          }
        ],
        limit,
      },
      (row) => checksumAddresses(row) as unknown as GroupTokenHolderRow
    );
  }
}
