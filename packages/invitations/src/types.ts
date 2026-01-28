/**
 * Referral status lifecycle
 */
export type ReferralStatus = "pending" | "confirmed" | "claimed" | "expired";

/**
 * Referral info returned from retrieve endpoint
 */
export interface ReferralInfo {
  /** The inviter's Ethereum address */
  inviter: string;
  /** Current status of the referral */
  status: ReferralStatus;
  /** The Safe account address (if available) */
  accountAddress?: string;
}

/**
 * Full referral record returned from my-referrals endpoint
 */
export interface Referral {
  /** Unique identifier */
  id: string;
  /** The referral private key */
  privateKey: string;
  /** Current status */
  status: ReferralStatus;
  /** The Safe account address */
  accountAddress?: string;
  /** When the referral was created */
  createdAt: string;
  /** When the account was confirmed on-chain */
  confirmedAt: string | null;
  /** When the account was claimed */
  claimedAt: string | null;
}

/**
 * Response from my-referrals endpoint
 */
export interface ReferralList {
  /** List of referrals */
  referrals: Referral[];
  /** Total count */
  count: number;
}

/**
 * Referral preview returned from the list endpoint (key is masked)
 */
export interface ReferralPreview {
  /** Unique identifier */
  id: string;
  /** Masked private key preview (e.g. "0x123456...cdef") */
  keyPreview: string;
  /** Current status */
  status: ReferralStatus;
  /** The Safe account address */
  accountAddress: string | null;
  /** When the referral was created */
  createdAt: string;
  /** When the referral entered pending state */
  pendingAt: string | null;
  /** When the referral became stale */
  staleAt: string | null;
  /** When the account was confirmed on-chain */
  confirmedAt: string | null;
  /** When the account was claimed */
  claimedAt: string | null;
}

/**
 * Paginated response from referrals/list endpoint
 */
export interface ReferralPreviewList {
  referrals: ReferralPreview[];
  count: number;
  total: number;
  limit: number;
  offset: number;
}

/**
 * Error response from API
 */
export interface ApiError {
  error: string;
}
