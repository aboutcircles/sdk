/**
 * Minimal ABI for wrapped Circles contracts - only unwrap function
 * Used by both DemurrageCircles and InflationaryCircles
 */
export const wrappedCirclesMinimalAbi = [
  {
    type: 'function',
    name: 'unwrap',
    inputs: [{ name: '_amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;
