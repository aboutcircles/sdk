/**
 * ABI for the AffiliateGroupRegistry contract.
 *
 * Records, per human avatar, which group is set as their affiliate group.
 * `setAffiliateGroup(newGroup)` reverts when `newGroup` is not a Hub-registered
 * group (so the zero address cannot be set on-chain); the SDK works around this
 * with a sentinel group to represent "no affiliate group".
 */
export const affiliateGroupRegistryAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_hub', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'affiliateGroup',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hub',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setAffiliateGroup',
    inputs: [{ name: 'newGroup', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AffiliateGroupChanged',
    inputs: [
      { name: 'human', type: 'address', indexed: false, internalType: 'address' },
      { name: 'oldGroup', type: 'address', indexed: false, internalType: 'address' },
      { name: 'newGroup', type: 'address', indexed: false, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'CMGAffiliateGroupMustBeHumanAndGroupToRegisterAffiliateGroup',
    inputs: [
      { name: 'human', type: 'address', internalType: 'address' },
      { name: 'group', type: 'address', internalType: 'address' },
    ],
  },
] as const;
