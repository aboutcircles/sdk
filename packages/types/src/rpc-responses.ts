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

/**
 * Invitation source types - indicates how the invitation was created
 */
export type InvitationSource = 'trust' | 'escrow' | 'atScale';

/**
 * Base invitation info with source tracking
 */
export interface InvitationInfo {
  /** The inviter's address */
  address: Address;
  /** How the invitation was created */
  source: InvitationSource;
  /** Avatar info for the inviter (if available) */
  avatarInfo?: AvatarInfo;
}

/**
 * Trust-based invitation - someone trusts you and has sufficient balance
 */
export interface TrustInvitation extends InvitationInfo {
  source: 'trust';
  /** Inviter's current CRC balance */
  balance: string;
}

/**
 * Escrow-based invitation - CRC tokens escrowed for you
 */
export interface EscrowInvitation extends InvitationInfo {
  source: 'escrow';
  /** Amount escrowed (in atto-circles) */
  escrowedAmount: string;
  /** Number of days the escrow has been active */
  escrowDays: number;
  /** Block number when escrow was created */
  blockNumber: number;
  /** Timestamp when escrow was created */
  timestamp: number;
}

/**
 * At-scale invitation - pre-created account via referral system
 */
export interface AtScaleInvitation extends InvitationInfo {
  source: 'atScale';
  /** The original inviter who funded the invitation */
  originInviter?: Address;
  /** Block number when account was created */
  blockNumber: number;
  /** Timestamp when account was created */
  timestamp: number;
}

/**
 * Union type for all invitation types
 */
export type Invitation = TrustInvitation | EscrowInvitation | AtScaleInvitation;

/**
 * Response containing all available invitations from all sources
 */
export interface AllInvitationsResponse {
  address: Address;
  /** Trust-based invitations (people who trust you with sufficient balance) */
  trustInvitations: TrustInvitation[];
  /** Escrow-based invitations (CRC escrowed for you) */
  escrowInvitations: EscrowInvitation[];
  /** At-scale invitations (pre-created accounts) */
  atScaleInvitations: AtScaleInvitation[];
  /** All invitations combined and sorted */
  all: Invitation[];
}
