/**
 * ABI for the MultiAffiliateGroupRegistry contract (GA 2.0 "communities").
 *
 * Lets each human avatar maintain its own list of affiliate groups it has signalled
 * on-chain intent to join. Storage is a per-avatar singly-linked list keyed by avatar
 * address (prepend-ordered, circular through the `0x01` sentinel). The registry stores
 * **intent only** — it does not enforce the membership-fee cap or any group criteria.
 *
 * - `addAffiliateGroup(group)` — caller must be a Hub human and `group` a Hub group.
 *   Idempotent: re-adding a group already in the list is a no-op (no event, no revert).
 * - `removeAffiliateGroup(group)` — reverts `AffiliateGroupNotExist` when absent.
 * - `AffiliateGroupAdded` / `AffiliateGroupRemoved` carry both params **non-indexed**.
 * - `initialize` / `lockInitialization` are deployer-only one-time seeding helpers.
 */
export const multiAffiliateGroupRegistryAbi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hub',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IHub' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deployer',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isInitialized',
    inputs: [],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'affiliateGroupList',
    inputs: [
      { name: '', type: 'address', internalType: 'address' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      { name: 'avatars', type: 'address[]', internalType: 'address[]' },
      { name: 'affiliateGroup', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'lockInitialization',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addAffiliateGroup',
    inputs: [{ name: 'affiliateGroupToAdd', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeAffiliateGroup',
    inputs: [{ name: 'affiliateGroupToRemove', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AffiliateGroupAdded',
    inputs: [
      { name: 'affiliateGroup', type: 'address', indexed: false, internalType: 'address' },
      { name: 'avatar', type: 'address', indexed: false, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AffiliateGroupRemoved',
    inputs: [
      { name: 'affiliateGroup', type: 'address', indexed: false, internalType: 'address' },
      { name: 'avatar', type: 'address', indexed: false, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AffiliateGroupNotExist',
    inputs: [{ name: 'affiliateGroup', type: 'address', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'OnlyHuman',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SenderNotDeployer',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ArrayLengthMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyInitialized',
    inputs: [],
  },
] as const;
