import { CirclesError } from '@aboutcircles/sdk-utils/errors';
import type { Address } from '@aboutcircles/sdk-types';

/**
 * Transfers package error source
 */
export type TransfersErrorSource = 'TRANSFERS' | 'PATHFINDING' | 'FLOW_MATRIX' | 'VALIDATION';

/**
 * Base error for transfers package
 */
export class TransferError extends CirclesError<TransfersErrorSource> {
  constructor(
    message: string,
    options?: {
      code?: string | number;
      source?: TransfersErrorSource;
      cause?: unknown;
      context?: Record<string, any>;
    }
  ) {
    super('TransferError', message, { ...options, source: options?.source || 'TRANSFERS' });
  }

  /**
   * Error when no valid transfer path is found
   */
  static noPathFound(from: Address, to: Address, reason?: string): TransferError {
    return new TransferError(
      `No valid transfer path found from ${from} to ${to}. ${reason || 'This could mean there\'s no trust connection, insufficient balance, or the tokens are not transferable.'}`,
      {
        code: 'TRANSFER_NO_PATH',
        source: 'PATHFINDING',
        context: { from, to, reason },
      }
    );
  }

  /**
   * Error when balance is insufficient for the requested transfer
   */
  static insufficientBalance(requested: bigint, available: bigint, from: Address, to: Address): TransferError {
    const requestedCrc = Number(requested) / 1e18;
    const availableCrc = Number(available) / 1e18;

    return new TransferError(
      `Insufficient balance for transfer. Requested: ${requestedCrc.toFixed(6)} CRC, Available: ${availableCrc.toFixed(6)} CRC.`,
      {
        code: 'TRANSFER_INSUFFICIENT_BALANCE',
        source: 'VALIDATION',
        context: {
          from,
          to,
          requested: requested.toString(),
          available: available.toString(),
          requestedCrc,
          availableCrc,
        },
      }
    );
  }

  /**
   * Error when wrapped tokens are needed but not enabled
   */
  static wrappedTokensRequired(): TransferError {
    return new TransferError(
      'Insufficient unwrapped token balance for transfer. Your balance contains wrapped tokens (ERC20 wrappers), but useWrappedBalances option is not enabled. Please enable it by passing { useWrappedBalances: true } in the transfer options.',
      {
        code: 'TRANSFER_WRAPPED_TOKENS_REQUIRED',
        source: 'VALIDATION',
      }
    );
  }

  /**
   * Error when flow matrix contains unregistered avatars
   */
  static unregisteredAvatars(addresses: Address[]): TransferError {
    return new TransferError(
      `Flow matrix contains ${addresses.length} unregistered avatar(s): ${addresses.join(', ')}. All addresses in the flow must be registered Circles avatars (human or group).`,
      {
        code: 'TRANSFER_UNREGISTERED_AVATARS',
        source: 'FLOW_MATRIX',
        context: {
          unregisteredAddresses: addresses,
          count: addresses.length,
        },
      }
    );
  }

  /**
   * Error when flow matrix terminal sum doesn't match expected amount
   */
  static flowMatrixMismatch(terminalSum: bigint, expected: bigint): TransferError {
    return new TransferError(
      `Flow matrix terminal sum (${terminalSum}) does not equal expected amount (${expected})`,
      {
        code: 'TRANSFER_FLOW_MATRIX_MISMATCH',
        source: 'FLOW_MATRIX',
        context: {
          terminalSum: terminalSum.toString(),
          expected: expected.toString(),
        },
      }
    );
  }

  /**
   * Error when transfer path is empty
   */
  static emptyPath(from: Address, to: Address): TransferError {
    return new TransferError(
      `Transfer path is empty for route from ${from} to ${to}`,
      {
        code: 'TRANSFER_EMPTY_PATH',
        source: 'PATHFINDING',
        context: { from, to },
      }
    );
  }
}
