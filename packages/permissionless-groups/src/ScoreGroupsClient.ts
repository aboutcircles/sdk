import type { Address } from '@aboutcircles/sdk-types';
import { PermissionlessGroupError } from './errors.js';
import type { MintLimitsBatchEntry, ProofResponse } from './types.js';

const BATCH_LIMIT = 100;

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

  /**
   * Per-collateral migration caps for a fixed `group` across many `users`
   * (collateral providers). Wraps `POST /groups/mint-limits/batch` in
   * `groupUsers` mode and transparently re-batches when the input exceeds the
   * backend's 100-cell cap. Returns one cell per unique address — failed
   * cells stay in the response with `ok: false` so callers can react per
   * collateral instead of failing the whole migration.
   */
  async getMintLimitsBatch(
    group: Address,
    users: Address[]
  ): Promise<MintLimitsBatchEntry[]> {
    if (users.length === 0) return [];

    const seen = new Set<string>();
    const unique = users.filter((u) => {
      const key = u.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const all: MintLimitsBatchEntry[] = [];
    for (let offset = 0; offset < unique.length; offset += BATCH_LIMIT) {
      const chunk = unique.slice(offset, offset + BATCH_LIMIT);
      const url = `${this.baseUrl}/groups/mint-limits/batch`;
      const res = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ mode: 'groupUsers', group, users: chunk }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw PermissionlessGroupError.backendUnavailable(res.status, body);
      }

      const { results } = (await res.json()) as { results: MintLimitsBatchEntry[] };
      all.push(...results);
    }
    return all;
  }
}
