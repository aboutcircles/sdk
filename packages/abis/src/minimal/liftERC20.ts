/**
 * Minimal ABI for LiftERC20 contract - only functions used by TransferBuilder
 */
export const liftERC20MinimalAbi = [
  {
    type: 'function',
    name: 'erc20Circles',
    inputs: [
      { name: '_circlesType', type: 'uint8' },
      { name: '_avatar', type: 'address' },
    ],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
] as const;
