/**
 * Minimal ABI for the ScoreGroup's permissionless `trust(address)` — used to
 * make the group trust a collateral avatar before `Hub.groupMint`.
 */
export const scoreGroupMinimalAbi = [
  {
    type: 'function',
    name: 'trust',
    inputs: [{ name: '_trustReceiver', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    // The group's merkle-tree manager — the key used to look up its SMT root in
    // the MerkleTreeRegistry. Wired at deploy; read it straight from the group.
    type: 'function',
    name: 'MERKLE_TREE_MANAGER',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
] as const;
