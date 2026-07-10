import { Contract } from '../contract.js';
import { scoreGroupMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Minimal ScoreGroup contract — only the permissionless `trust(address)` used
 * to make the group trust a collateral avatar before `Hub.groupMint`.
 */
export class ScoreGroupContractMinimal extends Contract<typeof scoreGroupMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: scoreGroupMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /** Build a `trust(avatar)` tx — permissionless; makes the group trust the avatar. */
  trust(avatar: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('trust', [avatar]),
      value: 0n,
    };
  }

  /** The group's merkle-tree manager (the registry key for its SMT root). */
  async merkleTreeManager(): Promise<Address> {
    return this.read('MERKLE_TREE_MANAGER') as Promise<Address>;
  }
}
