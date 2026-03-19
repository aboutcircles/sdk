import type { RpcClient } from '../client.js';
import type { Address, TokenInfo, TokenHolder, SortOrder } from '@aboutcircles/sdk-types';
import { normalizeAddress, parseStringsToBigInt, checksumAddresses } from '../utils.js';
import { PagedQuery } from '../pagedQuery.js';

/**
 * Token information RPC methods
 */
export class TokenMethods {
  constructor(private client: RpcClient) {}

  /**
   * Get token information for a specific token address
   *
   * @param address - The token address to query
   * @returns Token information or undefined if not found
   *
   * @example
   * ```typescript
   * const tokenInfo = await rpc.token.getTokenInfo('0x0d8c4901dd270fe101b8014a5dbecc4e4432eb1e');
   * console.log(tokenInfo);
   * ```
   */
  async getTokenInfo(address: Address): Promise<TokenInfo | undefined> {
    const results = await this.getTokenInfoBatch([address]);
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get token information for multiple token addresses in batch
   *
   * @param addresses - Array of token addresses to query
   * @returns Array of token information objects
   *
   * @example
   * ```typescript
   * const tokenInfos = await rpc.token.getTokenInfoBatch([
   *   '0x0d8c4901dd270fe101b8014a5dbecc4e4432eb1e',
   *   '0x86533d1ada8ffbe7b6f7244f9a1b707f7f3e239b'
   * ]);
   * ```
   */
  async getTokenInfoBatch(addresses: Address[]): Promise<TokenInfo[]> {
    if (addresses.length === 0) {
      return [];
    }

    const normalizedAddresses = addresses.map(addr => normalizeAddress(addr));
    const result = await this.client.call<[Address[]], Record<string, unknown>[]>(
      'circles_getTokenInfoBatch',
      [normalizedAddresses]
    );

    const parsed = result.map(item => parseStringsToBigInt(item)) as unknown as TokenInfo[];
    return checksumAddresses(parsed);
  }

  /**
   * Get token holders for a specific token address with pagination
   *
   * @param tokenAddress - The token address to query holders for
   * @param limit - Maximum number of results per page (default: 100)
   * @param sortOrder - Sort order for results (default: 'DESC' - highest balance first)
   * @returns PagedQuery instance for token holders
   *
   * @example
   * ```typescript
   * const holdersQuery = rpc.token.getTokenHolders('0x42cedde51198d1773590311e2a340dc06b24cb37', 10);
   *
   * while (await holdersQuery.queryNextPage()) {
   *   const page = holdersQuery.currentPage!;
   *   console.log(`Found ${page.size} holders`);
   *   page.results.forEach(holder => {
   *     console.log(`${holder.account}: ${holder.demurragedTotalBalance}`);
   *   });
   * }
   * ```
   */
  getTokenHolders(
    tokenAddress: Address,
    limit: number = 100,
    sortOrder: SortOrder = 'DESC'
  ): PagedQuery<TokenHolder> {
    const normalizedTokenAddress = normalizeAddress(tokenAddress);

    return new PagedQuery<TokenHolder>(
      this.client,
      {
        namespace: 'V_CrcV2',
        table: 'BalancesByAccountAndToken',
        columns: ['account', 'tokenAddress', 'demurragedTotalBalance'],
        filter: [{
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'tokenAddress',
          Value: normalizedTokenAddress
        }],
        cursorColumns: [
          { name: 'demurragedTotalBalance', sortOrder },
          { name: 'account', sortOrder: 'ASC' } // Secondary sort for deterministic ordering
        ],
        orderColumns: [
          { Column: 'demurragedTotalBalance', SortOrder: sortOrder },
          { Column: 'account', SortOrder: 'ASC' }
        ],
        limit,
        sortOrder
      },
      (row: any) => ({
        account: row.account,
        tokenAddress: row.tokenAddress,
        demurragedTotalBalance: row.demurragedTotalBalance
      })
    );
  }
}
