import { BaseWrappedCirclesContract } from './baseWrappedCircles';
import { demurrageCirclesAbi } from '@aboutcircles/sdk-abis/demurrageCircles';
import type { Address } from '@aboutcircles/sdk-types';

/**
 * DemurrageCircles Contract Wrapper
 * Provides type-safe methods for interacting with Circles DemurrageCircles (ERC20 wrapper) contracts
 *
 * Demurrage circles apply a discount over time, reducing the balance gradually.
 * This wrapper includes demurrage-specific methods in addition to standard ERC20 functionality.
 *
 * Note: DemurrageCircles contracts have multiple instances (not a singleton).
 * Create instances with specific contract addresses.
 *
 * @example
 * ```typescript
 * const demurrageCircles = new DemurrageCirclesContract({
 *   address: '0x...', // specific DemurrageCircles instance address
 *   rpcUrl: 'https://rpc.gnosischain.com'
 * });
 * ```
 */
export class DemurrageCirclesContract extends BaseWrappedCirclesContract<typeof demurrageCirclesAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: demurrageCirclesAbi,
      rpcUrl: config.rpcUrl,
    });
  }


  // ============================================================================
  // Demurrage-Specific Methods
  // ============================================================================

  /**
   * Get the balance of an account on a specific day
   * This is a demurrage-specific feature that calculates historical balance
   * accounting for the demurrage discount applied over time.
   *
   * @param account The account address to check
   * @param day The day number to check the balance for
   * @returns [balanceOnDay, discountCost] - The balance on that day and the discount cost
   */
  async balanceOfOnDay(account: Address, day: bigint): Promise<readonly [bigint, bigint]> {
    return this.read('balanceOfOnDay', [account, day]) as Promise<readonly [bigint, bigint]>;
  }

  /**
   * Get the discounted balance information for an account
   * Returns the current discounted balance and when it was last updated.
   *
   * @param account The account address to check
   * @returns [balance, lastUpdatedDay] - Current discounted balance and the day it was last updated
   */
  async discountedBalances(account: Address): Promise<readonly [bigint, bigint]> {
    return this.read('discountedBalances', [account]) as Promise<readonly [bigint, bigint]>;
  }
}
