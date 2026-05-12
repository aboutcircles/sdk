import { HubV2Contract, ScoreGatedMintPolicyContract } from '@aboutcircles/sdk-core';
import { encodeAbiParameters } from '@aboutcircles/sdk-utils/abi';
import { CirclesType } from '@aboutcircles/sdk-types';
import type {
  Address,
  Hex,
  ContractRunner,
  TransactionRequest,
} from '@aboutcircles/sdk-types';

import { ScoreGroupsClient } from './ScoreGroupsClient.js';
import { PermissionlessGroupError } from './errors.js';
import type {
  PermissionlessGroupConfig,
  MintParams,
  MintResult,
  ProofResponse,
} from './types.js';

/** Safety margin (s) before next root rotation at which we wait it out. Hardcoded. */
const SAFETY_MARGIN_SECONDS = 5;
/** Cushion added on top of the publisher cadence when sleeping past a pending root. */
const PENDING_ROOT_CONFIRMATION_BUFFER_SECONDS = 5;
/** Default polling cadence (ms) while waiting for the publisher to push the proof's root. */
const DEFAULT_ROOT_POLL_INTERVAL_MS = 3_000;
/** Default total time budget (ms) for the polling loop before we give up. */
const DEFAULT_ROOT_POLL_TIMEOUT_MS = 120_000;
/** Score scale used by the policy: max score == 100. */
const MAX_SCORE = 100n;

/**
 * High-level entrypoint for minting from a score-gated permissionless group.
 *
 * The mint flow batches: (optional) `Hub.personalMint`, `policy.snapshotIssuance`,
 * and `Hub.groupMint(group, collateral, amounts, abi.encode(score, proof))` in
 * one atomic runner call.
 */
export class PermissionlessGroup {
  public readonly config: PermissionlessGroupConfig;
  public readonly client: ScoreGroupsClient;
  public readonly hub: HubV2Contract;
  public readonly policy: ScoreGatedMintPolicyContract;

  private readonly runner: ContractRunner;

