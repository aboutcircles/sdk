import type { Address } from './base.js';

/**
 * Affiliate-group ("communities", GA 2.0) types.
 *
 * A community = an underlying Circles group + a bilateral handshake. The
 * MultiAffiliateGroupRegistry stores the avatar's on-chain *intent* (the "wishlist");
 * a group becomes a confirmed membership once it also trusts the avatar. These rows
 * are returned by the `circles_getAffiliateGroup*` RPC methods.
 */

/**
 * One affiliate group in a per-avatar wishlist / confirmed-membership list.
 */
export interface AffiliateGroupRow {
  /** Group profile name, or `null` when the group has no profile/name. */
  groupName: string | null;
  /** The group's address. */
  groupAddress: Address;
  /**
   * The group's membership fee — a percent in `[0,100]` of the avatar's daily gCRC
   * mint (`membershipCriteria.membershipFee` in the group profile), or `null` when
   * the group sets no fee. A `null` fee contributes `0` to `totalFeePercentage`.
   */
  membershipFee: number | null;
  /** Unix seconds of the winning `AffiliateGroupAdded` event. */
  timestamp: number;
}

/**
 * Per-avatar wishlist / confirmed-membership response: the groups plus the summed fee.
 */
export interface AffiliateGroupListResponse {
  /** Sum of `membershipFee` across `groups` (null fees count as 0). */
  totalFeePercentage: number;
  groups: AffiliateGroupRow[];
}

/**
 * One member in a per-group members wishlist / confirmed-members list.
 */
export interface AffiliateGroupMemberRow {
  /** Member avatar profile name, or `null` when none. */
  avatarName: string | null;
  /** The member avatar's address. */
  avatarAddress: Address;
  /** Unix seconds of the winning `AffiliateGroupAdded` event. */
  timestamp: number;
}
