import type { Address } from './base';

/**
 * Configuration types
 */

/**
 * Circles protocol configuration for a specific chain
 */
export interface CirclesConfig {
  /** RPC URL for Circles-specific endpoints */
  circlesRpcUrl: string;
  /** RPC URL for direct chain calls (eth_call, etc). Defaults to circlesRpcUrl if not provided */
  chainRpcUrl?: string;
  /** Pathfinder service URL for computing transfer paths */
  pathfinderUrl: string;
  /** Profile service URL for user profiles and metadata */
  profileServiceUrl: string;
  /** Circles V1 Hub contract address */
  v1HubAddress: Address;
  /** Circles V2 Hub contract address */
  v2HubAddress: Address;
  /** Name Registry contract address */
  nameRegistryAddress: Address;
  /** Base Group Mint Policy contract address */
  baseGroupMintPolicy: Address;
  /** Standard Treasury contract address */
  standardTreasury: Address;
  /** Core Members Group Deployer contract address */
  coreMembersGroupDeployer: Address;
  /** Base Group Factory contract address */
  baseGroupFactoryAddress: Address;
  /** Lift ERC20 contract address */
  liftERC20Address: Address;
  /** Invitation Escrow contract address */
  invitationEscrowAddress: Address;
  /** Invitation Farm contract address */
  invitationFarmAddress: Address;
  /** Referrals Module contract address */
  referralsModuleAddress: Address;
}
