import type { Address } from '@aboutcircles/sdk-types';
import { PermissionlessGroupError } from './errors.js';
import type { ProofResponse } from './types.js';

/**
 * HTTP wrapper around the score-groups backend.
 *
 * Only read endpoints are needed by the SDK; write endpoints are JWT-gated and
 * consumed by the analytics service, not by clients.
 */
export class ScoreGroupsClient {
  public readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseUrl: string, fetchImpl: typeof fetch = fetch) {
    // Strip trailing slash so we can compose with leading-slash paths cleanly.
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.fetchImpl = fetchImpl;
  }

  /**
   * Fetch a leaf + Merkle proof for `user` in `group`'s tree.
   *
   * Returns 200 even for unknown addresses (with scoreRaw === "0" and a proof
   * for an empty leaf). The mint policy will reject those — surface as
   * `NotEligible` higher up, not as a backend error.
   */
  async getProof(group: Address, user: Address): Promise<ProofResponse> {
    const url = `${this.baseUrl}/groups/${group}/proof/${user}`;
    const res = await this.fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.status === 404) {
      throw PermissionlessGroupError.groupNotConfigured(group);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw PermissionlessGroupError.backendUnavailable(res.status, body);
    }

    return (await res.json()) as ProofResponse;
  }
}
