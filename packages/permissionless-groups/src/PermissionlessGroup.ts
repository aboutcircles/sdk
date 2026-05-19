import {
  HubV2Contract,
  ScoreGatedMintPolicyContract,
  LiftERC20Contract,
  DemurrageCirclesContract,
  InflationaryCirclesContract,
} from '@aboutcircles/sdk-core';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import { PathfinderMethods, RpcClient } from '@aboutcircles/sdk-rpc';
import { encodeAbiParameters } from '@aboutcircles/sdk-utils/abi';
import { PERMISSIONLESS_GROUPS_MIGRATION } from '@aboutcircles/sdk-utils';
import { CirclesType } from '@aboutcircles/sdk-types';
import type {
  Address,
  Hex,
  TransactionRequest,
} from '@aboutcircles/sdk-types';

import { ScoreGroupsClient } from './ScoreGroupsClient.js';
import { PermissionlessGroupError } from './errors.js';
import type {
  PermissionlessGroupConfig,
  MintParams,
  MintResult,
  MigrationParams,
  MigrationResult,
  ProofResponse,
  BalanceResult,
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
  public readonly lift: LiftERC20Contract;

  /**
   * Lazily-resolved mint-policy wrapper. The address is read from
   * `Hub.mintPolicies(groupAddress)` on first use and cached. We store a
   * Promise so concurrent first callers share one round-trip.
   */
  private policyPromise: Promise<ScoreGatedMintPolicyContract> | null = null;

  constructor(config: PermissionlessGroupConfig) {
    this.config = config;
    this.client = new ScoreGroupsClient(config.backendBaseUrl);
    this.hub = new HubV2Contract({ address: config.hubAddress, rpcUrl: config.rpcUrl });
    this.lift = new LiftERC20Contract({
      address: config.liftERC20Address,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Resolve the ScoreGatedMintPolicy bound to this group on the Hub.
   * Cached after the first call.
   */
  async policy(): Promise<ScoreGatedMintPolicyContract> {
    if (!this.policyPromise) {
      this.policyPromise = this.hub.mintPolicies(this.config.groupAddress).then(
        (address) =>
          new ScoreGatedMintPolicyContract({
            address,
            rpcUrl: this.config.rpcUrl,
          }),
        (err) => {
          this.policyPromise = null;
          throw err;
        }
      );
    }
    return this.policyPromise;
  }

  /**
   * Read the avatar's holdings of this group's token across all three forms:
   * ERC1155 group-CRC (unwrapped), ERC20 demurrage wrapper, and ERC20
   * inflationary wrapper. Wrappers that haven't been deployed yet return 0n
   * with `address = 0x0…0` — that's the chain state, not an error.
   *
   * Four `eth_call`s total, no transactions.
   */
  async balance(avatar: Address): Promise<BalanceResult> {
    const group = this.config.groupAddress;

    const [tokenId, demurrageWrapperAddress, inflationaryWrapperAddress] =
      await Promise.all([
        this.hub.toTokenId(group),
        this.lift.erc20Circles(CirclesType.Demurrage, group),
        this.lift.erc20Circles(CirclesType.Inflation, group),
      ]);

    const [erc1155, demurrageWrapper, inflationaryWrapper] = await Promise.all([
      this.hub.balanceOf(avatar, tokenId),
      isZeroAddress(demurrageWrapperAddress)
        ? Promise.resolve(0n)
        : new DemurrageCirclesContract({
            address: demurrageWrapperAddress,
            rpcUrl: this.config.rpcUrl,
          }).balanceOf(avatar),
      isZeroAddress(inflationaryWrapperAddress)
        ? Promise.resolve(0n)
        : new InflationaryCirclesContract({
            address: inflationaryWrapperAddress,
            rpcUrl: this.config.rpcUrl,
          }).balanceOf(avatar),
    ]);

    return {
      erc1155,
      demurrageWrapper,
      inflationaryWrapper,
      demurrageWrapperAddress,
      inflationaryWrapperAddress,
    };
  }

  /**
   * Build the mint-tx batch for `avatar` against the avatar's own personal
   * CRC, gated by an SMT score proof. Always wraps as `CirclesType.Inflation`.
   * Submission is the caller's job — the returned `txs` are meant to be sent
   * atomically (e.g. Safe multisend) for the policy invariant to hold.
   *
   * Flow:
   *   1. fetch (score, proof) from the score-groups backend            — off-chain
   *   2. compare backend proof.root vs `policy.merkleRoots(group)`;
   *      if backend is ahead, poll the on-chain root every
   *      `rootPollIntervalMs` (default 3s) until it matches or
   *      `rootPollTimeoutMs` elapses
   *   3. emit tx: policy.snapshotIssuance()
   *   4. emit tx: Hub.personalMint()
   *   5. emit tx: Hub.groupMint(group, [avatar], [amount],
   *                             abi.encode(score, proof))
   *   6. emit tx: Hub.wrap(group, amount, CirclesType.Inflation)
   */
  async mint(params: MintParams): Promise<MintResult> {
    this.validateMintParams(params);

    const pollIntervalMs = params.rootPollIntervalMs ?? DEFAULT_ROOT_POLL_INTERVAL_MS;
    const pollTimeoutMs = params.rootPollTimeoutMs ?? DEFAULT_ROOT_POLL_TIMEOUT_MS;

    let proof = await this.fetchFreshProof(params.avatar);

    // Score 0 = avatar not in the SMT, ineligible for the group mint. Don't
    // fail the caller. Emit only
    // Hub.personalMint() and skip snapshot/groupMint/wrap entirely.
    if (proof.scoreRaw === '0') {
      return { txs: [this.hub.personalMint()], proof, amount: 0n };
    }

    proof = await this.waitForChainRootToMatchBackend(
      params.avatar,
      proof,
      pollIntervalMs,
      pollTimeoutMs
    );

    return this.buildMintBatch(params, proof);
  }

  /**
   * Build the tx batch that migrates legacy GnosisGroup CRC held by `avatar`
   * into the destination ScoreGroup, via the SinkWrapper at
   * `PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress`.
   *
   * When `amount` is omitted, the pathfinder is probed for the maximum the
   * avatar can source under the same constraints, and that value is used.
   *
   * Pathfinder constraints baked in:
   *   - destination         = SinkWrapper
   *   - `excludeFromTokens` = [ScoreGroup]   (already-migrated ScoreGroup CRC may not be used as a source)
   *
   * Submission is the caller's job — the returned `txs` are meant to be sent
   * atomically through a Safe runner.
   */
  async migration(params: MigrationParams): Promise<MigrationResult> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput('migration() requires `avatar`');
    }
    if (params.amount !== undefined && params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput('migration() requires `amount > 0` when set', {
        amount: params.amount.toString(),
      });
    }

    const amount = params.amount ?? (await this.resolveMaxMigratable(params.avatar));
    if (amount === 0n) {
      throw PermissionlessGroupError.invalidInput(
        'no GnosisGroup CRC reachable from this avatar — nothing to migrate',
        { avatar: params.avatar }
      );
    }

    const builder = new TransferBuilder(this.config.circlesConfig);
    const txs = await builder.constructAdvancedTransfer(
      params.avatar,
      PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      amount,
      {
        excludeFromTokens: [PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress],
        toTokens: [PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress],
        useWrappedBalances: true,
      }
    );

    return { txs, amount };
  }

  private async resolveMaxMigratable(avatar: Address): Promise<bigint> {
    const pathfinder = new PathfinderMethods(
      new RpcClient(this.config.circlesConfig.circlesRpcUrl)
    );
    return pathfinder.findMaxFlow({
      from: avatar,
      to: PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      excludeFromTokens: [PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress],
      toTokens: [PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress],
    });
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
    const policy = await this.policy();
    let proof = initialProof;
    let chainRoot = await policy.merkleRoots(this.config.groupAddress);
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

      chainRoot = await policy.merkleRoots(this.config.groupAddress);
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

  private async buildMintBatch(
    params: MintParams,
    proof: ProofResponse
  ): Promise<MintResult> {
    const score = BigInt(proof.scoreRaw);
    const policyData = encodePolicyData(score, proof.proof);
    const amount = await this.resolveAmount(params, score);
    const policy = await this.policy();

    const txs: TransactionRequest[] = [
      // Step 3: policy.snapshotIssuance()
      policy.snapshotIssuance(),
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

    return { txs, proof, amount };
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

function isZeroAddress(a: Address): boolean {
  return a.toLowerCase() === '0x0000000000000000000000000000000000000000';
}

function hexEq(a: Hex, b: Hex): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
