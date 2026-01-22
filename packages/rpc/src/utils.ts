import type { Address, FindPathParams, SimulatedBalance, SimulatedTrust } from '@aboutcircles/sdk-types';
import { checksumAddress as toChecksumAddress } from '@aboutcircles/sdk-utils/abi';

/**
 * Normalize an address to lowercase (required by the indexer)
 */
export function normalizeAddress(address: Address): Address {
  return address.toLowerCase() as Address;
}

/**
 * Normalize an array of addresses to lowercase
 */
export function normalizeAddresses(addresses: Address[]): Address[] {
  return addresses.map(addr => normalizeAddress(addr));
}

/**
 * Convert an address to EIP-55 checksummed format
 */
export function checksumAddress(address: Address): Address {
  return toChecksumAddress(address) as Address;
}

/**
 * Detect if a value is an Ethereum address (40 hex chars, optionally prefixed with 0x)
 */
function isAddress(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const cleaned = value.replace('0x', '');
  return cleaned.length === 40 && /^[0-9a-fA-F]{40}$/.test(cleaned);
}

/**
 * Recursively checksum all address strings in an object, array, or primitive value
 */
export function checksumAddresses<T>(value: T): T {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle address strings
  if (isAddress(value)) {
    return checksumAddress(value as Address) as T;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => checksumAddresses(item)) as T;
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = checksumAddresses((value as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }

  // Return primitives as-is
  return value;
}

/**
 * Normalize and convert FindPathParams for RPC call
 * Converts camelCase to PascalCase and bigint to human-readable numbers
 */
export function normalizeFindPathParams(params: FindPathParams): Record<string, unknown> {
  return {
    Source: normalizeAddress(params.from),
    Sink: normalizeAddress(params.to),
    TargetFlow: params.targetFlow.toString(),
    WithWrap: params.useWrappedBalances,
    FromTokens: params.fromTokens?.map(normalizeAddress),
    ToTokens: params.toTokens?.map(normalizeAddress),
    ExcludedFromTokens: params.excludeFromTokens?.map(normalizeAddress),
    ExcludedToTokens: params.excludeToTokens?.map(normalizeAddress),
    SimulatedBalances: params.simulatedBalances?.map((balance: SimulatedBalance) => ({
      Holder: normalizeAddress(balance.holder),
      Token: normalizeAddress(balance.token),
      Amount: balance.amount.toString(),
      IsWrapped: balance.isWrapped,
      IsStatic: balance.isStatic,
    })),
    SimulatedTrusts: params.simulatedTrusts?.map((trust: SimulatedTrust) => ({
      Truster: normalizeAddress(trust.truster),
      Trustee: normalizeAddress(trust.trustee),
    })),
    MaxTransfers: params.maxTransfers,
  };
}

/**
 * Convert string numeric values to bigint in an object
 */
export function parseStringsToBigInt<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    const value = obj[key];

    if (value === null || value === undefined) {
      result[key] = value;
    } else if (typeof value === 'string' && /^\d+$/.test(value)) {
      // Convert numeric strings to bigint
      result[key] = BigInt(value);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects
      result[key] = parseStringsToBigInt(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      // Process arrays
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null
          ? parseStringsToBigInt(item as Record<string, unknown>)
          : item
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
