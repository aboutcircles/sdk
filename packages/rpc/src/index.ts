// Main RPC class
export { CirclesRpc } from './rpc.js';

// Client
export { RpcClient } from './client.js';

// Method classes
export {
  PathfinderMethods,
  QueryMethods,
  TrustMethods,
  BalanceMethods,
  AvatarMethods,
  ProfileMethods,
  TokenMethods,
  InvitationMethods,
  TransactionMethods,
  GroupMethods,
} from './methods/index.js';

// RPC-specific types
export type {
  TransactionHistoryRow,
  SearchResultProfile,
  GroupTokenHolderRow,
  CursorColumn,
  FlexiblePagedResult,
} from './types.js';

// Re-export shared types from @aboutcircles/sdk-types for convenience
export type { TrustRelationType, AggregatedTrustRelation } from '@aboutcircles/sdk-types';

// Error handling
export { RpcError } from './errors.js';
export type { RpcErrorSource } from './errors.js';

// Utils
export { normalizeAddress, normalizeAddresses, parseStringsToBigInt } from './utils.js';

// Pagination
export { PagedQuery } from './pagedQuery.js';

// Events (subscription and observation)
export {
  Observable,
  parseRpcEvent,
  parseRpcSubscriptionMessage,
  isCirclesEvent,
} from './events/index.js';

export type {
  CirclesEvent,
  CirclesEventType,
  CirclesBaseEvent,
  CirclesEventOfType,
  RpcSubscriptionEvent,
} from './events/index.js';
