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
  results: TrustRelationInfo[];
}

export interface InviterInfo {
  address: Address;
  balance: string;
  avatarInfo?: AvatarInfo;
}

export interface ValidInvitersResponse {
  address: Address;
  results: InviterInfo[];
}

export interface ParticipantInfo {
  avatarInfo?: AvatarInfo;
  profile?: Profile | null;
}

export interface ProfileSearchResponse {
  query: string;
  searchType: 'address' | 'text';
  results: Profile[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface EnrichedTransaction {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  event: Record<string, unknown>;
  participants: Record<string, ParticipantInfo>;
}

/**
 * Invitation origin — how an address was invited to Circles
 */
export type InvitationType = 'v1_signup' | 'v2_standard' | 'v2_escrow' | 'v2_at_scale';

export interface InvitationOriginResponse {
  address: Address;
  invitationType: InvitationType;
  inviter?: Address | null;
  proxyInviter?: Address | null;
  escrowAmount?: string | null;
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
  version: number;
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
}
