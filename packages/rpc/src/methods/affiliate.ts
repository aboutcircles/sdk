import type { RpcClient } from '../client.js';
import type {
  Address,
  AffiliateGroupRow,
  AffiliateGroupListResponse,
  AffiliateGroupMemberRow,
  PagedResponse,
} from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils.js';

/**
 * Affiliate-group ("communities", GA 2.0) RPC methods.
 *
 * Backed by the MultiAffiliateGroupRegistry: an avatar signals on-chain *intent* to join
 * a group (the "wishlist"); a group becomes a confirmed membership once it also trusts the
 * avatar (the bilateral handshake) — so the **trusted** subset always lags, and is a subset
 * of, the wishlist. Each group's `membershipFee` is read off its profile; an avatar's fees
 * across all communities are capped at 100% by the consumer (the registry does not enforce
 * it). Use {@link getAffiliateGroupFeesPercentage} for the pre-join cap check.
 *
 * Write side (signalling intent) is `MultiAffiliateGroupRegistryContract` in `@aboutcircles/sdk-core`.
 *
 * @remarks These methods are served by the indexer RPC and roll out staging-first; an RPC
 * endpoint that predates the feature rejects them with JSON-RPC `-32601` (method not found),
 * so callers should degrade gracefully (treat `-32601` as "unavailable on this endpoint").
 * They always read chain head — `X-Max-Block-Number` block-pinning is a no-op here.
 */
export class AffiliateMethods {
  constructor(private client: RpcClient) {}

  /**
   * The groups an avatar has signalled intent to join (the wishlist), each with its
   * membership fee, plus the summed total committed fee percentage.
   *
   * @param avatar - The avatar whose wishlist to read
   *
   * @example
   * ```typescript
   * const { totalFeePercentage, groups } = await rpc.affiliate.getAffiliateGroupWishlist(
   *   '0x112b5cee910a077e4bd28ec158e35653b3ac2350'
   * );
   * ```
   */
  async getAffiliateGroupWishlist(avatar: Address): Promise<AffiliateGroupListResponse> {
    const response = await this.client.call<[Address], AffiliateGroupListResponse>(
      'circles_getAffiliateGroupWishlist',
      [normalizeAddress(avatar)]
    );
    return normalizeListResponse(response);
  }

  /**
   * The confirmed-membership subset of the wishlist: groups that currently trust the
   * avatar on-chain. `totalFeePercentage` is summed over this confirmed subset, so it
   * reflects the TMS trust delay (a wished group only appears here once it trusts the avatar).
   *
   * @param avatar - The avatar whose confirmed communities to read
   */
  async getAffiliateGroups(avatar: Address): Promise<AffiliateGroupListResponse> {
    const response = await this.client.call<[Address], AffiliateGroupListResponse>(
      'circles_getAffiliateGroups',
      [normalizeAddress(avatar)]
    );
    return normalizeListResponse(response);
  }

  /**
   * The avatar's total committed fee percentage across its **wishlist** (intent set) —
   * the number to check against the 100% cap before signalling a new join.
   *
   * @param avatar - The avatar whose committed fee total to read
   * @returns The summed fee percentage (a `null` per-group fee counts as 0)
   */
  async getAffiliateGroupFeesPercentage(avatar: Address): Promise<number> {
    const response = await this.client.call<[Address], { totalFeePercentage?: number } | null>(
      'circles_getAffiliateGroupFeesPercentage',
      [normalizeAddress(avatar)]
    );
    return Number(response?.totalFeePercentage ?? 0);
  }

  /**
   * The avatars that have signalled intent to join the group (the group's members
   * wishlist). This is the set the TMS reconciles against. Paginated.
   *
   * @param groupAddress - The group whose intended members to list
   * @param limit - Max members per page (1–1000, clamped server-side; default 100)
   * @param cursor - Opaque page token from a prior `nextCursor` (omit for the first page)
   */
  async getAffiliateGroupMembersWishlist(
    groupAddress: Address,
    limit: number = 100,
    cursor?: string | null
  ): Promise<PagedResponse<AffiliateGroupMemberRow>> {
    const response = await this.client.call<[Address, number, string | null], PagedResponse<AffiliateGroupMemberRow>>(
      'circles_getAffiliateGroupMembersWishlist',
      [normalizeAddress(groupAddress), limit, cursor ?? null]
    );
    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }

  /**
   * The confirmed-membership subset of a group's wishlist: avatars the group actually
   * trusts on-chain. Reflects the TMS trust delay. Paginated.
   *
   * @param groupAddress - The group whose confirmed members to list
   * @param limit - Max members per page (1–1000, clamped server-side; default 100)
   * @param cursor - Opaque page token from a prior `nextCursor` (omit for the first page)
   */
  async getAffiliateGroupMembers(
    groupAddress: Address,
    limit: number = 100,
    cursor?: string | null
  ): Promise<PagedResponse<AffiliateGroupMemberRow>> {
    const response = await this.client.call<[Address, number, string | null], PagedResponse<AffiliateGroupMemberRow>>(
      'circles_getAffiliateGroupMembers',
      [normalizeAddress(groupAddress), limit, cursor ?? null]
    );
    return {
      hasMore: response.hasMore,
      nextCursor: response.nextCursor,
      results: checksumAddresses(response.results),
    };
  }
}

/** Checksum group addresses and coerce the summed fee to a number (a null total → 0). */
function normalizeListResponse(response: AffiliateGroupListResponse): AffiliateGroupListResponse {
  return {
    totalFeePercentage: Number(response?.totalFeePercentage ?? 0),
    groups: checksumAddresses(response?.groups ?? ([] as AffiliateGroupRow[])),
  };
}
