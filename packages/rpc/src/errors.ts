/**
 * RPC Package Error Types
 */

import { CirclesError } from '@aboutcircles/sdk-utils/errors';

/**
 * RPC-specific error sources
 */
export type RpcErrorSource =
  | 'RPC_CONNECTION'
  | 'RPC_REQUEST'
  | 'RPC_RESPONSE'
  | 'RPC_TIMEOUT'
  | 'RPC_WEBSOCKET';

/**
 * RPC-related errors
 */
export class RpcError extends CirclesError<RpcErrorSource> {
  constructor(
    message: string,
    options?: {
      code?: string | number;
      source?: RpcErrorSource;
      cause?: unknown;
      context?: Record<string, any>;
    }
  ) {
    super('RpcError', message, { ...options, source: options?.source ?? 'RPC_REQUEST' });
  }

  /**
   * Create error for connection failures
   */
  static connectionFailed(url: string, cause?: unknown): RpcError {
    return new RpcError('Failed to connect to RPC endpoint', {
      code: 'RPC_CONNECTION_FAILED',
      source: 'RPC_CONNECTION',
      cause,
      context: { url },
    });
  }

  /**
   * Create error for timeout
   */
  static timeout(method: string, timeout: number): RpcError {
    return new RpcError('RPC request timed out', {
      code: 'RPC_TIMEOUT',
      source: 'RPC_TIMEOUT',
      context: { method, timeout },
    });
  }

  /**
   * Create error for invalid response
   */
  static invalidResponse(method: string, response: any): RpcError {
    return new RpcError('Invalid RPC response', {
      code: 'RPC_INVALID_RESPONSE',
      source: 'RPC_RESPONSE',
      context: { method, response },
    });
  }

  /**
   * Create error from JSON-RPC error response
   */
  static fromJsonRpcError(error: { code: number; message: string; data?: any }): RpcError {
    return new RpcError(error.message, {
      code: error.code,
      source: 'RPC_RESPONSE',
      context: { data: error.data },
    });
  }

  /**
   * Create error for WebSocket failures
   */
  static websocketError(message: string, cause?: unknown): RpcError {
    return new RpcError(message, {
      code: 'RPC_WEBSOCKET_ERROR',
      source: 'RPC_WEBSOCKET',
      cause,
    });
  }
}
