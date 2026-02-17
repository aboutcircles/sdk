import type { RpcClient } from '../client';
import type { Address, Profile, ProfileView, ProfileSearchResponse } from '@aboutcircles/sdk-types';
import type { SearchResultProfile } from '../types';
import { normalizeAddress } from '../utils';

/**
 * Profile RPC methods
 */
export class ProfileMethods {
  constructor(private client: RpcClient) {}

  /**
   * Get a profile by its CID
   *
   * @param cid - The CID of the profile
   * @returns Profile information or null if not found
   *
   * @example
   * ```typescript
   * const profile = await rpc.profile.getProfileByCid('Qmb2s3hjxXXcFqWvDDSPCd1fXXa9gcFJd8bzdZNNAvkq9W');
   * console.log(profile);
   * ```
   */
  async getProfileByCid(cid: string): Promise<Profile | null> {
    return this.client.call<[string], Profile | null>('circles_getProfileByCid', [cid]);
  }

  /**
   * Get many profiles by CID in batch
   *
   * @param cids - Array of CIDs (null values are allowed in the array)
   * @returns Array of profiles (null for not found)
   *
   * @example
   * ```typescript
   * const profiles = await rpc.profile.getProfileByCidBatch([
   *   'Qmb2s3hjxXXcFqWvDDSPCd1fXXa9gcFJd8bzdZNNAvkq9W',
   *   null,
   *   'QmZuR1Jkhs9RLXVY28eTTRSnqbxLTBSoggp18Yde858xCM'
   * ]);
   * ```
   */
  async getProfileByCidBatch(cids: (string | null)[]): Promise<(Profile | null)[]> {
    return this.client.call<[(string | null)[]], (Profile | null)[]>(
      'circles_getProfileByCidBatch',
      [cids]
    );
  }

  /**
   * Query the profile for an avatar address
   *
   * @param address - The avatar address
   * @returns Profile information or null if not found
   *
   * @example
   * ```typescript
   * const profile = await rpc.profile.getProfileByAddress('0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7');
   * console.log(profile);
   * ```
   */
  async getProfileByAddress(address: Address): Promise<Profile | null> {
    return this.client.call<[Address], Profile | null>('circles_getProfileByAddress', [
      normalizeAddress(address),
    ]);
  }

  /**
   * Query profiles by address in batch
   *
   * @param addresses - Array of addresses (null values are allowed in the array)
   * @returns Array of profiles (null for not found)
   *
   * @example
   * ```typescript
   * const profiles = await rpc.profile.getProfileByAddressBatch([
   *   '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7',
   *   null,
   *   '0xf712d3b31de494b5c0ea51a6a407460ca66b12e8'
   * ]);
   * ```
   */
  async getProfileByAddressBatch(addresses: (Address | null)[]): Promise<(Profile | null)[]> {
    return this.client.call<[(Address | null)[]], (Profile | null)[]>(
      'circles_getProfileByAddressBatch',
      [addresses.map((addr) => (addr === null ? null : normalizeAddress(addr)))]
    );
  }

  /**
   * Search profiles by name, description or address
   *
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 10)
   * @param offset - Offset for pagination (default: 0)
   * @param avatarTypes - Optional array of avatar types to filter by (e.g., ['CrcV2_RegisterHuman', 'CrcV2_RegisterGroup'])
   * @returns Array of matching profiles
   *
   * @example
   * ```typescript
   * const results = await rpc.profile.searchProfiles('alice', 10, 0);
   * console.log(results);
   *
   * // Search only humans
   * const humans = await rpc.profile.searchProfiles('alice', 10, 0, ['CrcV2_RegisterHuman']);
   * ```
   */
  async searchProfiles(
    query: string,
    limit: number = 10,
    offset: number = 0,
    avatarTypes?: string[]
  ): Promise<SearchResultProfile[]> {
    return this.client.call<[string, number, number, string[] | undefined], SearchResultProfile[]>(
      'circles_searchProfiles',
      [
        query.toLowerCase(),
        limit,
        offset,
        avatarTypes
      ]
    );
  }

  /**
   * Search profiles by address or username
   * If the query is a valid address, it will search by address first,
   * otherwise it will search by name/description
   *
   * @param query - Search query (address or username)
   * @param limit - Maximum number of results (default: 10)
   * @param cursor - Pagination cursor from previous response (null for first page)
   * @param avatarTypes - Optional array of avatar types to filter by
   * @returns Search results with profiles and search type indicator
   *
   * @example
   * ```typescript
   * // Search by username
   * const results = await rpc.profile.searchByAddressOrName('alice', 20);
   *
   * // Search by address
   * const results = await rpc.profile.searchByAddressOrName('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 20);
   * ```
   */
  async searchByAddressOrName(
    query: string,
    limit: number = 10,
    cursor?: string | null,
    avatarTypes?: string[]
  ): Promise<ProfileSearchResponse> {
    return this.client.call<[string, number, string | null, string[]?], ProfileSearchResponse>(
      'circles_searchProfileByAddressOrName',
      avatarTypes ? [query, limit, cursor ?? null, avatarTypes] : [query, limit, cursor ?? null]
    );
  }
  /**
   * Get a consolidated profile view
   * Combines avatar info, profile data, trust stats, and balances in a single call
   *
   * @param address - The address to get the view for
   * @returns Profile view data
   */
  async getProfileView(address: Address): Promise<ProfileView> {
    return this.client.call<[Address], ProfileView>('circles_getProfileView', [
      normalizeAddress(address),
    ]);
  }
}
