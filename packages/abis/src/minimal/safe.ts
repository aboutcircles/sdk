/**
 * Minimal ABI for Safe wallet - only functions used for invitation module setup
 */
export const safeMinimalAbi = [
  {
    type: 'function',
    name: 'isModuleEnabled',
    inputs: [{ name: 'module', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'enableModule',
    inputs: [{ name: 'module', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;
