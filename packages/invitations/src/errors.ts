import { CirclesError } from '@aboutcircles/sdk-utils';
import type { Address } from '@aboutcircles/sdk-types';

/**
 * Invitation package error source
 */
export type InvitationErrorSource = 'INVITATIONS' | 'PATHFINDING' | 'VALIDATION';

/**
 * Base error for invitations package
 */
export class InvitationError extends CirclesError<InvitationErrorSource> {
  constructor(
    message: string,
    options?: {
      code?: string | number;
      source?: InvitationErrorSource;
      cause?: unknown;
      context?: Record<string, any>;
    }
  ) {
    super('InvitationError', message, { ...options, source: options?.source || 'INVITATIONS' });
  }

  /**
   * Error when no valid invitation path is found
   */
  static noPathFound(from: Address, to: Address, reason?: string): InvitationError {
    return new InvitationError(
      `No valid invitation path found from ${from} to ${to}. ${reason || 'The inviter may not have enough balance of the proxy inviter\'s token or there\'s no trust connection.'}`,
      {
        code: 'INVITATION_NO_PATH',
        source: 'PATHFINDING',
        context: { from, to, reason },
      }
    );
  }

  /**
   * Error when no proxy inviters are available
   */
  static noProxyInviters(inviter: Address): InvitationError {
    return new InvitationError(
      `No proxy inviters found for ${inviter}. The inviter must have mutual trust connections with users who are also trusted by the invitation module, and these users must have sufficient balance.`,
      {
        code: 'INVITATION_NO_PROXY_INVITERS',
        source: 'VALIDATION',
        context: { inviter },
      }
    );
  }

  /**
   * Error when balance is insufficient for the requested invitations
   */
  static insufficientBalance(
    requestedInvites: number,
    availableInvites: number,
    requested: bigint,
    available: bigint,
    from: Address,
    to: Address
  ): InvitationError {
    const requestedCrc = Number(requested) / 1e18;
    const availableCrc = Number(available) / 1e18;

    return new InvitationError(
      `Insufficient balance for ${requestedInvites} invitation(s). Can only afford ${availableInvites} invitation(s). Requested: ${requestedCrc.toFixed(6)} CRC, Available: ${availableCrc.toFixed(6)} CRC.`,
      {
        code: 'INVITATION_INSUFFICIENT_BALANCE',
        source: 'VALIDATION',
        context: {
          from,
          to,
          requestedInvites,
          availableInvites,
          requested: requested.toString(),
          available: available.toString(),
          requestedCrc,
          availableCrc,
        },
      }
    );
  }

  /**
   * Error when invitee is already registered in Circles Hub
   */
  static inviteeAlreadyRegistered(inviter: Address, invitee: Address): InvitationError {
    return new InvitationError(
      `Invitee ${invitee} is already registered as a human in Circles Hub. Cannot invite an already registered user.`,
      {
        code: 'INVITATION_INVITEE_ALREADY_REGISTERED',
        source: 'VALIDATION',
        context: { inviter, invitee },
      }
    );
  }

  /**
   * Error when no addresses are provided for invitation
   */
  static noAddressesProvided(): InvitationError {
    return new InvitationError(
      'At least one address must be provided for invitation.',
      {
        code: 'INVITATION_NO_ADDRESSES_PROVIDED',
        source: 'VALIDATION',
      }
    );
  }
}