  constructor(config: PermissionlessGroupConfig) {
    this.config = config;
    this.runner = config.runner;
    this.client = new ScoreGroupsClient(config.backendBaseUrl);
    this.hub = new HubV2Contract({ address: config.hubAddress, rpcUrl: config.rpcUrl });
    this.policy = new ScoreGatedMintPolicyContract({
      address: config.mintPolicyAddress,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Mint group CRC for `avatar` against the avatar's own personal CRC,
   * gated by an SMT score proof. Always wraps as `CirclesType.Inflation`.
   *
   * Flow (single atomic Safe multisend):
   *   1. fetch (score, proof) from the score-groups backend            — off-chain
   *   2. compare backend proof.root vs `policy.merkleRoots(group)`;
   *      if backend is ahead, poll the on-chain root every
   *      `rootPollIntervalMs` (default 3s) until it matches or
   *      `rootPollTimeoutMs` elapses
   *   3. policy.snapshotIssuance()                                     — on-chain
   *   4. Hub.personalMint()                                            — on-chain
   *   5. Hub.groupMint(group, [avatar], [amount],
   *                    abi.encode(score, proof))                       — on-chain
   *   6. Hub.wrap(group, amount, CirclesType.Inflation)                — on-chain
   */
  async mint(params: MintParams): Promise<MintResult> {
    this.validateMintParams(params);

    const pollIntervalMs = params.rootPollIntervalMs ?? DEFAULT_ROOT_POLL_INTERVAL_MS;
    const pollTimeoutMs = params.rootPollTimeoutMs ?? DEFAULT_ROOT_POLL_TIMEOUT_MS;

    let proof = await this.fetchFreshProof(params.avatar);

    if (proof.scoreRaw === '0') {
      throw PermissionlessGroupError.notEligible(params.avatar, proof.scoreRaw);
    }

    proof = await this.waitForChainRootToMatchBackend(
      params.avatar,
      proof,
      pollIntervalMs,
      pollTimeoutMs
    );

    return this.submitMint(params, proof);
  }

  /**
   * Read `policy.merkleRoots(group)` and compare to the backend proof's root.
   * If they disagree, poll the chain every `pollIntervalMs` until either it
   * catches up, the backend rotates to a newer root (re-fetched then), or the
   * `pollTimeoutMs` budget runs out.
   *
   * Returns the proof that is consistent with the on-chain root at the moment
   * the loop exits.
   */
  private async waitForChainRootToMatchBackend(
    avatar: Address,
    initialProof: ProofResponse,
    pollIntervalMs: number,
    pollTimeoutMs: number
  ): Promise<ProofResponse> {
    let proof = initialProof;
    let chainRoot = await this.policy.merkleRoots(this.config.groupAddress);
    if (hexEq(chainRoot, proof.root)) return proof;

    if (pollTimeoutMs <= 0) {
      throw PermissionlessGroupError.proofStale(
        'policy.merkleRoots disagrees with backend proof root (polling disabled)',
        { chainRoot, backendRoot: proof.root }
      );
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt < pollTimeoutMs) {
      await sleep(pollIntervalMs);

      chainRoot = await this.policy.merkleRoots(this.config.groupAddress);
      if (hexEq(chainRoot, proof.root)) return proof;

      // Re-fetch the proof: the backend may have rotated to a newer root since
      // we last looked, in which case `proof.root` is the stale one — not the
      // chain. Picking up the new proof keeps the comparison meaningful.
      proof = await this.fetchFreshProof(avatar);
      if (hexEq(chainRoot, proof.root)) return proof;
    }

    throw PermissionlessGroupError.proofStale(
      `on-chain merkleRoots(group) did not catch up to backend within ${pollTimeoutMs}ms`,
      { chainRoot, backendRoot: proof.root, pollTimeoutMs, pollIntervalMs }
    );
  }

  private async submitMint(
    params: MintParams,
    proof: ProofResponse
  ): Promise<MintResult> {
    const score = BigInt(proof.scoreRaw);
    const policyData = encodePolicyData(score, proof.proof);
    const amount = await this.resolveAmount(params, score);

    const txs: TransactionRequest[] = [
      // Step 3: policy.snapshotIssuance()
      this.policy.snapshotIssuance(),
      // Step 4: Hub.personalMint() — must come after snapshot (the policy
      // requires currentIssuance == 0 between snapshot and groupMint).
      this.hub.personalMint(),
      // Step 5: Hub.groupMint(group, [avatar], [amount], abi.encode(score, proof))
      this.hub.groupMint(
        this.config.groupAddress,
        [params.avatar],
        [amount],
        policyData
      ),
      // Step 6: Hub.wrap(group, amount, CirclesType.Inflation)
      this.hub.wrap(this.config.groupAddress, amount, CirclesType.Inflation),
    ];

    if (!this.runner.sendTransaction) {
      throw PermissionlessGroupError.invalidInput(
        'Runner does not support sendTransaction',
        { runner: this.runner.constructor?.name }
      );
    }

    try {
      const receipt = await this.runner.sendTransaction(txs);
      return { receipt, proof, amount };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw PermissionlessGroupError.mintReverted(msg, {
        group: this.config.groupAddress,
        avatar: params.avatar,
        amount: amount.toString(),
      });
    }
  }

  /**
   * Fetch a proof and, if its freshness hints indicate staleness, sleep and
   * refetch exactly once. We deliberately don't loop here — the outer root
   * poll handles the longer wait.
   */
  private async fetchFreshProof(avatar: Address): Promise<ProofResponse> {
    const proof = await this.client.getProof(this.config.groupAddress, avatar);

    const waitMs = computeStalenessWaitMs(proof, SAFETY_MARGIN_SECONDS);
    if (waitMs > 0) {
      await sleep(waitMs);
      return this.client.getProof(this.config.groupAddress, avatar);
    }

    return proof;
  }

  /**
   * Read the avatar's current score from the score-groups backend.
   *
   * No on-chain calls, no transactions — just one HTTP request to
   * `/groups/{group}/proof/{address}`. Useful for UIs showing
   * "you have X / Y required" before the user attempts a mint.
   */
  async getScore(avatar: Address): Promise<bigint> {
    const proof = await this.client.getProof(this.config.groupAddress, avatar);
    return BigInt(proof.scoreRaw);
  }

  private validateMintParams(params: MintParams): void {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput('mint() requires `avatar`');
    }
    if (params.amount !== undefined && params.amount < 0n) {
      throw PermissionlessGroupError.invalidInput('amount must be >= 0', {
        amount: params.amount.toString(),
      });
    }
  }

  /**
   * Resolve `amount`: when omitted or `0n`, return the maximum the policy will
   * accept, `(snapshottedIssuance × score) / MAX_SCORE`. `snapshottedIssuance`
   * is read from `Hub.calculateIssuance(avatar)` *before* the snapshot/personalMint
   * pair runs — those operate in the same block, so the value the policy
   * captures with `snapshotIssuance()` matches what we read here.
   */
  private async resolveAmount(params: MintParams, score: bigint): Promise<bigint> {
    if (params.amount !== undefined && params.amount > 0n) return params.amount;

    const [issuance] = await this.hub.calculateIssuance(params.avatar);
    const maxMintable = (issuance * score) / MAX_SCORE;
    if (maxMintable === 0n) {
      throw PermissionlessGroupError.invalidInput(
        'mint-max resolved to 0: avatar has no claimable issuance right now',
        {
          avatar: params.avatar,
          snapshottedIssuance: issuance.toString(),
          score: score.toString(),
        }
      );
    }
    return maxMintable;
  }
}

/**
 * ABI-encode the mint policy's expected `data` argument as `(uint256, bytes)`.
 * Exported for test reuse.
 */
export function encodePolicyData(score: bigint, proof: Hex): Hex {
  return encodeAbiParameters(['uint256', 'bytes'], [score, proof]);
}

/**
 * Decide how long to wait before refetching the proof based on the backend's
 * freshness hints. Returns 0 when the proof is good to submit immediately.
 *
 * - publishStatus === "pending": wait until lastHeadChangedAt + cadence + buffer.
 * - nextHeadEarliestAt within safetyMargin: wait one cadence window.
 *
 * Uses `serverTime` (not local clock) as the reference so client-side skew
 * doesn't blow up the math.
 */
export function computeStalenessWaitMs(
  proof: ProofResponse,
  safetyMarginSeconds: number
): number {
  if (proof.publishStatus === 'pending') {
    // Always wait at least one cadence window when the publisher hasn't
    // broadcast the proof's root yet. If `lastHeadChangedAt` is set and very
    // recent, prefer the longer of "anchor + cadence" and "one cadence from
    // now" — never return 0, otherwise the caller will refetch a still-pending
    // proof in a tight loop.
    const minWaitMs =
      (proof.publishCadenceSeconds + PENDING_ROOT_CONFIRMATION_BUFFER_SECONDS) * 1000;
    if (!proof.lastHeadChangedAt) return minWaitMs;
    const anchorMs = Date.parse(proof.lastHeadChangedAt);
    const serverMs = Date.parse(proof.serverTime);
    const targetMs =
      anchorMs +
      (proof.publishCadenceSeconds + PENDING_ROOT_CONFIRMATION_BUFFER_SECONDS) * 1000;
    return Math.max(minWaitMs, targetMs - serverMs);
  }

  if (proof.nextHeadEarliestAt) {
    const nextMs = Date.parse(proof.nextHeadEarliestAt);
    const serverMs = Date.parse(proof.serverTime);
    const remainingMs = nextMs - serverMs;
    if (remainingMs < safetyMarginSeconds * 1000) {
      return Math.max(0, remainingMs) + PENDING_ROOT_CONFIRMATION_BUFFER_SECONDS * 1000;
    }
  }

  return 0;
}

function hexEq(a: Hex, b: Hex): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
