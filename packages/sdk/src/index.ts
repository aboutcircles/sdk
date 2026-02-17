// Main SDK class
export { Sdk } from './Sdk';

// Avatar classes
export { HumanAvatar, OrganisationAvatar, BaseGroupAvatar } from './avatars';
export type { PathfindingOptions } from './avatars';
export type { TransactionReceipt } from 'viem';

// Avatar union type for convenience
import type { HumanAvatar, BaseGroupAvatar, OrganisationAvatar } from './avatars';
export type Avatar = HumanAvatar | BaseGroupAvatar | OrganisationAvatar;

// Error handling
export { SdkError } from './errors';
export type { SdkErrorSource } from './errors';

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
export type { AvatarType, AvatarRow, TokenBalanceRow, TrustRelationRow, CirclesQuery, GroupType, ContractRunner } from '@aboutcircles/sdk-types';

// SDK-specific types
export type { CirclesData } from './types';
