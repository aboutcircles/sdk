import { CirclesError } from '@aboutcircles/sdk-utils';
import type { Address } from '@aboutcircles/sdk-types';

/**
 * Permissionless-groups package error source.
 */
export type PermissionlessGroupErrorSource =
  | 'PERMISSIONLESS_GROUPS'
  | 'BACKEND'
  | 'PROOF'
  | 'POLICY'
  | 'ONCHAIN'
  | 'VALIDATION';

/**
 * Errors raised by the permissionless-groups package.
 *
 * Follows the SDK-wide convention: extends `CirclesError<TSource>` with
 * `{ code, source, cause, context }` options and exposes static factory
 * methods that bake in the appropriate code + source per failure mode.
 */
export class PermissionlessGroupError extends CirclesError<PermissionlessGroupErrorSource> {
  constructor(
    message: string,
    options?: {
      code?: string | number;
      source?: PermissionlessGroupErrorSource;
      cause?: unknown;
      context?: Record<string, any>;
    }
  ) {
    super('PermissionlessGroupError', message, {
      ...options,
      source: options?.source ?? 'PERMISSIONLESS_GROUPS',
    });
  }

  /** User isn't in the score tree (or has score 0) — mint would revert. */
  static notEligible(user: Address, scoreRaw: string): PermissionlessGroupError {
    return new PermissionlessGroupError(
      `User ${user} has score ${scoreRaw}; not eligible to mint from this group.`,
      {
        code: 'SCORE_GROUPS_NOT_ELIGIBLE',
        source: 'PROOF',
        context: { user, scoreRaw },
      }
    );
  }

  /** Backend doesn't know the group — wrong group address or unregistered. */
  static groupNotConfigured(group: Address): PermissionlessGroupError {
    return new PermissionlessGroupError(
      `Group ${group} is not registered with the score-groups backend.`,
      {
        code: 'SCORE_GROUPS_GROUP_NOT_CONFIGURED',
        source: 'BACKEND',
        context: { group },
      }
    );
  }

  /** Backend returned an unexpected non-2xx response. */
  static backendUnavailable(httpStatus: number, body: string): PermissionlessGroupError {
    return new PermissionlessGroupError(
      `score-groups backend returned HTTP ${httpStatus}.`,
      {
        code: 'SCORE_GROUPS_BACKEND_UNAVAILABLE',
        source: 'BACKEND',
        context: { httpStatus, body },
      }
    );
  }

  /**
   * Proof's root disagrees with on-chain `policy.merkleRoots(group)`, or the
   * publisher hasn't broadcast the proof's root yet. Refetching usually
   * resolves it once the cadence window elapses.
   */
  static proofStale(reason: string, context?: Record<string, any>): PermissionlessGroupError {
    return new PermissionlessGroupError(`Proof staleness: ${reason}`, {
      code: 'SCORE_GROUPS_PROOF_STALE',
      source: 'PROOF',
      context,
    });
  }

  /** On-chain mint tx reverted (policy rejected proof, snapshot missing, etc). */
  static mintReverted(reason: string, context?: Record<string, any>): PermissionlessGroupError {
    return new PermissionlessGroupError(`Hub.groupMint reverted: ${reason}`, {
      code: 'SCORE_GROUPS_MINT_REVERTED',
      source: 'ONCHAIN',
      context,
    });
  }

  /** Caller passed bad/missing parameters to `mint()`. */
  static invalidInput(message: string, context?: Record<string, any>): PermissionlessGroupError {
    return new PermissionlessGroupError(message, {
      code: 'SCORE_GROUPS_INVALID_INPUT',
      source: 'VALIDATION',
      context,
    });
  }
}
