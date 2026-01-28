import type { ReferralInfo, ReferralList, ApiError } from "./types";
import { InvitationError } from "./errors";

/**
 * Referrals service client for retrieving referral information
 *
 * The referrals backend enables Circles SDK users to query referral data:
 * - Retrieve: Get referral info by private key (public)
 * - List: Get all referrals created by authenticated user
 *
 * Note: Storing referrals is handled by Invitations.generateReferral()
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
   * Retrieve referral info by private key
   *
   * This is a public endpoint - no authentication required.
   * Used by invitees to look up who invited them.
   *
   * @param privateKey - The referral private key
   * @returns Referral info including inviter and status
   * @throws InvitationError if referral not found or expired
   */
  async retrieve(privateKey: string): Promise<ReferralInfo> {
    try {
      const url = `${this.getBaseUrl()}/retrieve?key=${encodeURIComponent(privateKey)}`;
      const response = await fetch(url);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = (await response.json()) as ApiError;
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        throw new InvitationError(errorMessage, {
          code: 'INVITATION_RETRIEVE_FAILED',
          source: 'INVITATIONS',
          context: { status: response.status, url, privateKey }
        });
      }

      return response.json() as Promise<ReferralInfo>;
    } catch (error) {
      if (error instanceof InvitationError) {
        throw error;
      }
      throw new InvitationError(`Failed to retrieve referral: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        code: 'INVITATION_RETRIEVE_ERROR',
        source: 'INVITATIONS',
        cause: error,
        context: { privateKey }
      });
    }
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
