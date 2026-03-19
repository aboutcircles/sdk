import type { RpcClient } from '../client.js';
import type { Address, GroupRow, GroupMembershipRow, GroupQueryParams, Filter } from '@aboutcircles/sdk-types';
import type { GroupTokenHolderRow } from '../types.js';
import { normalizeAddress, checksumAddresses } from '../utils.js';
import { PagedQuery } from '../pagedQuery.js';

/**
 * Group query RPC methods
 */
export class GroupMethods {
  constructor(private client: RpcClient) {}

  /**
   * Find groups with optional filters
   *
   * This is a convenience method that fetches all pages using cursor-based pagination
   * and returns the combined results up to the specified limit.
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
    params?: GroupQueryParams
  ): Promise<GroupRow[]> {
    // Create the paged query
    const query = this.getGroups(limit, params, 'DESC');
    const results: GroupRow[] = [];

    // Fetch all pages up to the limit
    while (await query.queryNextPage()) {
      results.push(...query.currentPage!.results);

      // If we have enough results, break
      if (results.length >= limit) {
        break;
      }

      // If no more pages, break
      if (!query.currentPage!.hasMore) {
        break;
      }
    }

    // Apply limit
    return results.slice(0, limit);
  }

  /**
   * Get group memberships for an avatar using cursor-based pagination
   *
   * @param avatar - Avatar address to query group memberships for
   * @param limit - Number of memberships per page (default: 50)
   * @param sortOrder - Sort order for results (default: 'DESC')
   * @returns PagedQuery instance for iterating through memberships
   *
   * @example
   * ```typescript
   * const query = rpc.group.getGroupMemberships(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   50
   * );
   * await query.queryNextPage();
   * console.log(query.currentPage.results);
   * ```
   */
  getGroupMemberships(
    avatar: Address,
    limit: number = 50,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): PagedQuery<GroupMembershipRow> {
    const normalized = normalizeAddress(avatar);

    return new PagedQuery<GroupMembershipRow>(
      this.client,
      {
        namespace: 'V_CrcV2',
        table: 'GroupMemberships',
        sortOrder,
        columns: [
          'blockNumber',
          'timestamp',
          'transactionIndex',
          'logIndex',
          'transactionHash',
          'group',
          'member',
          'expiryTime',
        ],
        filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'member',
            Value: normalized,
          },
        ],
        limit,
      },
      (row) => checksumAddresses(row) as GroupMembershipRow
    );
  }

  /**
   * Get holders of a group token using cursor-based pagination
   *
   * Returns a PagedQuery instance that can be used to fetch holders page by page.
   * Results are ordered by totalBalance DESC (highest first), with holder address as tie-breaker.
   *
   * Note: Pagination uses holder address as cursor because totalBalance (BigInt) values
   * cannot be reliably passed through JSON-RPC filters. This means pagination boundaries
   * are based on holder addresses, not balances.
   *
   * @param groupAddress - The address of the group token
   * @param limit - Number of holders per page (default: 100)
   * @returns PagedQuery instance for iterating through group token holders
   *
   * @example
   * ```typescript
   * const query = rpc.group.getGroupHolders('0xGroupAddress...', 50);
   *
   * // Get first page (ordered by totalBalance DESC)
   * await query.queryNextPage();
   * console.log(query.currentPage.results[0]); // Holder with highest balance
   *
   * // Get next page if available
   * if (query.currentPage.hasMore) {
   *   await query.queryNextPage();
   * }
   * ```
   */
  getGroupHolders(
    groupAddress: Address,
    limit: number = 100
  ): PagedQuery<GroupTokenHolderRow> {
    const normalized = normalizeAddress(groupAddress);

    return new PagedQuery<GroupTokenHolderRow>(this.client, {
      namespace: 'V_CrcV2',
      table: 'GroupTokenHoldersBalance',
      sortOrder: 'DESC',
      columns: ['group', 'holder', 'totalBalance', 'demurragedTotalBalance', 'fractionOwnership'],
      cursorColumns: [
        {
          name: 'holder',
          sortOrder: 'ASC', // Use holder for cursor-based pagination
        },
      ],
      orderColumns: [
        { Column: 'totalBalance', SortOrder: 'DESC' },
        { Column: 'holder', SortOrder: 'ASC' },
      ],
      filter: [
        {
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'group',
          Value: normalized,
        },
      ],
      limit,
      rowTransformer: (row: any) => {
        // Convert string values to bigint for specific fields
        const transformed = {
          ...row,
          totalBalance: BigInt(row.totalBalance),
          demurragedTotalBalance: BigInt(row.demurragedTotalBalance),
        };
        return checksumAddresses(transformed) as GroupTokenHolderRow;
      },
    });
  }

  /**
   * Get members of a group using cursor-based pagination
   *
   * Returns a PagedQuery instance that can be used to fetch members page by page
   * using cursor-based pagination.
   *
   * @param groupAddress - The address of the group to query members for
   * @param limit - Number of members per page (default: 100)
   * @param sortOrder - Sort order for results (default: 'DESC')
   * @returns PagedQuery instance for iterating through group members
   *
   * @example
   * ```typescript
   * const query = rpc.group.getGroupMembers('0xGroupAddress...', 100);
   *
   * // Get first page
   * await query.queryNextPage();
   * console.log(query.currentPage.results);
   *
   * // Get next page if available
   * if (query.currentPage.hasMore) {
   *   await query.queryNextPage();
   *   console.log(query.currentPage.results);
   * }
   * ```
   */
  getGroupMembers(
    groupAddress: Address,
    limit: number = 100,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): PagedQuery<GroupMembershipRow> {
    const normalized = normalizeAddress(groupAddress);

    return new PagedQuery<GroupMembershipRow>(
      this.client,
      {
        namespace: 'V_CrcV2',
        table: 'GroupMemberships',
        sortOrder,
        columns: [
          'blockNumber',
          'timestamp',
          'transactionIndex',
          'logIndex',
          'transactionHash',
          'group',
          'member',
          'expiryTime',
        ],
        filter: [
          {
            Type: 'FilterPredicate',
            FilterType: 'Equals',
            Column: 'group',
            Value: normalized,
          },
        ],
        limit,
      },
      (row) => checksumAddresses(row) as GroupMembershipRow
    );
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
}
