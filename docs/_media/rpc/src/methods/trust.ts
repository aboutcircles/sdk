import type { RpcClient } from '../client';
import type { Address, TrustRelation, Filter, CirclesQueryResponse, TrustRelationType, AggregatedTrustRelation } from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils';
import { PagedQuery } from '../pagedQuery';

/**
 * Trust relation RPC methods
 */
export class TrustMethods {
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
   * Query the common trust relations of two addresses
   * (only common outgoing trust relations are considered)
   *
   * @param address1 - First address
   * @param address2 - Second address
   * @returns Array of common trusted addresses
   *
   * @example
   * ```typescript
   * const commonTrust = await rpc.trust.getCommonTrust(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   '0xe8fc7a2d0573e5164597b05f14fa9a7fca7b215c'
   * );
   * ```
   */
  // @todo check if we need to normilize addr before the call
  async getCommonTrust(address1: Address, address2: Address): Promise<Address[]> {
    const result = await this.client.call<[Address, Address], Address[]>('circles_getCommonTrust', [
      normalizeAddress(address1),
      normalizeAddress(address2),
    ]);
    return checksumAddresses(result);
  }

  /**
   * Get trust relations for an address using cursor-based pagination
   *
   * Returns a PagedQuery instance for iterating through all v2 trust relations for the given avatar.
   *
   * @param avatar - Avatar address to query trust relations for
   * @param limit - Number of trust relations per page (default: 100)
   * @param sortOrder - Sort order for results (default: 'DESC')
   * @returns PagedQuery instance for iterating through trust relations
   *
   * @example
   * ```typescript
   * const query = rpc.trust.getTrustRelations('0xAvatar...', 100);
   *
   * // Get first page
   * await query.queryNextPage();
   * query.currentPage.results.forEach(relation => {
   *   console.log(`${relation.truster} trusts ${relation.trustee}`);
   * });
   * ```
   */
  getTrustRelations(
    avatar: Address,
    limit: number = 100,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): PagedQuery<TrustRelation> {
    const normalized = normalizeAddress(avatar);

    const filter: Filter[] = [
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
            Type: 'Conjunction',
            ConjunctionType: 'Or',
            Predicates: [
              {
                Type: 'FilterPredicate',
                FilterType: 'Equals',
                Column: 'trustee',
                Value: normalized,
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
      },
    ];

    return new PagedQuery<TrustRelation>(
      this.client,
      {
        namespace: 'V_Crc',
        table: 'TrustRelations',
        sortOrder,
        columns: [
          'blockNumber',
          'timestamp',
          'transactionIndex',
          'logIndex',
          'transactionHash',
          'version',
          'trustee',
          'truster',
          'expiryTime',
        ],
        filter,
        limit,
      },
      (row) => checksumAddresses(row) as TrustRelation
    );
  }

  /**
   * Get aggregated trust relations for an address
   * Groups trust relations by counterpart and determines relationship type
   *
   * Uses the server-side aggregation RPC method for optimal performance.
   *
   * @param avatar - Avatar address to query trust relations for
   * @returns Aggregated trust relations with relationship types
   *
   * @example
   * ```typescript
   * const aggregated = await rpc.trust.getAggregatedTrustRelations(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7'
   * );
   * // Returns: [
   * //   { subjectAvatar: '0x...', relation: 'mutuallyTrusts', objectAvatar: '0x...', timestamp: 123 },
   * //   { subjectAvatar: '0x...', relation: 'trusts', objectAvatar: '0x...', timestamp: 456 }
   * // ]
   * ```
   */
  async getAggregatedTrustRelations(avatar: Address): Promise<AggregatedTrustRelation[]> {
    const normalized = normalizeAddress(avatar);

    // Use server-side aggregation for optimal performance (single RPC call)
    const result = await this.client.call<[Address], AggregatedTrustRelation[]>(
      'circles_getAggregatedTrustRelations',
      [normalized]
    );

    return checksumAddresses(result);
  }

  /**
   * Get addresses that trust the given avatar (incoming trust)
   *
   * @param avatar - Avatar address to query
   * @returns Array of trust relations where others trust this avatar
   *
   * @example
   * ```typescript
   * const trustedBy = await rpc.trust.getTrustedBy(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7'
   * );
   * ```
   */
  async getTrustedBy(avatar: Address): Promise<AggregatedTrustRelation[]> {
    const normalized = normalizeAddress(avatar);
    const relations = await this.getAggregatedTrustRelations(normalized);
    const filtered = relations.filter((r) => r.relation === 'trustedBy');
    return checksumAddresses(filtered);
  }

  /**
   * Get addresses that the given avatar trusts (outgoing trust)
   *
   * @param avatar - Avatar address to query
   * @returns Array of trust relations where this avatar trusts others
   *
   * @example
   * ```typescript
   * const trusts = await rpc.trust.getTrusts(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7'
   * );
   * ```
   */
  async getTrusts(avatar: Address): Promise<AggregatedTrustRelation[]> {
    const normalized = normalizeAddress(avatar);
    const relations = await this.getAggregatedTrustRelations(normalized);
    const filtered = relations.filter((r) => r.relation === 'trusts');
    return checksumAddresses(filtered);
  }

  /**
   * Get mutual trust relations for the given avatar
   *
   * @param avatar - Avatar address to query
   * @returns Array of trust relations where both parties trust each other
   *
   * @example
   * ```typescript
   * const mutualTrusts = await rpc.trust.getMutualTrusts(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7'
   * );
   * ```
   */
  async getMutualTrusts(avatar: Address): Promise<AggregatedTrustRelation[]> {
    const normalized = normalizeAddress(avatar);
    const relations = await this.getAggregatedTrustRelations(normalized);
    const filtered = relations.filter((r) => r.relation === 'mutuallyTrusts');
    return checksumAddresses(filtered);
  }
}
