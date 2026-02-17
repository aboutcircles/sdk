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
} from './base.js';

// JSON-RPC types
export type { JsonRpcRequest, JsonRpcResponse, CirclesQueryResponse, PaginatedQueryResponse, QueryResponse } from './rpc.js';
export type {
  PagedResponse,
  ProfileView,
  TrustStats,
  TrustNetworkSummary,
  AggregatedTrustRelationsResponse,
  TrustRelationInfo,
  ValidInvitersResponse,
  InviterInfo,
  ParticipantInfo,
  EnrichedTransaction,
  ProfileSearchResponse,
  InvitationSource,
  InvitationInfo,
  TrustInvitation,
  EscrowInvitation,
  AtScaleInvitation,
  Invitation,
  AllInvitationsResponse
} from './rpc-responses.js';
export type { TransactionHistoryRow } from './rows.js';

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
  TableColumnInfo,
  TableDefinition,
  TableInfo,
  EventRow,
  Cursor,
  PagedResult,
  PagedQueryParams,
} from './query.js';

// Avatar and profile types
export type { AvatarInfo, Profile, GroupProfile } from './avatar.js';

// Token types
export type { TokenBalance, TokenInfo, TokenHolder, TokenHolderRow } from './token.js';

// Trust relation types
export type { TrustRelation, TrustRelationType, AggregatedTrustRelation } from './trust.js';

// Group types
export type { GroupRow, GroupMembershipRow, GroupQueryParams } from './group.js';

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
} from './pathfinding.js';

// Network types
export type { EventType, NetworkSnapshot } from './network.js';

// Configuration types
export type { CirclesConfig } from './config.js';

// Wrapper types
export { CirclesType } from './wrapper.js';
export type { WrappedTokenInfo, WrappedTokensRecord } from './wrapper.js';

// SDK types
export { GroupType } from './sdk.js';
export type { AvatarType, AvatarRow, TokenBalanceRow, TrustRelationRow, CirclesQuery } from './sdk.js';

// Event types
export type { CirclesBaseEvent, CirclesEventType, CirclesEvent, CirclesEventOfType, RpcSubscriptionEvent } from './events.js';


// Runner types
export type { BatchRun, ContractRunner } from './runner.js';

// Contract types
export type { EscrowedAmountAndDays } from './contracts.js';

// Error types
export type { DecodedContractError } from './errors.js';

// Transfer data annotation types
export type { TransferDataType, DecodedTransferData, DecodedAbiPayload, DecodedMetadataPayload } from './transferData.js';
