import { Contract } from './contract';
import { liftERC20Abi } from '@aboutcircles/sdk-abis/liftERC20';
import type { Address, TransactionRequest, Hex } from '@aboutcircles/sdk-types';
import { CirclesType } from '@aboutcircles/sdk-types';

/**
 * LiftERC20 Contract Wrapper
 * Provides type-safe methods for interacting with the Circles Lift (ERC20Lift) contract
 *
 * This contract is responsible for deploying and managing ERC20 wrappers for Circles tokens.
 * It creates either demurraged or inflationary ERC20 versions of Circles.
 *
 * This is a singleton contract deployed at a fixed address.
 */
export class LiftERC20Contract extends Contract<typeof liftERC20Abi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: liftERC20Abi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Get the ERC20 wrapper setup call prefix constant
   */
  async ERC20_WRAPPER_SETUP_CALLPREFIX(): Promise<Hex> {
    return this.read('ERC20_WRAPPER_SETUP_CALLPREFIX') as Promise<Hex>;
  }

  /**
   * Get the Hub contract address
   */
  async hub(): Promise<Address> {
    return this.read('hub') as Promise<Address>;
  }

  /**
   * Get the NameRegistry contract address
   */
  async nameRegistry(): Promise<Address> {
    return this.read('nameRegistry') as Promise<Address>;
  }

  /**
   * Get the master copy address for a specific CirclesType
   * @param circlesType 0 for Demurrage, 1 for Inflation
   */
  async masterCopyERC20Wrapper(circlesType: CirclesType): Promise<Address> {
    return this.read('masterCopyERC20Wrapper', [circlesType]) as Promise<Address>;
  }

  /**
   * Get the ERC20 wrapper address for a specific avatar and CirclesType
   * @param circlesType 0 for Demurrage, 1 for Inflation
   * @param avatar The avatar address
   * @returns The ERC20 wrapper address, or zero address if not deployed
   */
  async erc20Circles(circlesType: CirclesType, avatar: Address): Promise<Address> {
    return this.read('erc20Circles', [circlesType, avatar]) as Promise<Address>;
  }

  /**
   * Ensure an ERC20 wrapper exists for an avatar
   * Creates a new wrapper if it doesn't exist, or returns the existing one
   *
   * @param avatar The avatar address (must be a registered human or group)
   * @param circlesType The type of wrapper to create (Demurrage or Inflation)
   * @returns Transaction request that will return the wrapper address when executed
   */
  ensureERC20(
    avatar: Address,
    circlesType: CirclesType
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('ensureERC20', [avatar, circlesType]),
      value: BigInt(0),
    };
  }
}
