/**
 * Minimal ABI for the GnosisPayInviteQuotaGrantee contract — only the functions
 * used to check eligibility for and claim free invites granted to Gnosis Pay users.
 */
export const gnosisPayInviteQuotaGranteeMinimalAbi = [
  {
    type: 'function',
    name: 'claimableFreeInvites',
    inputs: [{ name: 'inviter', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimFreeInvite',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;
