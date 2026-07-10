import type { CirclesEvent, RpcSubscriptionEvent } from './types.js';

/**
 * Helper to convert hex string to bigint
 */
const hexToBigInt = (hex: string): bigint => BigInt(hex);

/**
 * Helper to convert hex string to number
 */
const hexToNumber = (hex: string): number => parseInt(hex, 16);

/**
 * Helper to convert hex string to Uint8Array
 */
const hexToUint8Array = (hex: string): Uint8Array => {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return array;
};

/**
 * Smart value parser - tries to infer the best type for a hex value
 */
function parseValue(key: string, value: string): any {
  // Check if it's a hex string
  if (typeof value === 'string' && value.startsWith('0x')) {
    const hex = value.slice(2);

    // If it's 40 chars (20 bytes), it's likely an address
    if (hex.length === 40) {
      return value; // Return as address string
    }

    // If it's 64 chars (32 bytes), could be bytes32 or uint256
    if (hex.length === 64) {
      // Names like 'metadataDigest', 'cidV0Digest', 'data' are likely bytes
      if (key.toLowerCase().includes('digest') ||
          key.toLowerCase().includes('data') ||
          key.toLowerCase().includes('bytes')) {
        return hexToUint8Array(value);
      }
      // Otherwise treat as uint256
      try {
        return hexToBigInt(value);
      } catch {
        return value;
      }
    }

    // For other hex values, try to parse as number/bigint
    try {
      const num = hexToNumber(value);
      // If it's small enough, return as number
      if (num < Number.MAX_SAFE_INTEGER) {
        return num;
      }
      // Otherwise return as bigint
      return hexToBigInt(value);
    } catch {
      return value;
    }
  }

  // Boolean values
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Return as-is for other values
  return value;
}

/**
 * Parse a single RPC subscription event into a CirclesEvent
 */
export function parseRpcEvent(rpcEvent: RpcSubscriptionEvent): CirclesEvent {
  const { event, values } = rpcEvent;

  // Parse the base event fields
  const circlesEvent: CirclesEvent = {
    $event: event as any, // Will be typed as CirclesEventType
    blockNumber: values.blockNumber ? hexToNumber(values.blockNumber) : 0,
    timestamp: values.timestamp ? hexToNumber(values.timestamp) : undefined,
    transactionIndex: values.transactionIndex ? hexToNumber(values.transactionIndex) : 0,
    logIndex: values.logIndex ? hexToNumber(values.logIndex) : 0,
    transactionHash: values.transactionHash,
  };

  // Parse all other fields dynamically
  for (const [key, value] of Object.entries(values)) {
    // Skip base fields we already processed
    if (['blockNumber', 'timestamp', 'transactionIndex', 'logIndex', 'transactionHash'].includes(key)) {
      continue;
    }

    circlesEvent[key] = parseValue(key, value);
  }

  return circlesEvent;
}

/**
 * Parse an array of RPC subscription events
 */
export function parseRpcSubscriptionMessage(message: RpcSubscriptionEvent[]): CirclesEvent[] {
  return message.map(parseRpcEvent);
}
