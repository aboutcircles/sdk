/**
 * Minimal ABI for HubV2 contract - only functions used by TransferBuilder
 * Full ABI is ~700 lines, this is ~80 lines
 */
export const hubV2MinimalAbi = [
  {
    type: 'function',
    name: 'operateFlowMatrix',
    inputs: [
      { name: '_flowVertices', type: 'address[]' },
      {
        name: '_flow',
        type: 'tuple[]',
        components: [
          { name: 'streamSinkId', type: 'uint16' },
          { name: 'amount', type: 'uint192' },
        ],
      },
      {
        name: '_streams',
        type: 'tuple[]',
        components: [
          { name: 'sourceCoordinate', type: 'uint16' },
          { name: 'flowEdgeIds', type: 'uint16[]' },
          { name: 'data', type: 'bytes' },
        ],
      },
      { name: '_packedCoordinates', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    inputs: [
      { name: '_account', type: 'address' },
      { name: '_operator', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    inputs: [
      { name: '_operator', type: 'address' },
      { name: '_approved', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'wrap',
    inputs: [
      { name: '_avatar', type: 'address' },
      { name: '_amount', type: 'uint256' },
      { name: '_type', type: 'uint8' },
    ],
    outputs: [{ type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'trust',
    inputs: [
      { name: '_trustReceiver', type: 'address' },
      { name: '_expiry', type: 'uint96' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isTrusted',
    inputs: [
      { name: '_truster', type: 'address' },
      { name: '_trustee', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'toTokenId',
    inputs: [{ name: '_avatar', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_id', type: 'uint256' },
      { name: '_value', type: 'uint256' },
      { name: '_data', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isHuman',
    inputs: [{ name: '_human', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
] as const;
