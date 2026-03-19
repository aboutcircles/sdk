/**
 * Circles SDK Types
 *
 * All types are organized by domain for better maintainability
 */

// Base EVM types
export type {
  Address,
  Hex,
  Hash,
  ContractConfig,
  TransactionRequest,
  CallResult,
} from './base';

// JSON-RPC types
export type { JsonRpcRequest, JsonRpcResponse, CirclesQueryResponse, QueryResponse } from './rpc';

// Query and filter types
export type {
  FilterType,
  ConjunctionType,
  FilterPredicate,
  Conjunction,
  Filter,
  SortOrder,
  OrderBy,
  QueryParams,
  TableInfo,
  EventRow,
  Cursor,
  PagedResult,
  PagedQueryParams,
} from './query';

// Avatar and profile types
export type { AvatarInfo, Profile, GroupProfile } from './avatar';

// Token types
export type { TokenBalance, TokenInfo, TokenHolder } from './token';

// Trust relation types
export type { TrustRelation, TrustRelationType, AggregatedTrustRelation } from './trust';

// Group types
export type { GroupRow, GroupMembershipRow, GroupQueryParams } from './group';

// Pathfinding types
export type {
  SimulatedBalance,
  SimulatedTrust,
  FindPathParams,
  TransferStep,
  PathfindingResult,
  FlowEdgeStruct,
  StreamStruct,
  FlowMatrix,
  AdvancedTransferOptions,
} from './pathfinding';

// Network types
export type { EventType, NetworkSnapshot } from './network';

// Configuration types
export type { CirclesConfig } from './config';

// Wrapper types
export { CirclesType } from './wrapper';
export type { WrappedTokenInfo, WrappedTokensRecord } from './wrapper';

// SDK types
export { GroupType } from './sdk';
export type { AvatarRow, TokenBalanceRow, TrustRelationRow, CirclesQuery } from './sdk';

// Event types
export type { CirclesBaseEvent, CirclesEventType, CirclesEvent, CirclesEventOfType, RpcSubscriptionEvent } from './events';


// Runner types
export type { BatchRun, ContractRunner } from './runner';

// Contract types
export type { EscrowedAmountAndDays } from './contracts';

// Error types
export type { DecodedContractError } from './errors';
