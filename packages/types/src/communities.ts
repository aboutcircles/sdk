import type { Address } from './base.js';

/**
 * Community (GA 2.0) types.
 *
 * A community = an underlying Circles group + a bilateral handshake. The
 * MultiAffiliateGroupRegistry stores the avatar's on-chain *intent* (the "wishlist");
 * a group becomes a confirmed membership once it also trusts the avatar. These rows
 * are returned by the `circles_get*Communit*` RPC methods.
 */

/**
 * One community in a per-avatar wishlist / confirmed-membership list.
 */
export interface CommunityRow {
  /** Community profile name, or `null` when the community has no profile/name. */
  communityName: string | null;
  /** The community's address. */
  communityAddress: Address;
  /**
   * The community's membership fee — a percent in `[0,100]` of the avatar's daily gCRC
   * mint (`membershipCriteria.membershipFee` in the group profile), or `null` when
   * the community sets no fee. A `null` fee contributes `0` to `totalFeePercentage`.
   */
  membershipFee: number | null;
  /** Unix seconds of the winning `AffiliateGroupAdded` event. */
  timestamp: number;
}

/**
 * Per-avatar wishlist / confirmed-membership response: the communities plus the summed fee.
 */
export interface CommunityListResponse {
  /** Sum of `membershipFee` across `communities` (null fees count as 0). */
  totalFeePercentage: number;
  communities: CommunityRow[];
}

/**
 * One member in a per-community members wishlist / confirmed-members list.
 */
export interface CommunityMemberRow {
  /** Member avatar profile name, or `null` when none. */
  avatarName: string | null;
  /** The member avatar's address. */
  avatarAddress: Address;
  /** Unix seconds of the winning `AffiliateGroupAdded` event. */
  timestamp: number;
}
