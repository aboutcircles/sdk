import { keccak_256 } from '@noble/hashes/sha3.js';
import type { Abi, AbiFunction } from 'abitype';
import type { Hex } from '@aboutcircles/sdk-types';
import { bytesToHex } from './bytes';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type AbiType =
  | 'address' | 'bool' | 'string' | 'bytes'
  | 'uint' | 'int'
  | `uint${number}` | `int${number}` | `bytes${number}`
  | 'tuple' | `tuple[${number}]` | 'tuple[]'
  | `${string}[]` | `${string}[${number}]`;

type AbiComponent = {
  type: AbiType;
  name?: string;
  components?: readonly AbiComponent[];
};

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const HEX_CHARS = 64; // 32 bytes = 64 hex characters
const BYTES_PER_WORD = 32;

/** Remove 0x prefix efficiently */
const strip0x = (hex: string): string => hex.startsWith('0x') ? hex.slice(2) : hex;

/** Pad hex string to 64 characters (32 bytes) */
const pad64 = (hex: string): string => hex.padStart(HEX_CHARS, '0');

/** Convert number to padded hex */
const toHex64 = (num: number | bigint): string => num.toString(16).padStart(HEX_CHARS, '0');

// ============================================================================
// ADDRESS CHECKSUMMING (EIP-55)
// ============================================================================

/**
 * Convert an Ethereum address to EIP-55 checksummed format
 * @param address - The address to checksum (with or without 0x prefix)
 * @returns The checksummed address with 0x prefix
 */
export function checksumAddress(address: string): string {
  const addr = address.toLowerCase().replace('0x', '');
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(addr))).slice(2);

  let result = '0x';
  for (let i = 0; i < addr.length; i++) {
    result += parseInt(hash[i], 16) >= 8 ? addr[i].toUpperCase() : addr[i];
  }
  return result;
}

// ============================================================================
// FUNCTION SIGNATURE & SELECTOR
// ============================================================================

function getTypeString(type: AbiType, components?: readonly AbiComponent[]): string {
  if (type === 'tuple' && components) {
    const types = components.map(c => getTypeString(c.type, c.components));
    return `(${types.join(',')})`;
  }
  
  // Handle tuple arrays: tuple[] or tuple[N]
  const tupleArrayMatch = type.match(/^tuple(\[\d*\])$/);
  if (tupleArrayMatch && components) {
    const baseType = getTypeString('tuple', components);
    return `${baseType}${tupleArrayMatch[1]}`;
  }
  
  return type;
}

function getFunctionSignature(abiFunction: AbiFunction): string {
  const inputs = abiFunction.inputs || [];
  const types = inputs.map(input => 
    getTypeString(input.type as AbiType, (input as any).components)
  );
  return `${abiFunction.name}(${types.join(',')})`;
}

function getFunctionSelector(abiFunction: AbiFunction): string {
  const signature = getFunctionSignature(abiFunction);
  const hash = keccak_256(new TextEncoder().encode(signature));
  return bytesToHex(hash.slice(0, 4));
}

// ============================================================================
// DYNAMIC TYPE DETECTION
// ============================================================================

function isDynamicType(type: AbiType, components?: readonly AbiComponent[]): boolean {
  // String and bytes are always dynamic
  if (type === 'string' || type === 'bytes') return true;
  
  // Dynamic arrays (including fixed arrays of dynamic elements)
  if (type.includes('[')) {
    const baseType = type.slice(0, type.indexOf('[')) as AbiType;
    
    // Dynamic length array is always dynamic
    if (type.endsWith('[]')) return true;
    
    // Fixed array is dynamic if its elements are dynamic
    if (baseType === 'tuple') {
      return isTupleDynamic(components);
    }
    return isDynamicType(baseType);
  }
  
  // Tuple is dynamic if any component is dynamic
  if (type === 'tuple') {
    return isTupleDynamic(components);
  }
  
  return false;
}

function isTupleDynamic(components?: readonly AbiComponent[]): boolean {
  return components?.some(c => isDynamicType(c.type, c.components)) ?? false;
}

