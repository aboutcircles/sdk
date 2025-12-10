import type { Address } from './base';
import type { AvatarInfo, Profile } from './avatar';

/**
 * Generic cursor-based paged response (mirrors Circles RPC PagedResponse)
 */
export interface PagedResponse<TResult> {
  results: TResult[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface TrustStats {
  trustsCount: number;
  trustedByCount: number;
}

export interface ProfileView {
  address: Address;
  avatarInfo?: AvatarInfo;
  profile?: Profile;
  trustStats: TrustStats;
  v1Balance?: string;
  v2Balance?: string;
}

export interface TrustNetworkSummary {
  address: Address;
  directTrustsCount: number;
  directTrustedByCount: number;
  mutualTrustsCount: number;
  mutualTrusts: Address[];
  networkReach: number;
}

export interface TrustRelationInfo {
  address: Address;
  avatarInfo?: AvatarInfo;
  relationType: 'mutual' | 'trusts' | 'trustedBy';
}

export interface AggregatedTrustRelationsResponse {
  address: Address;
  mutual: TrustRelationInfo[];
  trusts: TrustRelationInfo[];
  trustedBy: TrustRelationInfo[];
}

export interface InviterInfo {
  address: Address;
  balance: string;
  avatarInfo?: AvatarInfo;
}

export interface ValidInvitersResponse {
  address: Address;
  validInviters: InviterInfo[];
}

export interface ParticipantInfo {
  avatarInfo?: AvatarInfo;
  profile?: Profile | null;
}

export interface EnrichedTransactionEvent {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  event: Record<string, unknown>;
}

export interface EnrichedTransaction {
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  event: Record<string, unknown>;
  participants: Record<Address, ParticipantInfo>;
}

export interface ProfileSearchResponse {
  query: string;
  searchType: 'address' | 'text';
  results: Profile[];
  totalCount: number;
}

export interface EnrichedTransaction {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  version: number;
  from: Address;
  to: Address;
  operator?: Address;
  id?: string;
  value: string;
  circles: string;
  attoCircles: string;
  crc: string;
  attoCrc: string;
  staticCircles: string;
  staticAttoCircles: string;
  fromProfile?: Profile;
  toProfile?: Profile;
}
