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
 * Error response from API
 */
export interface ApiError {
  error: string;
}

// ── Distribution Sessions ──────────────────────────────────────────

/**
 * A distribution session gates access to an inviter's key pool
 * via quota, expiry, and pause controls.
 */
export interface DistributionSession {
  id: string;
  slug: string;
  inviterAddress: string;
  label: string | null;
  quota: number;
  dispensedCount: number;
  expiresAt: string | null;
  paused: boolean;
  createdAt: string;
  updatedAt: string;
  /** Full URL for QR codes (only when DISTRIBUTION_BASE_URL is configured) */
  distributionUrl: string | null;
}

/**
 * Paginated list of distribution sessions
 */
export interface DistributionSessionList {
  sessions: DistributionSession[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Parameters for creating a distribution session
 */
export interface CreateSessionParams {
  /** Inviter's Ethereum address whose key pool this session draws from */
  inviterAddress: string;
  /** Maximum number of keys this session can dispense */
  quota: number;
  /** Human-readable label (e.g. "ETHDenver 2026 booth") */
  label?: string;
  /** ISO 8601 expiry timestamp */
  expiresAt?: string;
}

/**
 * Parameters for updating a distribution session
 */
export interface UpdateSessionParams {
  label?: string;
  quota?: number;
  /** New expiry (ISO 8601), or null to remove expiry */
  expiresAt?: string | null;
  paused?: boolean;
}

/**
 * Result from dispensing a key via a distribution session slug.
 * Returned by `GET /d/{slug}`.
 */
export interface DispenseResult {
  /** Full private key for the invitation link */
  privateKey: string;
  /** Inviter address that owns the key pool */
  inviter: string;
  /** Pre-built claim URL (only when DISTRIBUTION_BASE_URL configured) */
  claimUrl?: string;
  /** The session slug this key was dispensed through */
  sessionSlug: string;
}

/**
 * Error codes returned when dispense fails.
 * Allows callers to show appropriate UI for each failure mode.
 */
export type DispenseErrorCode =
  | "SESSION_NOT_FOUND"   // 404 - slug doesn't exist
  | "POOL_EMPTY"          // 404 - no keys left in inviter's pool
  | "SESSION_EXPIRED"     // 410 - session has expired
  | "QUOTA_EXHAUSTED"     // 410 - session quota exhausted
  | "SESSION_PAUSED"      // 423 - session is paused
  | "RATE_LIMITED"        // 429 - too many requests
  | "UNKNOWN";            // other errors

/**
 * Typed error thrown by dispense() with a code for programmatic handling.
 */
export class DispenseError extends Error {
  constructor(
    message: string,
    public readonly code: DispenseErrorCode,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = "DispenseError";
  }
}

// ── Session CRUD Errors ─────────────────────────────────────────────

/**
 * Error codes for distribution session CRUD operations.
 * Allows callers to programmatically distinguish failure modes.
 */
export type SessionErrorCode =
  | "VALIDATION_ERROR"    // 400
  | "NOT_FOUND"           // 404
  | "CONFLICT"            // 409
  | "SERVER_ERROR";       // 5xx

/**
 * Typed error thrown by session CRUD methods with HTTP status and code
 * for programmatic handling.
 */
export class SessionError extends Error {
  constructor(
    message: string,
    public readonly code: SessionErrorCode,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = "SessionError";
  }
}
