import { Contract } from './contract';
import { baseGroupAbi } from '@aboutcircles/sdk-abis/baseGroup';
import type { Address, TransactionRequest, Hex } from '@aboutcircles/sdk-types';

/**
 * BaseGroup Contract Wrapper
 * Provides type-safe methods for interacting with Circles BaseGroup contracts
 *
 * Note: BaseGroup contracts have multiple instances (not a singleton).
 * Create instances with specific contract addresses.
 *
 * @example
 * ```typescript
 * const baseGroup = new BaseGroupContract({
 *   address: '0x...', // specific BaseGroup instance address
 *   rpcUrl: 'https://rpc.gnosischain.com'
 * });
 * ```
 */
export class BaseGroupContract extends Contract<typeof baseGroupAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: baseGroupAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Get the BaseMintHandler contract address
   */
  async BASE_MINT_HANDLER(): Promise<Address> {
    return this.read('BASE_MINT_HANDLER') as Promise<Address>;
  }

  /**
   * Get the base mint policy address (constant)
   */
  async BASE_MINT_POLICY(): Promise<Address> {
    return this.read('BASE_MINT_POLICY') as Promise<Address>;
  }

  /**
   * Get the BaseTreasury contract address
   */
  async BASE_TREASURY(): Promise<Address> {
    return this.read('BASE_TREASURY') as Promise<Address>;
  }

  /**
   * Get the maximum number of membership conditions allowed (constant)
   */
  async MAX_CONDITIONS(): Promise<bigint> {
    return this.read('MAX_CONDITIONS') as Promise<bigint>;
  }

  /**
   * Get the current owner address
   */
  async owner(): Promise<Address> {
    return this.read('owner') as Promise<Address>;
  }

  /**
   * Get the current service address
   */
  async service(): Promise<Address> {
    return this.read('service') as Promise<Address>;
  }

  /**
   * Get the current fee collection address
   */
  async feeCollection(): Promise<Address> {
    return this.read('feeCollection') as Promise<Address>;
  }

  /**
   * Get all membership condition addresses
   */
  async getMembershipConditions(): Promise<readonly Address[]> {
    return this.read('getMembershipConditions') as Promise<readonly Address[]>;
  }

  /**
   * Get a membership condition address by index
   */
  async membershipConditions(index: bigint): Promise<Address> {
    return this.read('membershipConditions', [index]) as Promise<Address>;
  }

  /**
   * Create a transaction to set a new owner
   */
  setOwner(newOwner: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('setOwner', [newOwner]),
      value: BigInt(0),
    };
  }

  /**
   * Create a transaction to set a new service address
   */
  setService(newService: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('setService', [newService]),
      value: BigInt(0),
    };
  }

  /**
   * Create a transaction to set a new fee collection address
   */
  setFeeCollection(newFeeCollection: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('setFeeCollection', [newFeeCollection]),
      value: BigInt(0),
    };
  }

  /**
   * Create a transaction to enable or disable a membership condition
   */
  setMembershipCondition(
    condition: Address,
    enabled: boolean
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('setMembershipCondition', [condition, enabled]),
      value: BigInt(0),
    };
  }

  /**
   * Create a transaction to trust a member (without membership checks)
   */
  trust(trustReceiver: Address, expiry: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('trust', [trustReceiver, expiry]),
      value: BigInt(0),
    };
  }

  /**
   * Create a transaction to trust or untrust a batch of members with membership condition checks
   */
  trustBatchWithConditions(
    members: readonly Address[],
    expiry: bigint
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('trustBatchWithConditions', [members, expiry]),
      value: BigInt(0),
    };
  }

  /**
   * Create a transaction to update the metadata digest
   */
  updateMetadataDigest(metadataDigest: Hex): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('updateMetadataDigest', [metadataDigest]),
      value: BigInt(0),
    };
  }

  /**
   * Create a transaction to register a short name with a specific nonce
   */
  registerShortNameWithNonce(nonce: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('registerShortNameWithNonce', [nonce]),
      value: BigInt(0),
    };
  }
}
