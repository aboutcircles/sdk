/**
 * ScoreGatedMintPolicy ABI (permissionless-groups).
 *
 * The policy stores SMT roots **keyed by group avatar** (multi-group ready)
 * and is invoked by the Hub during `groupMint` via
 * `beforeMintPolicy(minter, group, collateralAvatars, amounts, data)`
 * where `data == abi.encode(uint256 score, bytes proof)`.
 *
 * Before calling `Hub.groupMint`, the minter must call `snapshotIssuance()`
 * on the policy so it can compute the per-user issuance cap for this round.
 *
 * `updateMerkleRoot` is an admin-only write — the publisher service uses it.
 */
export const scoreGatedMintPolicyAbi = [
  {
    type: 'function',
    name: 'merkleRoots',
    stateMutability: 'view',
    inputs: [{ name: 'group', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'snapshotIssuance',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'updateMerkleRoot',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'group', type: 'address' },
      { name: 'root', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const;