// ============================================================================
// ENCODING
// ============================================================================

function encodeParam(type: AbiType, value: unknown, components?: readonly AbiComponent[]): string {
  // Handle tuples
  if (type === 'tuple' && components) {
    return encodeTuple(components, value as Record<string, unknown> | unknown[]);
  }

  // Handle arrays
  if (type.includes('[')) {
    return encodeArray(type, value as unknown[], components);
  }

  // Handle primitives
  return encodePrimitive(type, value);
}

function encodeArray(type: AbiType, arr: unknown[], components?: readonly AbiComponent[]): string {
  const baseType = type.slice(0, type.indexOf('[')) as AbiType;
  const isDynamic = type.endsWith('[]');
  const elementsAreDynamic = isDynamicType(baseType, components);

  let encoded: string;

  if (elementsAreDynamic) {
    // Encode with offsets for dynamic elements
    const encodings = arr.map(v => encodeParam(baseType, v, components));
    let offset = arr.length * BYTES_PER_WORD;
    
    const offsets = encodings.map(enc => {
      const currentOffset = offset;
      offset += enc.length / 2;
      return toHex64(currentOffset);
    });

    encoded = offsets.join('') + encodings.join('');
  } else {
    // Encode inline for static elements
    encoded = arr.map(v => encodeParam(baseType, v, components)).join('');
  }

  // Prepend length for dynamic arrays
  return isDynamic ? toHex64(arr.length) + encoded : encoded;
}

function encodeTuple(
  components: readonly AbiComponent[], 
  value: Record<string, unknown> | unknown[]
): string {
  const isArray = Array.isArray(value);
  const encodings: string[] = [];
  const dynamicData: string[] = [];
  const isDynamic: boolean[] = [];

  // First pass: encode all components
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    const val = isArray ? value[i] : value[component.name || ''];
    const dynamic = isDynamicType(component.type, component.components);
    
    isDynamic.push(dynamic);
    
    if (dynamic) {
      encodings.push(''); // Placeholder for offset
      dynamicData.push(encodeParam(component.type, val, component.components));
    } else {
      encodings.push(encodeParam(component.type, val, component.components));
    }
  }

  // Second pass: calculate offsets and build result
  if (dynamicData.length > 0) {
    let offset = encodings.reduce((sum, enc, i) => 
      sum + (isDynamic[i] ? BYTES_PER_WORD : enc.length / 2), 0
    );

    let result = '';
    let dynamicIndex = 0;

    for (let i = 0; i < components.length; i++) {
      if (isDynamic[i]) {
        result += toHex64(offset);
        offset += dynamicData[dynamicIndex].length / 2;
        dynamicIndex++;
      } else {
        result += encodings[i];
      }
    }

    return result + dynamicData.join('');
  }

  return encodings.join('');
}

function encodePrimitive(type: AbiType, value: unknown): string {
  // Address
  if (type === 'address') {
    return strip0x(value as string).toLowerCase().padStart(HEX_CHARS, '0');
  }

  // Boolean
  if (type === 'bool') {
    return toHex64(value ? 1 : 0);
  }

  // Unsigned integers
  if (type.startsWith('uint')) {
    const num = typeof value === 'bigint' ? value : BigInt(value as string | number);
    return toHex64(num);
  }

  // Signed integers
  if (type.startsWith('int')) {
    let num = typeof value === 'bigint' ? value : BigInt(value as string | number);
    if (num < 0n) {
      const bits = type === 'int' ? 256 : parseInt(type.slice(3));
      num = (1n << BigInt(bits)) + num; // Two's complement
    }
    return toHex64(num);
  }

  // Fixed-length bytes (bytes1-bytes32)
  if (type.startsWith('bytes') && type !== 'bytes') {
    return strip0x(value as string).padEnd(HEX_CHARS, '0');
  }

  // Dynamic bytes
  if (type === 'bytes') {
    const bytes = strip0x(value as string);
    const length = toHex64(bytes.length / 2);
    const padded = bytes.padEnd(Math.ceil(bytes.length / HEX_CHARS) * HEX_CHARS, '0');
    return length + padded;
  }

  // String
  if (type === 'string') {
    const bytes = Array.from(new TextEncoder().encode(value as string))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const length = toHex64(bytes.length / 2);
    const padded = bytes.padEnd(Math.ceil(bytes.length / HEX_CHARS) * HEX_CHARS, '0');
    return length + padded;
  }

  throw new Error(`Unsupported type: ${type}`);
}

