import type { RpcClient } from '../client.js';
import type { Address, AvatarInfo, NetworkSnapshot } from '@aboutcircles/sdk-types';
import { normalizeAddress, checksumAddresses } from '../utils.js';

/**
 * Avatar and network RPC methods
 */
export class AvatarMethods {
  constructor(private client: RpcClient) {}

  /**
   * Get information about a specific avatar
   *
   * @param address - The avatar address to query
   * @returns Avatar information
   *
   * @example
   * ```typescript
   * const info = await rpc.avatar.getAvatarInfo('0xde374ece6fa50e781e81aac78e811b33d16912c7');
   * console.log(info);
   * ```
   */
  async getAvatarInfo(address: Address): Promise<AvatarInfo | undefined> {
    const results = await this.getAvatarInfoBatch([address]);
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get information about multiple avatars in batch
   *
   * @param addresses - Array of avatar addresses to query
   * @returns Array of avatar information objects
   *
   * @example
   * ```typescript
   * const infos = await rpc.avatar.getAvatarInfoBatch([
   *   '0xde374ece6fa50e781e81aac78e811b33d16912c7',
   *   '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7'
   * ]);
   * ```
   */
  async getAvatarInfoBatch(addresses: Address[]): Promise<AvatarInfo[]> {
    if (addresses.length === 0) {
      return [];
    }

    const normalizedAddresses = addresses.map(addr => normalizeAddress(addr));
    const result = await this.client.call<[Address[]], AvatarInfo[]>(
      'circles_getAvatarInfoBatch',
      [normalizedAddresses]
    );

    return checksumAddresses(result);
  }

  /**
   * Download a full snapshot of the Circles network state
   * (current trust relations and balances)
   *
   * @returns Network snapshot with trust relations and balances
   *
   * @example
   * ```typescript
   * const snapshot = await rpc.avatar.getNetworkSnapshot();
   * console.log(snapshot);
   * ```
   */
  async getNetworkSnapshot(): Promise<NetworkSnapshot> {
    const result = await this.client.call<[], NetworkSnapshot>('circles_getNetworkSnapshot', []);
    return checksumAddresses(result);
  }
  // @todo is backer
  // @todo is batch backer
  // @todo get backers
}
