import type { RpcClient } from '../client.js';
import type { Address, Profile } from '@aboutcircles/sdk-types';
import type { SearchResultProfile } from '../types.js';
import { normalizeAddress } from '../utils.js';

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
   * @param offset - Offset for pagination (default: 0)
   * @param avatarTypes - Optional array of avatar types to filter by
   * @returns Array of matching profiles, with exact address match (if valid) at the top
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
    offset: number = 0,
    avatarTypes?: string[]
  ): Promise<SearchResultProfile[]> {
    const results: SearchResultProfile[] = [];

    // Check if query is a valid address
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(query);

    if (isAddress) {
      // Try to get profile by address first
      try {
        const profile = await this.getProfileByAddress(query as Address);
        if (profile) {
          // Convert Profile to SearchResultProfile by adding address
          const searchResult: SearchResultProfile = {
            ...profile,
            address: query as Address
          };
          // Check if profile matches avatar type filter
          if (!avatarTypes || !searchResult.avatarType || avatarTypes.includes(searchResult.avatarType)) {
            results.push(searchResult);
          }
        }
      } catch (error) {
        console.warn('Failed to get profile by address:', error);
      }
    }

    // Always search by text as well
    try {
      const textResults = await this.searchProfiles(query, limit, offset, avatarTypes);

      // If we already added an address match, filter it out from text results to avoid duplicates
      if (isAddress && results.length > 0) {
        const addressLower = query.toLowerCase();
        const filteredResults = textResults.filter(
          p => p.address?.toLowerCase() !== addressLower
        );
        results.push(...filteredResults);
      } else {
        results.push(...textResults);
      }
    } catch (error) {
      console.warn('Failed to search profiles by text:', error);
    }

    return results.slice(0, limit);
  }
}
