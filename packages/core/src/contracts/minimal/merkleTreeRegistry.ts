import { Contract } from '../contract.js';
import { merkleTreeRegistryMinimalAbi } from '@aboutcircles/sdk-abis/minimal';
import type { Address, Hex } from '@aboutcircles/sdk-types';

/**
 * Minimal MerkleTreeRegistry contract — reads the SMT roots a group's mint
 * policy verifies proofs against.
 */
export class MerkleTreeRegistryContractMinimal extends Contract<typeof merkleTreeRegistryMinimalAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: merkleTreeRegistryMinimalAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Roots for a given merkle-tree manager. `previousRoot` stays valid during a
   * short grace window (~2 blocks) after a `currentRoot` change.
   */
  async merkleRoots(
    merkleTreeManager: Address
  ): Promise<{ currentRoot: Hex; previousRoot: Hex; updateBlockNumber: bigint }> {
    const [currentRoot, previousRoot, updateBlockNumber] = (await this.read(
      'merkleRoots',
      [merkleTreeManager]
    )) as [Hex, Hex, bigint];
    return { currentRoot, previousRoot, updateBlockNumber };
  }

  /**
   * Verify a Merkle proof on-chain against the manager's current root (or the
   * previous root while it's still within the grace window). One view call that
   * subsumes root resolution, freshness, and proof validity.
   *
   * @param merkleTreeManager - The group's merkle-tree manager (registry key)
   * @param key - The leaf key — the avatar address (treated as uint160)
   * @param leaf - The leaf hash (the backend proof's `value`)
   * @param proof - The opaque proof bytes (the backend proof's `proof`)
   */
  async verifyWithGracePeriod(
    merkleTreeManager: Address,
    key: Address,
    leaf: Hex,
    proof: Hex
  ): Promise<boolean> {
    return this.read('verifyWithGracePeriod', [
      merkleTreeManager,
      BigInt(key),
      leaf,
      proof,
    ]) as Promise<boolean>;
  }
}
