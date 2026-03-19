import { describe, test, expect } from 'bun:test';
import { encodeFunctionData, decodeFunctionResult } from '../abi.js';
import {
  encodeFunctionData as viemEncodeFunctionData,
  decodeFunctionResult as viemDecodeFunctionResult
} from 'viem/utils';

describe('encodeFunctionData', () => {
  test('encodes function with no inputs', () => {
    const abi = [
      {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'name',
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'name',
    });

    expect(custom).toBe(viem);
    expect(custom).toBe('0x06fdde03');
  });

  test('encodes function with single address input', () => {
    const abi = [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: 'account' }],
        outputs: [{ type: 'uint256', name: '' }],
      },
    ] as const;

    const address = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    const custom = encodeFunctionData({
      abi,
      functionName: 'balanceOf',
      args: [address],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'balanceOf',
      args: [address],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with uint256 input', () => {
    const abi = [
      {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { type: 'address', name: 'to' },
          { type: 'uint256', name: 'amount' },
        ],
        outputs: [{ type: 'bool', name: '' }],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'transfer',
      args: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1000n],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'transfer',
      args: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1000n],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with bool input', () => {
    const abi = [
      {
        name: 'setApprovalForAll',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { type: 'address', name: 'operator' },
          { type: 'bool', name: 'approved' },
        ],
        outputs: [],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'setApprovalForAll',
      args: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', true],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'setApprovalForAll',
      args: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', true],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with bytes32 input', () => {
    const abi = [
      {
        name: 'setData',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ type: 'bytes32', name: 'data' }],
        outputs: [],
      },
    ] as const;

    const bytes32Value = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    const custom = encodeFunctionData({
      abi,
      functionName: 'setData',
      args: [bytes32Value],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'setData',
      args: [bytes32Value],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with multiple uint types', () => {
    const abi = [
      {
        name: 'multiUint',
        type: 'function',
        stateMutability: 'pure',
        inputs: [
          { type: 'uint8', name: 'a' },
          { type: 'uint16', name: 'b' },
          { type: 'uint256', name: 'c' },
        ],
        outputs: [],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'multiUint',
      args: [255, 65535, 123456789n],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'multiUint',
      args: [255, 65535, 123456789n],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with string input', () => {
    const abi = [
      {
        name: 'setName',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ type: 'string', name: 'newName' }],
        outputs: [],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'setName',
      args: ['Hello World'],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'setName',
      args: ['Hello World'],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with fixed array input', () => {
    const abi = [
      {
        name: 'setValues',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ type: 'uint256[3]', name: 'values' }],
        outputs: [],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'setValues',
      args: [[1n, 2n, 3n]],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'setValues',
      args: [[1n, 2n, 3n]],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with dynamic array input', () => {
    const abi = [
      {
        name: 'setDynamicValues',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ type: 'uint256[]', name: 'values' }],
        outputs: [],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'setDynamicValues',
      args: [[1n, 2n, 3n, 4n, 5n]],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'setDynamicValues',
      args: [[1n, 2n, 3n, 4n, 5n]],
    });

    expect(custom).toBe(viem);
  });

  test('encodes function with mixed static and dynamic inputs', () => {
    const abi = [
      {
        name: 'complexFunction',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { type: 'address', name: 'addr' },
          { type: 'uint256', name: 'amount' },
          { type: 'string', name: 'message' },
        ],
        outputs: [],
      },
    ] as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'complexFunction',
      args: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1000n, 'test'],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'complexFunction',
      args: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1000n, 'test'],
    });

    expect(custom).toBe(viem);
  });

  test('encodes operateFlowMatrix function with complex nested tuples', () => {
    const abi = [
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
    ] as const;

    const flowVertices = [
      '0x1786712d8cbf16cb6bb1bcee04b499f0ab8a8b83',
      '0xa63abf03d5c6ef8d56e1432277573c47cbe8a8a6',
      '0xafeeb1c2ff5ee3757f106743142d2cd719116c72',
      '0xc7d3df890952a327af94d5ba6fdc1bf145188a1b',
      '0xcbdf2a2b2c7417ce9f10943d44d590058418ac00',
      '0xd910d745a5b3da2e487864f39c777ef1362780a8',
      '0xdcc6f30bc1b06b7523c364beffbf879475d140b6',
      '0xf48554937f18885c7f15c432c596b5843648231d',
    ] as const;

    const flow = [
      { streamSinkId: 0, amount: 47518455000000000000n },
      { streamSinkId: 1, amount: 47518455000000000000n },
      { streamSinkId: 0, amount: 82656000000000000n },
      { streamSinkId: 0, amount: 82656000000000000n },
      { streamSinkId: 1, amount: 82656000000000000n },
    ] as const;

    const streams = [
      {
        sourceCoordinate: 0,
        flowEdgeIds: [1, 4] as const,
        data: '0x' as const,
      },
    ] as const;

    const packedCoordinates = '0x000000000007000500070003000200000001000600010004000400040003' as const;

    const custom = encodeFunctionData({
      abi,
      functionName: 'operateFlowMatrix',
      args: [flowVertices, flow, streams, packedCoordinates],
    });

    const viem = viemEncodeFunctionData({
      abi,
      functionName: 'operateFlowMatrix',
      args: [flowVertices, flow, streams, packedCoordinates],
    });

    expect(custom).toBe(viem);
  });
});

