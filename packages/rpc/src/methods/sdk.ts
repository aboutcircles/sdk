import type {
  Address,
  ProfileView,
  TrustNetworkSummary,
  AggregatedTrustRelation,
  ValidInvitersResponse,
  PagedResponse,
  EnrichedTransaction,
  ProfileSearchResponse
} from '@aboutcircles/sdk-types';
import type { RpcClient } from '../client';
import { normalizeAddress, checksumAddresses } from '../utils';

/**
 * SDK Enablement RPC methods
 * These methods reduce SDK round-trips by consolidating common multi-call patterns
 */
export class SdkMethods {
  constructor(private client: RpcClient) {}

  /**
   * Get a complete profile view combining avatar info, profile data, trust stats, and balances
   * 
   * Replaces 6-7 separate RPC calls:
   * - circles_getAvatarInfo
   * - circles_getProfileByAddress
   * - circles_getTrustRelations
   * - circles_getTotalBalance (v1)
   * - circlesV2_getTotalBalance (v2)
   *
   * @param address - Avatar address to query
   * @returns Consolidated profile view with all data
   *
   * @example
   * ```typescript
   * const profileView = await rpc.sdk.getProfileView('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(`${profileView.profile?.name} has ${profileView.trustStats.trustsCount} trusts`);
   * console.log(`V2 Balance: ${profileView.v2Balance}`);
   * ```
   */
  async getProfileView(address: Address): Promise<ProfileView> {
    const normalizedAddress = normalizeAddress(address);
    return this.client.call<[Address], ProfileView>(
      'circles_getProfileView',
      [normalizedAddress]
    );
  }

  /**
   * Get aggregated trust network summary including mutual trusts and network reach
   * 
   * Server-side aggregation reduces client-side processing and provides ready-to-display statistics.
   * Network reach = (trusts ∪ trustedBy).count = trustsCount + trustedByCount - mutualTrustsCount
   *
   * @param address - Avatar address to query
   * @param maxDepth - Maximum network depth to analyze (default: 2)
   * @returns Trust network summary with aggregated metrics
   *
   * @example
   * ```typescript
   * const summary = await rpc.sdk.getTrustNetworkSummary('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(`Network reach: ${summary.networkReach}`);
   * console.log(`Mutual trusts: ${summary.mutualTrustsCount}`);
   * ```
   */
  async getTrustNetworkSummary(
    address: Address,
    maxDepth: number = 2
  ): Promise<TrustNetworkSummary> {
    const normalizedAddress = normalizeAddress(address);
    return this.client.call<[Address, number], TrustNetworkSummary>(
      'circles_getTrustNetworkSummary',
      [normalizedAddress, maxDepth]
    );
  }

  /**
   * Get trust relations categorized by type (mutual, one-way trusts, one-way trusted-by)
   * 
   * Replaces client-side categorization + multiple getAvatarInfo calls.
   * Returns relationships organized for easy UI rendering (different icons/colors per type).
   *
   * @param address - Avatar address to query
   * @returns Trust relations categorized with enriched avatar info
   *
   * @example
   * ```typescript
   * const relations = await rpc.sdk.getAggregatedTrustRelations('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * // Returns flat array: [{subjectAvatar, relation, objectAvatar, ...}]
   * const mutual = relations.filter(r => r.relation === 'mutuallyTrusts');
   * console.log(`Mutual trusts: ${mutual.length}`);
   * ```
   */
  async getAggregatedTrustRelations(address: Address): Promise<AggregatedTrustRelation[]> {
    const normalizedAddress = normalizeAddress(address);
    return this.client.call<[Address], AggregatedTrustRelation[]>(
      'circles_getAggregatedTrustRelations',
      [normalizedAddress]
    );
  }

  /**
   * Get list of addresses that trust you AND have sufficient balance to invite
   * 
   * Useful for invitation flows and invitation escrow scenarios.
   * Server-side filtering reduces data transfer and client-side processing.
   *
   * @param address - Avatar address to query
   * @param minimumBalance - Optional minimum balance threshold (as TimeCircles string)
   * @returns List of valid inviters with balances and avatar info
   *
   * @example
   * ```typescript
   * // Find all potential inviters
   * const inviters = await rpc.sdk.getValidInviters('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * 
   * // Find inviters with at least 50 CRC balance
   * const richInviters = await rpc.sdk.getValidInviters(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   '50.0'
   * );
   * ```
   */
  async getValidInviters(
    address: Address,
    minimumBalance?: string
  ): Promise<ValidInvitersResponse> {
    const normalizedAddress = normalizeAddress(address);
    const response = await this.client.call<[Address, string?], ValidInvitersResponse>(
      'circles_getValidInviters',
      minimumBalance ? [normalizedAddress, minimumBalance] : [normalizedAddress]
    );

    return checksumAddresses(response);
  }

  /**
   * Get transaction history with enriched participant profiles and metadata
   * 
   * Replaces circles_events + multiple getProfileByAddress calls + client-side event processing.
   * Returns transaction history ready for UI display with participant names and avatars.
   *
   * @param address - Avatar address to query
   * @param fromBlock - Starting block number
   * @param toBlock - Optional ending block number (null for latest)
   * @param limit - Maximum number of transactions (default: 50)
   * @returns Enriched transaction history with participant profiles
   *
   * @example
   * ```typescript
   * const history = await rpc.sdk.getTransactionHistoryEnriched(
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   30282299,
   *   null,
   *   20
   * );
   *
   * for (const tx of history.results) {
   *   console.log(`Tx: ${tx.transactionHash}, event: ${JSON.stringify(tx.event)}`);
   *   // Access participant profiles via tx.participants[address]
   * }
   * ```
   */
  async getTransactionHistoryEnriched(
    address: Address,
    fromBlock: number = 0,
    toBlock: number | null = null,
    limit: number = 50,
    cursor?: string | null
  ): Promise<PagedResponse<EnrichedTransaction>> {
    const normalizedAddress = normalizeAddress(address);
    const response = await this.client.call<[Address, number, number | null, number, string | null], PagedResponse<EnrichedTransaction>>(
      'circles_getTransactionHistoryEnriched',
      [normalizedAddress, fromBlock, toBlock, limit, cursor ?? null]
    );

    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }

  /**
   * Unified search across profiles by address prefix OR name/description text
   * 
   * Combines address lookup and full-text search in a single endpoint.
   * Automatically detects search type based on query format (0x prefix = address search).
   *
   * @param query - Search query (address prefix or name/description text)
   * @param limit - Maximum number of results (default: 20)
   * @param offset - Pagination offset (default: 0)
   * @param types - Optional array of avatar types to filter by
   * @returns Unified search results with profiles
   *
   * @example
   * ```typescript
   * // Search by name
   * const byName = await rpc.sdk.searchProfileByAddressOrName('Alice');
   * 
   * // Search by address prefix
   * const byAddress = await rpc.sdk.searchProfileByAddressOrName('0xde374');
   * 
   * // Search with filters
   * const filtered = await rpc.sdk.searchProfileByAddressOrName(
   *   'developer',
   *   10,
   *   0,
   *   ['CrcV2_RegisterHuman']
   * );
   * ```
   */
  async searchProfileByAddressOrName(
    query: string,
    limit: number = 20,
    offset: number = 0,
    types?: string[]
  ): Promise<ProfileSearchResponse> {
    return this.client.call<[string, number, number, string[]?], ProfileSearchResponse>(
      'circles_searchProfileByAddressOrName',
      types ? [query, limit, offset, types] : [query, limit, offset]
    );
  }
}
