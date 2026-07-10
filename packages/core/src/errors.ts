/**
 * Core Package Error Types
 */

import { CirclesError } from '@aboutcircles/sdk-utils/errors';

/**
 * Core-specific error sources
 */
export type CoreErrorSource =
  | 'CORE'
  | 'CONTRACT'
  | 'TRANSACTION'
  | 'GAS_ESTIMATION'
  | 'NETWORK';

/**
 * Contract and transaction errors
 */
export class ContractError extends CirclesError<CoreErrorSource> {
  constructor(
    message: string,
    options?: {
      code?: string | number;
      source?: CoreErrorSource;
      cause?: unknown;
      context?: Record<string, any>;
    }
  ) {
    super('ContractError', message, { ...options, source: options?.source ?? 'CONTRACT' });
  }

  /**
   * Create error for transaction failures
   */
  static transactionFailed(txHash: string, reason: string, cause?: unknown): ContractError {
    return new ContractError(`Transaction failed: ${reason}`, {
      code: 'CONTRACT_TX_FAILED',
      source: 'TRANSACTION',
      cause,
      context: { txHash, reason },
    });
  }

  /**
   * Create error for contract reverts
   */
  static revert(method: string, reason?: string, cause?: unknown): ContractError {
    return new ContractError(
      reason ? `Contract execution reverted: ${reason}` : 'Contract execution reverted',
      {
        code: 'CONTRACT_REVERT',
        source: 'CONTRACT',
        cause,
        context: { method, reason },
      }
    );
  }

  /**
   * Create error for insufficient gas
   */
  static insufficientGas(estimated: bigint, provided?: bigint): ContractError {
    return new ContractError('Insufficient gas for transaction', {
      code: 'CONTRACT_INSUFFICIENT_GAS',
      source: 'GAS_ESTIMATION',
      context: { estimated: estimated.toString(), provided: provided?.toString() },
    });
  }

  /**
   * Create error for gas estimation failures
   */
  static gasEstimationFailed(method: string, cause?: unknown): ContractError {
    return new ContractError('Failed to estimate gas', {
      code: 'CONTRACT_GAS_ESTIMATION_FAILED',
      source: 'GAS_ESTIMATION',
      cause,
      context: { method },
    });
  }

  /**
   * Create error for encoding failures
   */
  static encodingError(method: string, cause?: unknown): ContractError {
    return new ContractError('Failed to encode contract call', {
      code: 'CONTRACT_ENCODING_FAILED',
      source: 'CONTRACT',
      cause,
      context: { method },
    });
  }

  /**
   * Create error for contract not found
   */
  static notFound(address: string, contractType: string): ContractError {
    return new ContractError(`Contract not found at address: ${address}`, {
      code: 'CONTRACT_NOT_FOUND',
      source: 'CONTRACT',
      context: { address, contractType },
    });
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends CirclesError<CoreErrorSource> {
  constructor(
    message: string,
    options?: {
      code?: string | number;
      cause?: unknown;
      context?: Record<string, any>;
    }
  ) {
    super('NetworkError', message, { ...options, source: 'NETWORK' });
  }

  /**
   * Create error for wrong network
   */
  static wrongNetwork(expectedChainId: number, actualChainId: number): NetworkError {
    return new NetworkError(
      `Wrong network: expected chain ID ${expectedChainId}, got ${actualChainId}`,
      {
        code: 'NETWORK_WRONG_CHAIN',
        context: { expectedChainId, actualChainId },
      }
    );
  }

  /**
   * Create error for network connection issues
   */
  static connectionFailed(reason: string, cause?: unknown): NetworkError {
    return new NetworkError(`Network connection failed: ${reason}`, {
      code: 'NETWORK_CONNECTION_FAILED',
      cause,
      context: { reason },
    });
  }

  /**
   * Create error for unsupported network
   */
  static unsupportedNetwork(chainId: number): NetworkError {
    return new NetworkError(`Unsupported network: chain ID ${chainId}`, {
      code: 'NETWORK_UNSUPPORTED',
      context: { chainId },
    });
  }
}
