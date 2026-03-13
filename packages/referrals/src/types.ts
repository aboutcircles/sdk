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
export interface ReferralSession {
  id: string;
  slug: string;
  label: string | null;
}

export interface Referral {
  id: string;
  privateKey: string;
  status: ReferralStatus;
  accountAddress?: string;
  createdAt: string;
  pendingAt: string;
  staleAt: string | null;
  confirmedAt: string | null;
  claimedAt: string | null;
  /** Distribution sessions this key belongs to. Empty array if not assigned. */
  sessions: ReferralSession[];
}

export interface ReferralList {
  referrals: Referral[];
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

/**
 * Result from store-batch endpoint
 */
export interface StoreBatchResult {
  success: boolean;
  stored: number;
  failed: number;
  errors?: Array<{
    index: number;
    keyPreview: string;
    reason: string;
  }>;
}

/**
 * Referral preview returned from the public list/{address} endpoint (key is masked)
 */
export interface ReferralPreview {
  id: string;
  /** Masked private key preview (e.g. "0x1234...7890") */
  keyPreview: string;
  status: ReferralStatus;
  accountAddress: string | null;
  createdAt: string;
  pendingAt: string | null;
  staleAt: string | null;
  confirmedAt: string | null;
  claimedAt: string | null;
  /** Whether this key is also present in at least one distribution session */
  inSession: boolean;
}

/**
 * Paginated response from the public list/{address} endpoint
 */
export interface ReferralPreviewList {
  referrals: ReferralPreview[];
  count: number;
  total: number;
  limit: number;
  offset: number;
  /** 'synced' = fresh RPC check, 'cached' = DB-cached status (30s TTL) */
  syncStatus: "synced" | "cached";
}

// ── Distribution Sessions ─────────────────────────────────────────────────────

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
 * A single key entry within a distribution session
 */
export interface SessionKey {
  id: string;
  privateKey: string;
  signerAddress: string | null;
  accountAddress: string | null;
  status: "queued" | "dispatched" | "claimed";
  dispatchedAt: string | null;
  claimedAt: string | null;
  addedAt: string;
}

/**
 * Paginated list of keys in a distribution session
 */
export interface SessionKeyList {
  keys: SessionKey[];
  total: number;
  queuedCount: number;
  dispatchedCount: number;
  claimedCount: number;
  limit: number;
  offset: number;
}

/**
 * Result from adding keys to a distribution session
 */
export interface AddKeysResult {
  added: number;
  skipped: number;
  claimed: number;
  errors: Array<{ key: string; error: string }>;
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
