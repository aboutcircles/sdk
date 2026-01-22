import { Contract } from '../contract';
import { hubV2MinimalAbi } from '@aboutcircles/sdk-abis/minimal/hubV2';
import type { Address, TransactionRequest, Hex } from '@aboutcircles/sdk-types';

/**
 * Minimal HubV2 Contract for TransferBuilder
 * Contains only the methods required for building transfer transactions
 */
export class HubV2ContractMinimal extends Contract<typeof hubV2MinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: hubV2MinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  async isTrusted(truster: Address, trustee: Address): Promise<boolean> {
    return this.read('isTrusted', [truster, trustee]) as Promise<boolean>;
  }

  async isApprovedForAll(owner: Address, operator: Address): Promise<boolean> {
    return this.read('isApprovedForAll', [owner, operator]) as Promise<boolean>;
  }

  async toTokenId(avatar: Address): Promise<bigint> {
    return this.read('toTokenId', [avatar]) as Promise<bigint>;
  }

  trust(trustReceiver: Address, expiry: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('trust', [trustReceiver, expiry]),
      value: 0n,
    };
  }

  setApprovalForAll(operator: Address, approved: boolean): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('setApprovalForAll', [operator, approved]),
      value: 0n,
    };
  }

  wrap(avatar: Address, amount: bigint, circlesType: number): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('wrap', [avatar, amount, circlesType]),
      value: 0n,
    };
  }

  safeTransferFrom(
    from: Address,
    to: Address,
    id: bigint,
    amount: bigint,
    data: Hex = '0x'
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('safeTransferFrom', [from, to, id, amount, data]),
      value: 0n,
    };
  }

  operateFlowMatrix(
    flowVertices: readonly Address[],
    flowEdges: readonly { streamSinkId: number; amount: bigint }[],
    streams: readonly { sourceCoordinate: number; flowEdgeIds: readonly number[]; data: Uint8Array | Hex }[],
    packedCoordinates: Hex
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('operateFlowMatrix', [flowVertices, flowEdges, streams, packedCoordinates]),
      value: 0n,
    };
  }

  async isHuman(human: Address): Promise<boolean> {
    return this.read('isHuman', [human]) as Promise<boolean>;
  }
}
