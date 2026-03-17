import { Contract } from '../contract';
import { wrappedCirclesMinimalAbi } from '@aboutcircles/sdk-abis/minimal/wrappedCircles';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Minimal DemurrageCircles Contract for TransferBuilder
 * Contains only the unwrap method required for building transfer transactions
 */
export class DemurrageCirclesContractMinimal extends Contract<typeof wrappedCirclesMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: wrappedCirclesMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  unwrap(amount: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('unwrap', [amount]),
      value: 0n,
    };
  }
}

/**
 * Minimal InflationaryCircles Contract for TransferBuilder
 * Contains only the unwrap method required for building transfer transactions
 */
export class InflationaryCirclesContractMinimal extends Contract<typeof wrappedCirclesMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: wrappedCirclesMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  unwrap(amount: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('unwrap', [amount]),
      value: 0n,
    };
  }
}
