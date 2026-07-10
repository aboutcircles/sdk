import type { Address } from './base.js';

/**
 * Avatar and profile types
 */

/**
 * Avatar information
 * Contains basic information about a Circles avatar.
 */
export interface AvatarInfo {
  /**
   * The block number of the event
   */
  blockNumber: number;
  /**
   * The timestamp of the last change to the avatar
   * Note: May be undefined for some avatars
   */
  timestamp?: number;
  /**
   * The transaction index
   */
  transactionIndex: number;
  /**
   * The log index
   */
  logIndex: number;
  /**
   * The hash of the transaction that last changed the avatar
   */
  transactionHash: string;
  /**
   * If the avatar is currently active in version 1 or 2
   * Note: An avatar that's active in v2 can still have a v1 token. See `hasV1` and `v1Token`.
   */
  version: number;
  /**
   * The type of the avatar
   */
  type:
    | 'CrcV2_RegisterHuman'
    | 'CrcV2_RegisterGroup'
    | 'CrcV2_RegisterOrganization'
    | 'CrcV1_Signup'
    | 'CrcV1_OrganizationSignup';
  /**
   * The address of the avatar
   */
  avatar: Address;
  /**
   * The personal or group token address (v1) or tokenId (v2)
   * Note: v1 tokens are erc20 and have a token address. v2 tokens are erc1155 and have a tokenId.
   *       The v2 tokenId is always an encoded version of the avatar address.
   */
  tokenId?: string;
  /**
   * If the avatar is signed up at v1
   */
  hasV1: boolean;
  /**
   * If the avatar has a v1 token, this is the token address
   */
  v1Token?: Address;
  /**
   * The bytes of the avatar's metadata cidv0
   */
  cidV0Digest?: string;
  /**
   * The CIDv0 of the avatar's metadata (profile)
   */
  cidV0?: string;
  /**
   * If the avatar is stopped in v1
   * Note: This is only set during Avatar initialization.
   */
  v1Stopped?: boolean;
  /**
   * Indicates whether the entity is a human
   */
  isHuman: boolean;
  /**
   * Groups have a name
   */
  name?: string;
  /**
   * Groups have a symbol
   */
  symbol?: string;
}

/**
 * Profile information
 */
export interface Profile {
  name: string;
  description?: string;
  previewImageUrl?: string;
  imageUrl?: string;
  location?: string;
  geoLocation?: [number, number];
  extensions?: Record<string, any>;
}

/**
 * Group profile with additional symbol field
 */
export interface GroupProfile extends Profile {
  symbol: string;
}
