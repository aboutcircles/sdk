/**
 * Minimal ABI for InvitationFarm contract - only functions used by InviteFarm
 */
export const invitationFarmMinimalAbi = [
  {
    type: 'function',
    name: 'claimInvites',
    inputs: [{ name: 'numberOfInvites', type: 'uint256' }],
    outputs: [{ name: 'ids', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'inviterQuota',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'INVITATION_FEE',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'invitationModule',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
] as const;
