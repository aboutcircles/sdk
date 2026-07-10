import { Contract } from './contract.js';
import { scoreGatedMintPolicyAbi } from '@aboutcircles/sdk-abis/scoreGatedMintPolicy';
import type { Address, Hex, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * ScoreGatedMintPolicy wrapper (permissionless-groups).
 *
 * The policy holds the SMT root for each group internally (`merkleRoots`) and
 * is invoked by the Hub during `groupMint` with
 * `data = abi.encode(uint256 score, bytes proof)`.
 *
 * Two important caller-side ops:
 *  - `snapshotIssuance()` — the minter MUST call this before `Hub.groupMint`
 *    so the policy can fix the per-user issuance cap for the current round.
 *  - `updateMerkleRoot(group, root)` — admin-only; used by the publisher.
 */
export class ScoreGatedMintPolicyContract extends Contract<typeof scoreGatedMintPolicyAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: scoreGatedMintPolicyAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Current SMT root the policy verifies proofs against for `group`.
   * SDK uses this as a freshness pre-flight: compare against the backend's
   * `/proof` response root before submitting.
   */
  async merkleRoots(group: Address): Promise<Hex> {
    return (await this.read('merkleRoots', [group])) as Hex;
  }

  /**
   * Build a `snapshotIssuance()` tx. Caller (the minter) submits this before
   * `Hub.groupMint` — typically batched in the same atomic runner call.
   */
  snapshotIssuance(): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('snapshotIssuance', []),
      value: BigInt(0),
    };
  }

  /**
   * Build an `updateMerkleRoot(group, root)` tx. Admin-only — the SDK exposes
   * it for tooling/tests that need to drive the publisher manually.
   */
  updateMerkleRoot(group: Address, root: Hex): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('updateMerkleRoot', [group, root]),
      value: BigInt(0),
    };
  }
}
