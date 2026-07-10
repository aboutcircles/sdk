/**
 * Minimal ABI for the OffchainScoreBasedMintPolicy getters needed to locate the
 * SMT root: the shared registry and a group's merkle-tree manager. (The policy
 * stores roots in the MerkleTreeRegistry, keyed by the group's manager — not on
 * the policy itself.)
 */
export const offchainScoreMintPolicyMinimalAbi = [
  {
    type: 'function',
    name: 'MERKLE_TREE_REGISTRY',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'merkleTreeManagers',
    inputs: [{ name: 'group', type: 'address' }],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
] as const;
