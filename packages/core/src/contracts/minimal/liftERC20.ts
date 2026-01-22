import { Contract } from '../contract';
import { liftERC20MinimalAbi } from '@aboutcircles/sdk-abis/minimal/liftERC20';
import type { Address } from '@aboutcircles/sdk-types';
import { CirclesType } from '@aboutcircles/sdk-types';

/**
 * Minimal LiftERC20 Contract for TransferBuilder
 * Contains only the methods required for building transfer transactions
 */
export class LiftERC20ContractMinimal extends Contract<typeof liftERC20MinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: liftERC20MinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  async erc20Circles(circlesType: CirclesType, avatar: Address): Promise<Address> {
    return this.read('erc20Circles', [circlesType, avatar]) as Promise<Address>;
  }
}
