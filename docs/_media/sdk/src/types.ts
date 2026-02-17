import type {
  Address,
  AvatarInfo,
  TokenBalance,
  AggregatedTrustRelation,
  AllInvitationsResponse
} from '@aboutcircles/sdk-types';


/**
 * Circles data access layer
 * Provides read access to Circles protocol data
 */
export interface CirclesData {
  getAvatar(address: Address): Promise<AvatarInfo | undefined>;
  getTrustRelations(address: Address): Promise<AggregatedTrustRelation[]>;
  getBalances(address: Address): Promise<TokenBalance[]>;
  /**
   * Get all invitations from all sources (trust, escrow, at-scale)
   * @param address Address to check for invitations
   * @param minimumBalance Optional minimum balance for trust-based invitations
   * @returns All invitations from all sources
   */
  getAllInvitations(address: Address, minimumBalance?: string): Promise<AllInvitationsResponse>;
}

