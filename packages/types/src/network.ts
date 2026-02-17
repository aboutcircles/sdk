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
 * Network snapshot from circles_getNetworkSnapshot (proxied to pathfinder).
 * PascalCase matches the RPC response format.
 */
export interface NetworkSnapshot {
  BlockNumber: number;
  Addresses: string[];
}
