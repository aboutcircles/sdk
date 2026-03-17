import { Contract } from './contract';
import { nameRegistryAbi } from '@aboutcircles/sdk-abis/nameRegistry';
import type { Address, TransactionRequest, Hex } from '@aboutcircles/sdk-types';

/**
 * NameRegistry Contract Wrapper
 * Provides type-safe methods for interacting with Circles NameRegistry contract
 *
 * This is a singleton contract deployed at a fixed address.
 */
export class NameRegistryContract extends Contract<typeof nameRegistryAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: nameRegistryAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Get the default Circles name prefix constant
   */
  async DEFAULT_CIRCLES_NAME_PREFIX(): Promise<string> {
    return this.read('DEFAULT_CIRCLES_NAME_PREFIX') as Promise<string>;
  }

  /**
   * Get the default Circles symbol constant
   */
  async DEFAULT_CIRCLES_SYMBOL(): Promise<string> {
    return this.read('DEFAULT_CIRCLES_SYMBOL') as Promise<string>;
  }

  /**
   * Get the maximum short name value constant
   */
  async MAX_SHORT_NAME(): Promise<bigint> {
    return this.read('MAX_SHORT_NAME') as Promise<bigint>;
  }

  /**
   * Get the Hub contract address
   */
  async hub(): Promise<Address> {
    return this.read('hub') as Promise<Address>;
  }

  /**
   * Get the name for an avatar
   */
  async name(avatar: Address): Promise<string> {
    return this.read('name', [avatar]) as Promise<string>;
  }

  /**
   * Get the symbol for an avatar
   */
  async symbol(avatar: Address): Promise<string> {
    return this.read('symbol', [avatar]) as Promise<string>;
  }

  /**
   * Get the custom name for an avatar
   */
  async customNames(avatar: Address): Promise<string> {
    return this.read('customNames', [avatar]) as Promise<string>;
  }

  /**
   * Get the custom symbol for an avatar
   */
  async customSymbols(avatar: Address): Promise<string> {
    return this.read('customSymbols', [avatar]) as Promise<string>;
  }

  /**
   * Get the metadata digest for an avatar
   */
  async getMetadataDigest(avatar: Address): Promise<Hex> {
    return this.read('getMetadataDigest', [avatar]) as Promise<Hex>;
  }

  /**
   * Get the metadata digest for an avatar (mapping access)
   */
  async avatarToMetaDataDigest(avatar: Address): Promise<Hex> {
    return this.read('avatarToMetaDataDigest', [avatar]) as Promise<Hex>;
  }

  /**
   * Get the short name for an avatar
   */
  async shortNames(avatar: Address): Promise<bigint> {
    return this.read('shortNames', [avatar]) as Promise<bigint>;
  }

  /**
   * Get the avatar address for a short name
   */
  async shortNameToAvatar(shortName: bigint): Promise<Address> {
    return this.read('shortNameToAvatar', [shortName]) as Promise<Address>;
  }

  /**
   * Search for a valid short name for an avatar
   * @returns [shortName, nonce]
   */
  async searchShortName(avatar: Address): Promise<readonly [bigint, bigint]> {
    return this.read('searchShortName', [avatar]) as Promise<readonly [bigint, bigint]>;
  }

  /**
   * Calculate what short name would be generated for an avatar with a specific nonce
   */
  async calculateShortNameWithNonce(avatar: Address, nonce: bigint): Promise<bigint> {
    return this.read('calculateShortNameWithNonce', [avatar, nonce]) as Promise<bigint>;
  }

  /**
   * Check if a name is valid according to Circles naming rules
   */
  async isValidName(name: string): Promise<boolean> {
    return this.read('isValidName', [name]) as Promise<boolean>;
  }

  /**
   * Check if a symbol is valid according to Circles naming rules
   */
  async isValidSymbol(symbol: string): Promise<boolean> {
    return this.read('isValidSymbol', [symbol]) as Promise<boolean>;
  }

  /**
   * Register a custom name for an avatar
   */
  registerCustomName(avatar: Address, name: string): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('registerCustomName', [avatar, name]),
      value: BigInt(0),
    };
  }

  /**
   * Register a custom symbol for an avatar
   */
  registerCustomSymbol(avatar: Address, symbol: string): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('registerCustomSymbol', [avatar, symbol]),
      value: BigInt(0),
    };
  }

  /**
   * Register a short name for the caller (searches for available nonce)
   */
  registerShortName(value: bigint = BigInt(0)): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('registerShortName', []),
      value: BigInt(0),
    };
  }

  /**
   * Register a short name with a specific nonce
   */
  registerShortNameWithNonce(nonce: bigint): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('registerShortNameWithNonce', [nonce]),
      value: BigInt(0),
    };
  }

  /**
   * Set metadata digest for an avatar (admin function)
   */
  setMetadataDigest(avatar: Address, metadataDigest: Hex): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('setMetadataDigest', [avatar, metadataDigest]),
      value: BigInt(0),
    };
  }

  /**
   * Update metadata digest for the caller
   */
  updateMetadataDigest(metadataDigest: Hex): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('updateMetadataDigest', [metadataDigest]),
      value: BigInt(0),
    };
  }
}
