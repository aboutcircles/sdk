// Main SDK class
export { Sdk } from './Sdk.js';

// Avatar classes
export { HumanAvatar, OrganisationAvatar, BaseGroupAvatar } from './avatars/index.js';
export type { PathfindingOptions } from './avatars/index.js';
export type { TransactionReceipt } from 'viem';

// Avatar union type for convenience
import type { HumanAvatar, BaseGroupAvatar, OrganisationAvatar } from './avatars/index.js';
export type Avatar = HumanAvatar | BaseGroupAvatar | OrganisationAvatar;

// Error handling
export { SdkError } from './errors.js';
export type { SdkErrorSource } from './errors.js';

// Re-export types from other packages for convenience
export type {
  AggregatedTrustRelation,
  TrustRelationType,
  CirclesEvent,
  CirclesEventType,
  Observable,
  TransactionHistoryRow,
  SearchResultProfile,
  GroupTokenHolderRow,
} from '@aboutcircles/sdk-rpc';
export type { AvatarRow, TokenBalanceRow, TrustRelationRow, CirclesQuery, GroupType, ContractRunner } from '@aboutcircles/sdk-types';

// SDK-specific types
export type { CirclesData } from './types.js';
