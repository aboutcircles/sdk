/**
 * Minimal ABI for InvitationModule contract - only functions used for inviter trust setup
 */
export const invitationModuleMinimalAbi = [
  {
    type: 'function',
    name: 'trustInviter',
    inputs: [{ name: 'inviter', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;
