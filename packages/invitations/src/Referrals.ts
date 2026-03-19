import type { ReferralInfo, ReferralList, ReferralPreviewList, StoreBatchResult, ApiError } from "./types.js";

/**
 * Referrals service client for storing and retrieving referral links
 *
 * The referrals backend enables Circles SDK users to invite others via referral links.
 * - Store: Save a referral private key with on-chain validation
 * - Retrieve: Get referral info by private key (public)
 * - List: Get all referrals created by authenticated user
 */
export class Referrals {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken?: () => Promise<string>
  ) {}

  private getBaseUrl(): string {
    return this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const base: Record<string, string> = { "Content-Type": "application/json" };
    if (!this.getToken) return base;
    const token = await this.getToken();
    return { ...base, Authorization: `Bearer ${token}` };
  }

  /**
   * Store a referral private key
   *
   * The private key is validated on-chain via ReferralsModule.accounts() to ensure
   * the account exists and has not been claimed. The inviter address is self-declared
   * for dashboard visibility only - the on-chain indexer captures the true inviter.
   */
  async store(privateKey: string, inviter: string): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ privateKey, inviter }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(error.error || `Failed to store referral: ${response.statusText}`);
    }
  }

  /**
   * Store multiple referral private keys in a single request (max 200)
   *
   * Processing is independent — one failure doesn't block others.
   */
  async storeBatch(
    invitations: Array<{ privateKey: string; inviter: string }>
  ): Promise<StoreBatchResult> {
    const response = await fetch(`${this.getBaseUrl()}/store-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitations }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(error.error || `Failed to store batch: ${response.statusText}`);
    }

    return response.json() as Promise<StoreBatchResult>;
  }

  /**
   * Retrieve referral info by private key (public endpoint, no auth required)
   */
  async retrieve(privateKey: string): Promise<ReferralInfo> {
    const response = await fetch(
      `${this.getBaseUrl()}/retrieve?key=${encodeURIComponent(privateKey)}`
    );

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(error.error || `Failed to retrieve referral: ${response.statusText}`);
    }

    return response.json() as Promise<ReferralInfo>;
  }

  /**
   * List all referrals created by the authenticated user
   *
   * Requires authentication - the user's address is extracted from the JWT token.
   */
  async listMine(opts?: {
    limit?: number;
    offset?: number;
    inSession?: boolean;
    status?: string;
  }): Promise<ReferralList> {
    if (!this.getToken) {
      throw new Error("Authentication required to list referrals");
    }

    const params = new URLSearchParams();
    if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
    if (opts?.offset !== undefined) params.set("offset", String(opts.offset));
    if (opts?.inSession !== undefined) params.set("inSession", String(opts.inSession));
    if (opts?.status !== undefined) params.set("status", opts.status);

    const query = params.toString() ? `?${params}` : "";
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.getBaseUrl()}/my-referrals${query}`, { headers });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(error.error || `Failed to list referrals: ${response.statusText}`);
    }

    return response.json() as Promise<ReferralList>;
  }

  /**
   * List referrals for a given address (public, no auth required)
   *
   * Returns masked key previews — full keys are never exposed here.
   */
  async listPublic(
    address: string,
    opts?: { limit?: number; offset?: number; inSession?: boolean }
  ): Promise<ReferralPreviewList> {
    const params = new URLSearchParams();
    if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
    if (opts?.offset !== undefined) params.set("offset", String(opts.offset));
    if (opts?.inSession !== undefined) params.set("inSession", String(opts.inSession));

    const query = params.toString() ? `?${params}` : "";
    const response = await fetch(
      `${this.getBaseUrl()}/list/${encodeURIComponent(address)}${query}`
    );

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(error.error || `Failed to list referrals: ${response.statusText}`);
    }

    return response.json() as Promise<ReferralPreviewList>;
  }
}