// ============================================================================
// DECODING
// ============================================================================

type DecodeResult = { value: unknown; consumed: number };

function decodeParam(type: AbiType, data: string, offset = 0, components?: readonly AbiComponent[]): DecodeResult {
  // Handle tuples
  if (type === 'tuple' && components) {
    return decodeTuple(components, data, offset);
  }

  // Handle arrays
  if (type.includes('[')) {
    return decodeArray(type, data, offset, components);
  }

  // Handle primitives
  return decodePrimitive(type, data, offset);
}

function decodeArray(type: AbiType, data: string, offset: number, components?: readonly AbiComponent[]): DecodeResult {
  const baseType = type.slice(0, type.indexOf('[')) as AbiType;
  const chunk = data.slice(offset, offset + HEX_CHARS);

  // Dynamic array
  if (type.endsWith('[]')) {
    const dataOffset = parseInt(chunk, 16) * 2;
    const length = parseInt(data.slice(dataOffset, dataOffset + HEX_CHARS), 16);
    
    const values: unknown[] = [];
    let currentOffset = dataOffset + HEX_CHARS;

    for (let i = 0; i < length; i++) {
      const result = decodeParam(baseType, data, currentOffset, components);
      values.push(result.value);
      currentOffset += result.consumed;
    }

    return { value: values, consumed: HEX_CHARS };
  }

  // Fixed array
  const match = type.match(/\[(\d+)\]$/);
  if (match) {
    const length = parseInt(match[1]);
    const values: unknown[] = [];
    let consumed = 0;

    for (let i = 0; i < length; i++) {
      const result = decodeParam(baseType, data, offset + consumed, components);
      values.push(result.value);
      consumed += result.consumed;
    }

    return { value: values, consumed };
  }

  throw new Error(`Invalid array type: ${type}`);
}

function decodeTuple(components: readonly AbiComponent[], data: string, offset: number): DecodeResult {
  const values: unknown[] = [];
  let currentOffset = offset;

  for (const component of components) {
    const result = decodeParam(component.type, data, currentOffset, component.components);
    values.push(result.value);
    currentOffset += result.consumed;
  }

  return { value: values, consumed: currentOffset - offset };
}

