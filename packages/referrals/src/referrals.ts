import type { ReferralInfo, ReferralList, ApiError } from "./types.js";

/**
 * Referrals service client for storing and retrieving referral links
 *
 * The referrals backend enables Circles SDK users to invite others via referral links.
 * - Store: Save a referral private key with on-chain validation
 * - Retrieve: Get referral info by private key (public)
 * - List: Get all referrals created by authenticated user
 */
export class Referrals {
  /**
   * Create a new Referrals client
   *
   * @param baseUrl - The referrals service base URL (e.g., "https://referrals.circles.example")
   * @param getToken - Optional function to get auth token for authenticated endpoints
   */
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
    if (!this.getToken) {
      return { "Content-Type": "application/json" };
    }

    const token = await this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Store a referral private key
   *
   * The private key is validated on-chain via ReferralsModule.accounts() to ensure
   * the account exists and has not been claimed. The inviter address is self-declared
   * for dashboard visibility only - the on-chain indexer captures the true inviter.
   *
   * @param privateKey - The referral private key (0x-prefixed, 64 hex chars)
   * @param inviter - Self-declared inviter address for dashboard visibility
   * @throws Error if validation fails or key already exists
   */
  async store(privateKey: string, inviter: string): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/referral/store`, {
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
   * Retrieve referral info by private key
   *
   * This is a public endpoint - no authentication required.
   * Used by invitees to look up who invited them.
   *
   * @param privateKey - The referral private key
   * @returns Referral info including inviter and status
   * @throws Error if referral not found or expired
   */
  async retrieve(privateKey: string): Promise<ReferralInfo> {
    const response = await fetch(
      `${this.getBaseUrl()}/referral/retrieve?key=${encodeURIComponent(privateKey)}`
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
   *
   * @returns List of referrals with their status and metadata
   * @throws Error if not authenticated or request fails
   */
  async listMine(): Promise<ReferralList> {
    if (!this.getToken) {
      throw new Error("Authentication required to list referrals");
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.getBaseUrl()}/referral/my-referrals`, {
      headers,
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(error.error || `Failed to list referrals: ${response.statusText}`);
    }

    return response.json() as Promise<ReferralList>;
  }
}
