import { Contract } from '../contract.js';
import { offchainScoreMintPolicyMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address } from '@aboutcircles/sdk-types';

/**
 * Minimal OffchainScoreBasedMintPolicy contract — the getters needed to locate
 * a group's SMT root. The policy keeps roots in a shared MerkleTreeRegistry,
 * keyed by the group's merkle-tree manager.
 */
export class OffchainScoreMintPolicyContractMinimal extends Contract<typeof offchainScoreMintPolicyMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: offchainScoreMintPolicyMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /** The shared MerkleTreeRegistry the policy reads roots from. */
  async merkleTreeRegistry(): Promise<Address> {
    return this.read('MERKLE_TREE_REGISTRY') as Promise<Address>;
  }

  /** The merkle-tree manager registered for `group` (registry root key). */
  async merkleTreeManager(group: Address): Promise<Address> {
    return this.read('merkleTreeManagers', [group]) as Promise<Address>;
  }
}
