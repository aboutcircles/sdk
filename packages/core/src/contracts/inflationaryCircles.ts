import { BaseWrappedCirclesContract } from './baseWrappedCircles';
import { inflationaryCirclesAbi } from '@aboutcircles/sdk-abis/inflationaryCircles';
import type { Address } from '@aboutcircles/sdk-types';

/**
 * InflationaryCircles Contract Wrapper
 * Provides type-safe methods for interacting with Circles InflationaryCircles (ERC20 wrapper) contracts
 *
 * Inflationary circles maintain their value over time without applying demurrage discounts.
 * This wrapper provides standard ERC20 functionality with Circles-specific features.
 *
 * Note: InflationaryCircles contracts have multiple instances (not a singleton).
 * Create instances with specific contract addresses.
 *
 * @example
 * ```typescript
 * const inflationaryCircles = new InflationaryCirclesContract({
 *   address: '0x...', // specific InflationaryCircles instance address
 *   rpcUrl: 'https://rpc.gnosischain.com'
 * });
 * ```
 */
export class InflationaryCirclesContract extends BaseWrappedCirclesContract<typeof inflationaryCirclesAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: inflationaryCirclesAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  // No additional methods - inflationary circles only have the base functionality
}
