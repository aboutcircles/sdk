import type { RpcClient } from '../client.js';
import type {
  Address,
  CommunityRow,
  CommunityListResponse,
  CommunityMemberRow,
  PagedResponse,
} from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils.js';

/**
 * Community (GA 2.0) RPC methods.
 *
 * Backed by the MultiAffiliateGroupRegistry: an avatar signals on-chain *intent* to join
 * a community (the "wishlist"); a community becomes a confirmed membership once it also
 * trusts the avatar (the bilateral handshake) — so the **trusted** subset always lags,
 * and is a subset of, the wishlist. Each community's `membershipFee` is read off its
 * profile; an avatar's fees across all communities are capped at 100% by the consumer
 * (the registry does not enforce it). Use {@link getAvatarCommunityFeesPercentage} for
 * the pre-join cap check.
 *
 * Write side (signalling intent) is `MultiAffiliateGroupRegistryContract` in `@aboutcircles/sdk-core`.
 *
 * @remarks These methods are served by the indexer RPC and roll out staging-first; an RPC
 * endpoint that predates the feature rejects them with JSON-RPC `-32601` (method not found),
 * so callers should degrade gracefully (treat `-32601` as "unavailable on this endpoint").
 * They always read chain head — `X-Max-Block-Number` block-pinning is a no-op here.
 */
export class CommunityMethods {
  constructor(private client: RpcClient) {}

  /**
   * The communities an avatar has signalled intent to join (the wishlist), each with its
   * membership fee, plus the summed total committed fee percentage.
   *
   * @param avatar - The avatar whose wishlist to read
   *
   * @example
   * ```typescript
   * const { totalFeePercentage, communities } = await rpc.communities.getAvatarCommunitiesWishlist(
   *   '0x112b5cee910a077e4bd28ec158e35653b3ac2350'
   * );
   * ```
   */
  async getAvatarCommunitiesWishlist(avatar: Address): Promise<CommunityListResponse> {
    const response = await this.client.call<[Address], CommunityListResponse>(
      'circles_getAvatarCommunitiesWishlist',
      [normalizeAddress(avatar)]
    );
    return normalizeListResponse(response);
  }

  /**
   * The confirmed-membership subset of the wishlist: communities that currently trust the
   * avatar on-chain. `totalFeePercentage` is summed over this confirmed subset, so it
   * reflects the TMS trust delay (a wished community only appears here once it trusts the avatar).
   *
   * @param avatar - The avatar whose confirmed communities to read
   */
  async getAvatarCommunities(avatar: Address): Promise<CommunityListResponse> {
    const response = await this.client.call<[Address], CommunityListResponse>(
      'circles_getAvatarCommunities',
      [normalizeAddress(avatar)]
    );
    return normalizeListResponse(response);
  }

  /**
   * The avatar's total committed fee percentage across its **wishlist** (intent set) —
   * the number to check against the 100% cap before signalling a new join.
   *
   * @param avatar - The avatar whose committed fee total to read
   * @returns The summed fee percentage (a `null` per-community fee counts as 0)
   */
  async getAvatarCommunityFeesPercentage(avatar: Address): Promise<number> {
    const response = await this.client.call<[Address], { totalFeePercentage?: number } | null>(
      'circles_getAvatarCommunityFeesPercentage',
      [normalizeAddress(avatar)]
    );
    return Number(response?.totalFeePercentage ?? 0);
  }

  /**
   * The avatars that have signalled intent to join the community (the community's members
   * wishlist). This is the set the TMS reconciles against. Paginated.
   *
   * @param communityAddress - The community whose intended members to list
   * @param limit - Max members per page (1–1000, clamped server-side; default 100)
   * @param cursor - Opaque page token from a prior `nextCursor` (omit for the first page)
   */
  async getCommunityMembersWishlist(
    communityAddress: Address,
    limit: number = 100,
    cursor?: string | null
  ): Promise<PagedResponse<CommunityMemberRow>> {
    const response = await this.client.call<[Address, number, string | null], PagedResponse<CommunityMemberRow>>(
      'circles_getCommunityMembersWishlist',
      [normalizeAddress(communityAddress), limit, cursor ?? null]
    );
    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }

  /**
   * The confirmed-membership subset of a community's wishlist: avatars the community actually
   * trusts on-chain. Reflects the TMS trust delay. Paginated.
   *
   * @param communityAddress - The community whose confirmed members to list
   * @param limit - Max members per page (1–1000, clamped server-side; default 100)
   * @param cursor - Opaque page token from a prior `nextCursor` (omit for the first page)
   */
  async getCommunityMembers(
    communityAddress: Address,
    limit: number = 100,
    cursor?: string | null
  ): Promise<PagedResponse<CommunityMemberRow>> {
    const response = await this.client.call<[Address, number, string | null], PagedResponse<CommunityMemberRow>>(
      'circles_getCommunityMembers',
      [normalizeAddress(communityAddress), limit, cursor ?? null]
    );
    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }
}

/** Checksum community addresses and coerce the summed fee to a number (a null total → 0). */
function normalizeListResponse(response: CommunityListResponse): CommunityListResponse {
  return {
    totalFeePercentage: Number(response?.totalFeePercentage ?? 0),
    communities: checksumAddresses(response?.communities ?? ([] as CommunityRow[])),
  };
}
