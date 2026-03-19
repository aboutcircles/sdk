/**
 * Contract Error Parsing
 * Utilities for parsing and decoding contract errors from transaction failures
 */

import type { Abi } from 'abitype';
import type { DecodedContractError } from '@aboutcircles/sdk-types';
import { decodeErrorResult } from './abi.js';
import { CirclesError } from './errors.js';

/**
 * Contract error codes mapping
 * Maps error codes to human-readable messages
 */
const ERROR_CODE_MESSAGES: Record<number, string> = {
  // CirclesErrorNoArgs codes
  0x00: 'Avatar already registered',
  0x01: 'Avatar must be registered before inviting',
  0x02: 'Invalid invitation',
  0x03: 'Avatar must be registered',
  0x04: 'Only self can register',
  0x05: 'Maximum value reached',
  0x06: 'Inflationary supply already set',
  0x07: 'Group has no collateral',
  0xa1: 'Trust to zero address is not allowed', // This is the error from the example

  // CirclesInvalidParameter codes
  0x10: 'Invalid parameter',

  // @todo Add more
};

/**
 * Extract error data from various error types
 * Handles viem errors, raw errors, and other formats
 */
function extractErrorData(error: any): string | null {
  // Check for viem-style error with data in details
  if (error?.details && typeof error.details === 'string') {
    const match = error.details.match(/err:\s*(0x[0-9a-fA-F]+)/);
    if (match) {
      return match[1];
    }
  }

  // Check for raw data property
  if (error?.data && typeof error.data === 'string' && error.data.startsWith('0x')) {
    return error.data;
  }

  // Check for revert data in cause chain
  let currentError = error;
  while (currentError) {
    if (currentError.data && typeof currentError.data === 'string') {
      return currentError.data;
    }
    currentError = currentError.cause;
  }

  return null;
}

/**
 * Format error message with decoded arguments using ABI information
 */
function formatErrorMessage(errorName: string, args?: any[], errorAbi?: any): string {
  if (!args || args.length === 0) {
    return errorName;
  }

  if (!errorAbi || !errorAbi.inputs) {
    // Fallback if no ABI info
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'bigint') {
        return arg.toString();
      }
      return String(arg);
    }).join(', ');
    return `${errorName}(${formattedArgs})`;
  }

  // Find the "code" parameter if it exists
  const codeIndex = errorAbi.inputs.findIndex((input: any) =>
    input.name === 'code' || input.name === '' && input.type === 'uint8'
  );

  let baseMessage = errorName;
  let detailsParts: string[] = [];

  // If there's a code parameter, try to get human-readable message
  if (codeIndex !== -1) {
    const code = Number(args[codeIndex]);
    const humanMessage = ERROR_CODE_MESSAGES[code];
    if (humanMessage) {
      baseMessage = humanMessage;
    }
  }

  // Format all arguments with their names
  errorAbi.inputs.forEach((input: any, index: number) => {
    const arg = args[index];
    const name = input.name || `arg${index}`;

    // Skip empty-named code parameters as they're used for the base message
    if (!input.name && input.type === 'uint8') {
      return;
    }

    let formattedValue: string;
    if (typeof arg === 'bigint') {
      formattedValue = arg.toString();
    } else if (typeof arg === 'string' && arg.startsWith('0x')) {
      formattedValue = arg; // Keep addresses and hex as-is
    } else {
      formattedValue = String(arg);
    }

    // Add hex representation for numeric codes
    if (name === 'code' || input.type === 'uint8') {
      formattedValue = `0x${Number(arg).toString(16)}`;
    }

    detailsParts.push(`${name}: ${formattedValue}`);
  });

  // Combine base message with details
  if (detailsParts.length > 0) {
    return `${baseMessage} (${detailsParts.join(', ')})`;
  }

  return baseMessage;
}

/**
 * Parse contract error from a transaction error
 *
 * @param error - The error object from a failed transaction
 * @param abi - The contract ABI to use for decoding
 * @returns Decoded error information or null if cannot be parsed
 *
 * @example
 * ```typescript
 * try {
 *   await contract.someFunction();
 * } catch (error) {
 *   const decoded = parseContractError(error, hubV2Abi);
 *   if (decoded) {
 *     console.log(`Contract error: ${decoded.formattedMessage}`);
 *   }
 * }
 * ```
 */
export function parseContractError(
  error: any,
  abi: Abi
): DecodedContractError | null {
  const errorData = extractErrorData(error);

  if (!errorData) {
    return null;
  }

  const decoded = decodeErrorResult({ abi, data: errorData });

  if (!decoded) {
    return null;
  }

  // Find the error ABI definition
  const errorAbi = abi.find(
    item => item.type === 'error' && item.name === decoded.errorName
  );

  const selector = errorData.slice(0, 10);
  const formattedMessage = formatErrorMessage(decoded.errorName, decoded.args, errorAbi);

  return {
    errorName: decoded.errorName,
    args: decoded.args,
    selector,
    rawData: errorData,
    formattedMessage,
  };
}

/**
 * Contract error class for Circles SDK
 * Extends CirclesError with contract-specific error information
 */
export class ContractError extends CirclesError<'CORE'> {
  public readonly decodedError?: DecodedContractError;

  constructor(
    message: string,
    options?: {
      code?: string | number;
      cause?: unknown;
      context?: Record<string, any>;
      decodedError?: DecodedContractError;
    }
  ) {
    super('ContractError', message, { ...options, source: 'CORE' });
    this.decodedError = options?.decodedError;
  }

  /**
   * Create a ContractError from a transaction error
   */
  static fromTransactionError(
    error: any,
    abi: Abi,
    context?: Record<string, any>
  ): ContractError {
    const decoded = parseContractError(error, abi);

    if (decoded) {
      return new ContractError(
        `Transaction failed: ${decoded.formattedMessage}`,
        {
          code: decoded.selector,
          cause: error,
          context: {
            ...context,
            errorName: decoded.errorName,
            errorArgs: decoded.args,
          },
          decodedError: decoded,
        }
      );
    }

    // Fallback if we can't decode the error
    const message = error?.message || String(error);
    return new ContractError(
      `Transaction failed: ${message}`,
      {
        cause: error,
        context,
      }
    );
  }

  /**
   * Get formatted error message with details
   */
  toString(): string {
    let result = super.toString();

    if (this.decodedError) {
      result += `\nDecoded Error: ${this.decodedError.formattedMessage}`;
      if (this.decodedError.args && this.decodedError.args.length > 0) {
        result += `\nArguments: ${JSON.stringify(this.decodedError.args, (_, v) =>
          typeof v === 'bigint' ? v.toString() : v
        )}`;
      }
    }

    return result;
  }
}
