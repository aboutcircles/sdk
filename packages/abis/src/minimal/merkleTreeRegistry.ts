/**
 * Minimal ABI for the MerkleTreeRegistry root getter. `merkleRoots(manager)`
 * returns the current root, the previous root (valid during the grace window),
 * and the block the root was last updated.
 */
export const merkleTreeRegistryMinimalAbi = [
  {
    type: 'function',
    name: 'merkleRoots',
    inputs: [{ name: 'merkleTreeManager', type: 'address' }],
    outputs: [
      { name: 'currentRoot', type: 'bytes32' },
      { name: 'previousRoot', type: 'bytes32' },
      { name: 'updateBlockNumber', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    // Verifies a proof against the current root, OR the previous root while it's
    // still within the grace window (~2 blocks after a root change). One view
    // call that subsumes root resolution + freshness + proof validity.
    type: 'function',
    name: 'verifyWithGracePeriod',
    inputs: [
      { name: 'merkleTreeManager', type: 'address' },
      { name: 'key', type: 'uint160' },
      { name: 'leaf', type: 'bytes32' },
      { name: 'proof', type: 'bytes' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
] as const;
