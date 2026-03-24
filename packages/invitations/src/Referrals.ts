import type { ReferralInfo, ReferralList, StoreBatchResult, ApiError } from "./types.js";
import { InvitationError } from "./errors.js";

/**
 * Referrals service client for retrieving referral information
 *
 * The referrals backend enables Circles SDK users to query referral data:
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
    const base: Record<string, string> = { "Content-Type": "application/json" };
    if (!this.getToken) return base;
    const token = await this.getToken();
    return { ...base, Authorization: `Bearer ${token}` };
  }

  /**
   * Store a referral private key
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
   *
   * Returns ReferralInfo for both active (200) and already-claimed (410) referrals.
   * The caller can check `result.status === 'claimed'` to branch accordingly.
   */
  async retrieve(privateKey: string): Promise<ReferralInfo> {
    const url = `${this.getBaseUrl()}/retrieve?key=${encodeURIComponent(privateKey)}`;
    const response = await fetch(url);

    // 410 = already claimed — body still contains valid ReferralInfo
    if (response.status === 410 || response.ok) {
      return response.json() as Promise<ReferralInfo>;
    }

    const body = await response.json().catch(() => null);
    const message = (body as ApiError)?.error || `Failed to retrieve referral: ${response.statusText}`;
    throw new InvitationError(message, {
      code: 'INVITATION_RETRIEVE_FAILED',
      source: 'INVITATIONS',
      context: { status: response.status, url, privateKey }
    });
  }

  /**
   * List all referrals created by the authenticated user
   *
   * Requires authentication - the user's address is extracted from the JWT token.
   *
   * @returns List of referrals with their status and metadata
   * @throws InvitationError if not authenticated or request fails
   */
  async listMine(): Promise<ReferralList> {
    if (!this.getToken) {
      throw new InvitationError("Authentication required to list referrals", {
        code: 'INVITATION_AUTH_REQUIRED',
        source: 'INVITATIONS'
      });
    }

    try {
      const url = `${this.getBaseUrl()}/my-referrals`;
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, { headers });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = (await response.json()) as ApiError;
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        throw new InvitationError(errorMessage, {
          code: 'INVITATION_LIST_FAILED',
          source: 'INVITATIONS',
          context: { status: response.status, url }
        });
      }

      return response.json() as Promise<ReferralList>;
    } catch (error) {
      if (error instanceof InvitationError) {
        throw error;
      }
      throw new InvitationError(`Failed to list referrals: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        code: 'INVITATION_LIST_ERROR',
        source: 'INVITATIONS',
        cause: error
      });
    }
  }
}