function decodePrimitive(type: AbiType, data: string, offset: number): DecodeResult {
  const chunk = data.slice(offset, offset + HEX_CHARS);

  // Address
  if (type === 'address') {
    return {
      value: checksumAddress('0x' + chunk.slice(24)),
      consumed: HEX_CHARS
    };
  }

  // Boolean
  if (type === 'bool') {
    return {
      value: parseInt(chunk, 16) !== 0,
      consumed: HEX_CHARS
    };
  }

  // Unsigned integers
  if (type.startsWith('uint')) {
    return {
      value: BigInt('0x' + chunk),
      consumed: HEX_CHARS
    };
  }

  // Signed integers
  if (type.startsWith('int')) {
    const value = BigInt('0x' + chunk);
    const bits = type === 'int' ? 256 : parseInt(type.slice(3));
    const signBit = 1n << BigInt(bits - 1);
    
    return {
      value: value >= signBit ? value - (1n << BigInt(bits)) : value,
      consumed: HEX_CHARS
    };
  }

  // Fixed-length bytes
  if (type.startsWith('bytes') && type !== 'bytes') {
    const size = parseInt(type.match(/^bytes(\d+)$/)![1]);
    return {
      value: '0x' + chunk.slice(0, size * 2),
      consumed: HEX_CHARS
    };
  }

  // Dynamic bytes
  if (type === 'bytes') {
    const dataOffset = parseInt(chunk, 16) * 2;
    const length = parseInt(data.slice(dataOffset, dataOffset + HEX_CHARS), 16) * 2;
    return {
      value: '0x' + data.slice(dataOffset + HEX_CHARS, dataOffset + HEX_CHARS + length),
      consumed: HEX_CHARS
    };
  }

  // String
  if (type === 'string') {
    const dataOffset = parseInt(chunk, 16) * 2;
    const length = parseInt(data.slice(dataOffset, dataOffset + HEX_CHARS), 16) * 2;
    const bytes = data.slice(dataOffset + HEX_CHARS, dataOffset + HEX_CHARS + length);
    const byteArray = new Uint8Array(bytes.match(/.{2}/g)?.map(b => parseInt(b, 16)) || []);
    
    return {
      value: new TextDecoder().decode(byteArray),
      consumed: HEX_CHARS
    };
  }

  throw new Error(`Unsupported type: ${type}`);
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function encodeFunctionData(config: {
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}): Hex {
  const { abi, functionName, args = [] } = config;

  const abiFunction = abi.find(
    item => item.type === 'function' && item.name === functionName
  ) as AbiFunction | undefined;

  if (!abiFunction) {
    throw new Error(`Function "${functionName}" not found in ABI`);
  }

  const selector = getFunctionSelector(abiFunction);
  const inputs = abiFunction.inputs || [];

  if (inputs.length === 0) return selector as Hex;

  if (args.length !== inputs.length) {
    throw new Error(`Expected ${inputs.length} arguments, got ${args.length}`);
  }

  // Encode parameters
  const encodings: string[] = [];
  const dynamicData: string[] = [];
  const isDynamic: boolean[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const components = (input as any).components;
    const dynamic = isDynamicType(input.type as AbiType, components);
    
    isDynamic.push(dynamic);
    
    if (dynamic) {
      encodings.push('');
      dynamicData.push(encodeParam(input.type as AbiType, args[i], components));
    } else {
      encodings.push(encodeParam(input.type as AbiType, args[i], components));
    }
  }

  // Calculate offsets and build result
  if (dynamicData.length === 0) {
    return (selector + encodings.join('')) as Hex;
  }

  let offset = encodings.reduce((sum, enc, i) => 
    sum + (isDynamic[i] ? BYTES_PER_WORD : enc.length / 2), 0
  );

  let result = '';
  let dynamicIndex = 0;

  for (let i = 0; i < inputs.length; i++) {
    if (isDynamic[i]) {
      result += toHex64(offset);
      offset += dynamicData[dynamicIndex].length / 2;
      dynamicIndex++;
    } else {
      result += encodings[i];
    }
  }

  return (selector + result + dynamicData.join('')) as Hex;
}

export function decodeFunctionResult(config: {
  abi: Abi;
  functionName: string;
  data: string;
}): unknown {
  const { abi, functionName, data } = config;

  const abiFunction = abi.find(
    item => item.type === 'function' && item.name === functionName
  ) as AbiFunction | undefined;

  if (!abiFunction) {
    throw new Error(`Function "${functionName}" not found in ABI`);
  }

  const outputs = abiFunction.outputs || [];
  if (outputs.length === 0) return undefined;

  const cleanData = strip0x(data);

  // Single output
  if (outputs.length === 1) {
    return decodeParam(
      outputs[0].type as AbiType, 
      cleanData, 
      0, 
      (outputs[0] as any).components
    ).value;
  }

  // Multiple outputs
  const results: unknown[] = [];
  let offset = 0;

  for (const output of outputs) {
    const result = decodeParam(
      output.type as AbiType, 
      cleanData, 
      offset, 
      (output as any).components
    );
    results.push(result.value);
    offset += result.consumed;
  }

  return results;
}

// ============================================================================
// ERROR DECODING
// ============================================================================

/**
 * Get error selector (first 4 bytes) from error ABI item
 */
function getErrorSelector(errorItem: any): string {
  const inputs = errorItem.inputs || [];
  const types = inputs.map((input: any) =>
    getTypeString(input.type as AbiType, input.components)
  );
  const signature = `${errorItem.name}(${types.join(',')})`;
  const hash = keccak_256(new TextEncoder().encode(signature));
  return bytesToHex(hash.slice(0, 4));
}

/**
 * Decode error data from a contract revert
 * @param config - Configuration with ABI and error data
 * @returns Decoded error with name and arguments
 */
export function decodeErrorResult(config: {
  abi: Abi;
  data: string;
}): { errorName: string; args?: any[] } | null {
  const { abi, data } = config;

  if (!data || data.length < 10) {
    return null; // Not enough data for a selector
  }

  // Extract the error selector (first 4 bytes)
  const selector = data.slice(0, 10).toLowerCase();
  const cleanData = strip0x(data.slice(10));

  // Find matching error in ABI
  const errors = abi.filter(item => item.type === 'error');

  for (const errorItem of errors) {
    const errorSelector = getErrorSelector(errorItem);

    if (errorSelector.toLowerCase() === selector) {
      const inputs = (errorItem as any).inputs || [];

      if (inputs.length === 0) {
        return { errorName: errorItem.name };
      }

      // Decode error parameters
      const decodedArgs: any[] = [];
      let offset = 0;

      for (const input of inputs) {
        const result = decodeParam(
          input.type as AbiType,
          cleanData,
          offset,
          input.components
        );
        decodedArgs.push(result.value);
        offset += result.consumed;
      }

      return {
        errorName: errorItem.name,
        args: decodedArgs
      };
    }
  }

  return null; // No matching error found
}

// ============================================================================
// SIMPLE ABI PARAMETER ENCODING (LIMITED USE CASE)
// ============================================================================

/**
 * IMPORTANT: This is a lightweight encoding utility for SIMPLE cases only.
 * It supports basic types: address, bytes, uint*, int*, bool, string
 *
 * For complex use cases with tuples, nested arrays, or advanced types,
 * use viem's encodeAbiParameters instead.
 *
 * This function is provided to avoid bundling the entire viem library
 * for simple encoding scenarios like encoding (address, bytes) tuples.
 *
 * @param types - Array of parameter types (e.g., ['address', 'bytes'])
 * @param values - Array of values to encode
 * @returns Hex-encoded parameters with 0x prefix
 *
 * @example
 * ```typescript
 * // Encode (address, bytes) tuple
 * const encoded = encodeAbiParameters(
 *   ['address', 'bytes'],
 *   ['0x1234...', '0xabcd...']
 * );
 * ```
 */
export function encodeAbiParameters(types: string[], values: unknown[]): Hex {
  if (types.length !== values.length) {
    throw new Error(`Type/value length mismatch: ${types.length} types, ${values.length} values`);
  }

  const encodings: string[] = [];
  const dynamicData: string[] = [];
  const isDynamic: boolean[] = [];

  // First pass: encode all parameters
  for (let i = 0; i < types.length; i++) {
    const type = types[i] as AbiType;
    const dynamic = isDynamicType(type);

    isDynamic.push(dynamic);

    if (dynamic) {
      encodings.push('');
      dynamicData.push(encodeParam(type, values[i]));
    } else {
      encodings.push(encodeParam(type, values[i]));
    }
  }

  // Second pass: calculate offsets and build result
  if (dynamicData.length === 0) {
    return ('0x' + encodings.join('')) as Hex;
  }

  let offset = encodings.reduce((sum, enc, i) =>
    sum + (isDynamic[i] ? BYTES_PER_WORD : enc.length / 2), 0
  );

  let result = '';
  let dynamicIndex = 0;

  for (let i = 0; i < types.length; i++) {
    if (isDynamic[i]) {
      result += toHex64(offset);
      offset += dynamicData[dynamicIndex].length / 2;
      dynamicIndex++;
    } else {
      result += encodings[i];
    }
  }

  return ('0x' + result + dynamicData.join('')) as Hex;
}