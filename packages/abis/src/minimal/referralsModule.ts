/**
 * Minimal ABI for ReferralsModule contract - only functions used by InvitationBuilder
 * Full ABI is ~500 lines, this is ~50 lines
 */
export const referralsModuleMinimalAbi = [
  {
    type: 'function',
    name: 'createAccount',
    inputs: [{ name: 'signer', type: 'address' }],
    outputs: [{ name: 'account', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createAccounts',
    inputs: [{ name: 'signers', type: 'address[]' }],
    outputs: [{ name: '_accounts', type: 'address[]' }],
    stateMutability: 'nonpayable',
  },
] as const;
