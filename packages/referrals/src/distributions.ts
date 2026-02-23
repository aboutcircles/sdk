import {
  DispenseError,
  type DistributionSession,
  type DistributionSessionList,
  type CreateSessionParams,
  type UpdateSessionParams,
  type DispenseResult,
  type DispenseErrorCode,
  type ApiError,
} from "./types.js";

/**
 * HTTP client for distribution session management.
 *
 * Distribution sessions gate access to an inviter's key pool via
 * quota, expiry, and pause controls. Each session gets a unique slug
 * for QR codes / links.
 *
 * No authentication required — sessions are rate-limited and the
 * slug itself is the capability token.
 */
export class Distributions {
  constructor(private readonly baseUrl: string) {}

  private getBaseUrl(): string {
    return this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
  }

  /**
   * Create a distribution session.
   *
   * @param params - Session parameters (inviterAddress, quota, optional label/expiresAt)
   * @returns The created session including its unique slug
   */
  async createSession(
    params: CreateSessionParams
  ): Promise<DistributionSession> {
    const response = await fetch(
      `${this.getBaseUrl()}/distributions/sessions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(
        error.error || `Failed to create session: ${response.statusText}`
      );
    }

    return response.json() as Promise<DistributionSession>;
  }

  /**
   * List distribution sessions for an inviter address.
   *
   * @param inviter - Ethereum address to filter by
   * @param opts - Pagination options (limit 1-100, offset)
   */
  async listSessions(
    inviter: string,
    opts?: { limit?: number; offset?: number }
  ): Promise<DistributionSessionList> {
    const params = new URLSearchParams({ inviter });
    if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
    if (opts?.offset !== undefined) params.set("offset", String(opts.offset));

    const response = await fetch(
      `${this.getBaseUrl()}/distributions/sessions?${params}`
    );

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(
        error.error || `Failed to list sessions: ${response.statusText}`
      );
    }

    return response.json() as Promise<DistributionSessionList>;
  }

  /**
   * Get a single distribution session by ID.
   *
   * @param id - Session UUID
   */
  async getSession(id: string): Promise<DistributionSession> {
    const response = await fetch(
      `${this.getBaseUrl()}/distributions/sessions/${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(
        error.error || `Failed to get session: ${response.statusText}`
      );
    }

    return response.json() as Promise<DistributionSession>;
  }

  /**
   * Update a distribution session.
   *
   * Cannot set quota below current dispensedCount.
   *
   * @param id - Session UUID
   * @param params - Fields to update (label, quota, expiresAt, paused)
   */
  async updateSession(
    id: string,
    params: UpdateSessionParams
  ): Promise<DistributionSession> {
    const response = await fetch(
      `${this.getBaseUrl()}/distributions/sessions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(
        error.error || `Failed to update session: ${response.statusText}`
      );
    }

    return response.json() as Promise<DistributionSession>;
  }

  /**
   * Delete a distribution session.
   *
   * Rejected if any keys have been dispensed (audit trail preservation).
   *
   * @param id - Session UUID
   */
  async deleteSession(id: string): Promise<void> {
    const response = await fetch(
      `${this.getBaseUrl()}/distributions/sessions/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(
        error.error || `Failed to delete session: ${response.statusText}`
      );
    }
  }

  /**
   * Dispense a key via a distribution session slug.
   *
   * The slug is the capability token — knowing it grants access
   * to dispense keys through that session (subject to quota/expiry/pause).
   *
   * @param slug - Distribution session slug (from QR code / link)
   * @returns The dispensed key, inviter address, and optional claim URL
   * @throws {DispenseError} with typed code for programmatic handling:
   *   - `SESSION_NOT_FOUND` (404) — slug doesn't exist
   *   - `POOL_EMPTY` (404) — no keys left in inviter's pool
   *   - `SESSION_EXPIRED` (410) — session expired or quota exhausted
   *   - `SESSION_PAUSED` (423) — session is paused
   *   - `RATE_LIMITED` (429) — too many requests
   */
  async dispense(slug: string): Promise<DispenseResult> {
    const response = await fetch(
      `${this.getBaseUrl()}/d/${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      let message: string;
      let code: DispenseErrorCode;

      try {
        const error = (await response.json()) as ApiError;
        message = error.error;
      } catch {
        message = response.statusText;
      }

      switch (response.status) {
        case 404:
          // Distinguish pool empty from not found by message content
          code = message.includes("keys available") ? "POOL_EMPTY" : "SESSION_NOT_FOUND";
          break;
        case 410:
          code = "SESSION_EXPIRED";
          break;
        case 423:
          code = "SESSION_PAUSED";
          break;
        case 429:
          code = "RATE_LIMITED";
          break;
        default:
          code = "UNKNOWN";
      }

      throw new DispenseError(message, code, response.status);
    }

    return response.json() as Promise<DispenseResult>;
  }
}
