import type { TrustRelation } from './trust.js';
import type { TokenBalance } from './token.js';

/**
 * Network and event types
 */

/**
 * Event types
 */
export type EventType =
  | 'CrcV1_Trust'
  | 'CrcV1_HubTransfer'
  | 'CrcV1_Signup'
  | 'CrcV1_OrganizationSignup'
  | 'CrcV2_RegisterHuman'
  | 'CrcV2_RegisterOrganization'
  | 'CrcV2_RegisterGroup'
  | 'CrcV2_Trust'
  | 'CrcV2_TransferSingle'
  | 'CrcV2_TransferBatch';

/**
 * Network snapshot structure
 */
export interface NetworkSnapshot {
  trustRelations: TrustRelation[];
  balances: TokenBalance[];
  blockNumber: number;
  timestamp: number;
}
