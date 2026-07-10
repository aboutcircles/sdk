import { Contract } from './contract';
import { referralsModuleAbi } from '@aboutcircles/sdk-abis';
import type { Address, TransactionRequest, Hex } from '@aboutcircles/sdk-types';

/**
 * ReferralsModule Contract Wrapper
 * Provides type-safe methods for interacting with the ReferralsModule contract
 *
 * This contract pre-deploys "pre-made" human CRC Safe accounts on behalf of origin inviters,
 * and lets invited humans claim those Safes using a device WebAuthn passkey plus an offchain
 * secret provided by the origin inviter.
 */
export class ReferralsModuleContract extends Contract<typeof referralsModuleAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: referralsModuleAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  // ========== CREATE ACCOUNT FUNCTIONS ==========

  /**
   * Pre-deploys a Safe for an origin inviter's offchain signer
   * Only callable by the Invitation Module Generic Call Proxy
   * @param signer The public address derived from the origin inviter's offchain secret key
   * @returns Transaction request
   */
  createAccount(signer: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('createAccount', [signer]),
      value: BigInt(0),
    };
  }

  /**
   * Batch pre-deploys Safes for multiple signers
   * Only callable by the Invitation Module Generic Call Proxy
   * @param signers The list of public addresses derived from origin inviters' offchain secrets
   * @returns Transaction request
   */
  createAccounts(signers: Address[]): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('createAccounts', [signers]),
      value: BigInt(0),
    };
  }

  /**
   * Predicts the pre-made Safe address for a given signer without deploying it
   * @param signer The offchain public address chosen by the origin inviter
   * @returns The predicted Safe address
   */
  async computeAddress(signer: Address): Promise<Address> {
    return this.read('computeAddress', [signer]) as Promise<Address>;
  }

  // ========== CLAIM ACCOUNT FUNCTIONS ==========

  /**
   * Claims the pre-made Safe by proving knowledge of the offchain secret
   * and configuring the device WebAuthn passkey
   * @param x The X coordinate of the WebAuthn public key
   * @param y The Y coordinate of the WebAuthn public key
   * @param verifier The WebAuthn verifier/authenticator contract address
   * @param signature The 65-byte ECDSA signature over the EIP-712 passkey digest
   * @returns Transaction request
   */
  claimAccount(x: bigint, y: bigint, verifier: Address, signature: Hex): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimAccount', [x, y, verifier, signature]),
      value: BigInt(0),
    };
  }

  /**
   * Claims the pre-made Safe and sets Name Registry metadata in a single transaction
   * @param x The X coordinate of the passkey public key
   * @param y The Y coordinate of the passkey public key
   * @param verifier The verifier/authenticator contract address
   * @param signature The 65-byte ECDSA signature over the EIP-712 passkey digest
   * @param metadataDigest The metadata digest to set in the Name Registry
   * @returns Transaction request
   */
  claimAccountWithMetadata(
    x: bigint,
    y: bigint,
    verifier: Address,
    signature: Hex,
    metadataDigest: Hex
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimAccount', [x, y, verifier, signature, metadataDigest]),
      value: BigInt(0),
    };
  }

  /**
   * Claims the pre-made Safe and sets the affiliate group in a single transaction
   * @param x The X coordinate of the passkey public key
   * @param y The Y coordinate of the passkey public key
   * @param verifier The verifier/authenticator contract address
   * @param signature The 65-byte ECDSA signature over the EIP-712 passkey digest
   * @param affiliateGroup The affiliate group address to register
   * @returns Transaction request
   */
  claimAccountWithAffiliateGroup(
    x: bigint,
    y: bigint,
    verifier: Address,
    signature: Hex,
    affiliateGroup: Address
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimAccount', [x, y, verifier, signature, affiliateGroup]),
      value: BigInt(0),
    };
  }

  /**
   * Claims the pre-made Safe, sets Name Registry metadata and affiliate group
   * @param x The X coordinate of the passkey public key
   * @param y The Y coordinate of the passkey public key
   * @param verifier The verifier/authenticator contract address
   * @param signature The 65-byte ECDSA signature over the EIP-712 passkey digest
   * @param metadataDigest The metadata digest to set in the Name Registry
   * @param affiliateGroup The affiliate group address to register
   * @returns Transaction request
   */
  claimAccountWithMetadataAndAffiliateGroup(
    x: bigint,
    y: bigint,
    verifier: Address,
    signature: Hex,
    metadataDigest: Hex,
    affiliateGroup: Address
  ): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('claimAccount', [x, y, verifier, signature, metadataDigest, affiliateGroup]),
      value: BigInt(0),
    };
  }

  // ========== VIEW FUNCTIONS ==========

  /**
   * Get the account record for a given signer
   * @param signer The offchain public address
   * @returns Object with account address and claimed status
   */
  async accounts(signer: Address): Promise<{ account: Address; claimed: boolean }> {
    const [account, claimed] = (await this.read('accounts', [signer])) as [Address, boolean];
    return { account, claimed };
  }

  /**
   * Get the EIP-712 domain separator
   * @returns The domain separator
   */
  async domainSeparator(): Promise<Hex> {
    return this.read('DOMAIN_SEPARATOR') as Promise<Hex>;
  }

  /**
   * Get the welcome bonus amount (target CRC balance after claim)
   * @returns The welcome bonus amount
   */
  async welcomeBonus(): Promise<bigint> {
    return this.read('WELCOME_BONUS') as Promise<bigint>;
  }

  /**
   * Get the Hub contract address
   * @returns The Hub address
   */
  async hub(): Promise<Address> {
    return this.read('HUB') as Promise<Address>;
  }

  /**
   * Get the Invitation Module address
   * @returns The Invitation Module address
   */
  async invitationModule(): Promise<Address> {
    return this.read('INVITATION_MODULE') as Promise<Address>;
  }

  /**
   * Get the Generic Call Proxy address
   * @returns The Generic Call Proxy address
   */
  async genericCallProxy(): Promise<Address> {
    return this.read('GENERIC_CALL_PROXY') as Promise<Address>;
  }

  /**
   * Get the Name Registry address
   * @returns The Name Registry address
   */
  async nameRegistry(): Promise<Address> {
    return this.read('NAME_REGISTRY') as Promise<Address>;
  }

  /**
   * Get the Affiliate Group Registry address
   * @returns The Affiliate Group Registry address
   */
  async affiliateGroupRegistry(): Promise<Address> {
    return this.read('AFFILIATE_GROUP_REGISTRY') as Promise<Address>;
  }

  /**
   * Get the Safe Proxy Factory address
   * @returns The Safe Proxy Factory address
   */
  async safeProxyFactory(): Promise<Address> {
    return this.read('SAFE_PROXY_FACTORY') as Promise<Address>;
  }

  /**
   * Get the Safe Singleton address
   * @returns The Safe Singleton address
   */
  async safeSingleton(): Promise<Address> {
    return this.read('SAFE_SINGLETON') as Promise<Address>;
  }

  /**
   * Get the Safe 4337 Module address
   * @returns The Safe 4337 Module address
   */
  async safe4337Module(): Promise<Address> {
    return this.read('SAFE_4337_MODULE') as Promise<Address>;
  }

  /**
   * Get the Safe Module Setup address
   * @returns The Safe Module Setup address
   */
  async safeModuleSetup(): Promise<Address> {
    return this.read('SAFE_MODULE_SETUP') as Promise<Address>;
  }

  /**
   * Get the Safe WebAuthn Shared Signer address
   * @returns The Safe WebAuthn Shared Signer address
   */
  async safeWebAuthnSharedSigner(): Promise<Address> {
    return this.read('SAFE_WEB_AUTHN_SHARED_SIGNER') as Promise<Address>;
  }
}
