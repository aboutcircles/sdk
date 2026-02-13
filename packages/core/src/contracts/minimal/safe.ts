import { Contract } from '../contract';
import { safeMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Minimal Safe Contract for invitation module setup.
 * The address is the inviter's Safe wallet address.
 */
export class SafeContractMinimal extends Contract<typeof safeMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: safeMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  async isModuleEnabled(module: Address): Promise<boolean> {
    return this.read('isModuleEnabled', [module]) as Promise<boolean>;
  }

  enableModule(module: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('enableModule', [module]),
      value: 0n,
    };
  }
}