describe('decodeFunctionResult', () => {
  test('decodes uint256 result', () => {
    const abi = [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: 'account' }],
        outputs: [{ type: 'uint256', name: 'balance' }],
      },
    ] as const;

    const data = '0x00000000000000000000000000000000000000000000000000000000000003e8';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'balanceOf',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'balanceOf',
      data,
    });

    expect(custom).toBe(viem);
    expect(custom).toBe(1000n);
  });

  test('decodes address result', () => {
    const abi = [
      {
        name: 'owner',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'address', name: '' }],
      },
    ] as const;

    const data = '0x0000000000000000000000005aaeb6053f3e94c9b9a09f33669435e7ef1beaed';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'owner',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'owner',
      data,
    });

    expect(custom).toBe(viem);
    expect(custom).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
  });

  test('decodes bool result', () => {
    const abi = [
      {
        name: 'isApproved',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'bool', name: '' }],
      },
    ] as const;

    const data = '0x0000000000000000000000000000000000000000000000000000000000000001';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'isApproved',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'isApproved',
      data,
    });

    expect(custom).toBe(viem);
    expect(custom).toBe(true);
  });

  test('decodes string result', () => {
    const abi = [
      {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
    ] as const;

    const data = '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'name',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'name',
      data,
    });

    expect(custom).toBe(viem);
    expect(custom).toBe('Hello World');
  });

  test('decodes bytes32 result', () => {
    const abi = [
      {
        name: 'getData',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'bytes32', name: '' }],
      },
    ] as const;

    const data = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'getData',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'getData',
      data,
    });

    expect(custom).toBe(viem);
  });

  test('decodes multiple outputs (tuple)', () => {
    const abi = [
      {
        name: 'getInfo',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          { type: 'address', name: 'addr' },
          { type: 'uint256', name: 'amount' },
          { type: 'bool', name: 'active' },
        ],
      },
    ] as const;

    const data = '0x0000000000000000000000005aaeb6053f3e94c9b9a09f33669435e7ef1beaed00000000000000000000000000000000000000000000000000000000000003e80000000000000000000000000000000000000000000000000000000000000001';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'getInfo',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'getInfo',
      data,
    });

    expect(custom).toEqual(viem);
    expect(custom).toEqual([
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      1000n,
      true,
    ]);
  });

  test('decodes dynamic array result', () => {
    const abi = [
      {
        name: 'getValues',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256[]', name: '' }],
      },
    ] as const;

    const data = '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000c8';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'getValues',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'getValues',
      data,
    });

    expect(custom).toEqual(viem);
    expect(custom).toEqual([10n, 20n, 200n]);
  });

  test('decodes fixed array result', () => {
    const abi = [
      {
        name: 'getFixedValues',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256[3]', name: '' }],
      },
    ] as const;

    const data = '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003';

    const custom = decodeFunctionResult({
      abi,
      functionName: 'getFixedValues',
      data,
    });

    const viem = viemDecodeFunctionResult({
      abi,
      functionName: 'getFixedValues',
      data,
    });

    expect(custom).toEqual(viem);
    expect(custom).toEqual([1n, 2n, 3n]);
  });
});
