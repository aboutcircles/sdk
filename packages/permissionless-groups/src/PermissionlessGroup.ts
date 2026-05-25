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
import {
  PERMISSIONLESS_GROUPS_MIGRATION,
  SCORE_GROUPS_STAGING_RPC_URL,
} from '@aboutcircles/sdk-utils';
import { MAX_FLOW } from '@aboutcircles/sdk-utils/constants';
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
  TransferGCRCAndScoreParams,
  TransferGCRCAndScoreResult,
  ProofResponse,
  BalanceResult,
} from './types.js';

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
    // The score-groups migration stack (sinkWrapper, scoreRouter, score-gated
    // trust) only lives in the staging Circles indexer. Pointing the
    // pathfinder at any other RPC silently returns paths that don't route
    // through the score router and revert at the sink. Force both
    // `rpcUrl` and `circlesConfig.circlesRpcUrl` to the staging URL,
    // warning the caller if they passed something else so misconfiguration
    // is visible instead of silently broken.
    const stagingRpc = SCORE_GROUPS_STAGING_RPC_URL;
    const rpcUrlMatches = isSameRpcUrl(config.rpcUrl, stagingRpc);
    const circlesRpcMatches = isSameRpcUrl(
      config.circlesConfig.circlesRpcUrl,
      stagingRpc
    );
    if (!rpcUrlMatches || !circlesRpcMatches) {
      console.warn(
        `[PermissionlessGroup] overriding rpcUrl(s) to ${stagingRpc} — ` +
        `the score-groups pathfinder + indexer only exist on staging. ` +
        `Caller passed rpcUrl=${config.rpcUrl}, ` +
        `circlesConfig.circlesRpcUrl=${config.circlesConfig.circlesRpcUrl}.`
      );
    }
    this.config = {
      ...config,
      rpcUrl: stagingRpc,
      circlesConfig: { ...config.circlesConfig, circlesRpcUrl: stagingRpc },
    };
    this.client = new ScoreGroupsClient(config.backendBaseUrl);
    this.hub = new HubV2Contract({ address: config.hubAddress, rpcUrl: this.config.rpcUrl });
    this.lift = new LiftERC20Contract({
      address: config.liftERC20Address,
      rpcUrl: this.config.rpcUrl,
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
   *      throw `proofStale` if they disagree
   *   3. emit tx: policy.snapshotIssuance()
   *   4. emit tx: Hub.personalMint()
   *   5. emit tx: Hub.groupMint(group, [avatar], [amount],
   *                             abi.encode(score, proof))
   *   6. emit tx: Hub.wrap(group, amount, CirclesType.Inflation)
   */
  async mint(params: MintParams): Promise<MintResult> {
    this.validateMintParams(params);

    const proof = await this.client.getProof(this.config.groupAddress, params.avatar);

    // Score 0 = avatar not in the SMT, ineligible for the group mint. Don't
    // fail the caller. Emit only
    // Hub.personalMint() and skip snapshot/groupMint/wrap entirely.
    if (proof.scoreRaw === '0') {
      return { txs: [this.hub.personalMint()], proof, amount: 0n };
    }

    const policy = await this.policy();
    const chainRoot = await policy.merkleRoots(this.config.groupAddress);
    if (!hexEq(chainRoot, proof.root)) {
      throw PermissionlessGroupError.proofStale(
        'policy.merkleRoots disagrees with backend proof root',
        { chainRoot, backendRoot: proof.root }
      );
    }

    return this.buildMintBatch(params, proof);
  }

  /**
   * Send the avatar's *own* personal CRC via `Hub.safeTransferFrom`, with
   * the avatar's score + Merkle proof encoded as the ERC1155 `data` field.
   *
   * The proof is fetched from the score-groups backend
   * (`GET /groups/{group}/proof/{avatar}`) and abi-encoded as
   * `(uint256 score, bytes proof)` — the exact format the score-gated mint
   * policy decodes when this CRC lands in a contract that runs the policy
   * inside `onERC1155Received`. Recipients that aren't policy-aware just
   * ignore the `data` (standard ERC1155 behavior).
   *
   * Single-tx batch: no snapshot/personalMint/wrap pre-steps — this is a
   * plain transfer with score-attestation data, NOT a mint flow. For
   * minting against the score group call `mint()` instead.
   *
   *  1. fetch (score, proof) from the score-groups backend
   *  2. throw if `scoreRaw === "0"` (avatar not eligible; the transfer
   *     would still execute but the recipient can't act on the proof)
   *  3. compare backend proof.root vs `policy.merkleRoots(group)` — throw
   *     `proofStale` on mismatch so callers know to refetch
   *  4. emit tx: Hub.safeTransferFrom(avatar, to, uint256(avatar), amount,
   *                                   abi.encode(score, proof))
   */
  async transferGCRCAndScore(
    params: TransferGCRCAndScoreParams
  ): Promise<TransferGCRCAndScoreResult> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput(
        'transferGCRCAndScore() requires `avatar`'
      );
    }
    if (!params.to) {
      throw PermissionlessGroupError.invalidInput(
        'transferGCRCAndScore() requires `to`'
      );
    }
    if (params.amount === undefined || params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput(
        'transferGCRCAndScore() requires `amount > 0`',
        { amount: params.amount?.toString() }
      );
    }

    const proof = await this.client.getProof(this.config.groupAddress, params.avatar);
    if (proof.scoreRaw === '0') {
      throw PermissionlessGroupError.notEligible(params.avatar, proof.scoreRaw);
    }

    // Match the proof root against the on-chain root — refetching usually
    // resolves transient mismatches (publisher cadence ~minutes).
    const policy = await this.policy();
    const chainRoot = await policy.merkleRoots(this.config.groupAddress);
    if (!hexEq(chainRoot, proof.root)) {
      throw PermissionlessGroupError.proofStale(
        'policy.merkleRoots disagrees with backend proof root',
        { chainRoot, backendRoot: proof.root }
      );
    }

    const score = BigInt(proof.scoreRaw);
    const data = encodePolicyData(score, proof.proof);
    const tokenId = BigInt(params.avatar); // ERC1155 id of avatar's own CRC
    const tx = this.hub.safeTransferFrom(
      params.avatar,
      params.to,
      tokenId,
      params.amount,
      data
    );

    return { txs: [tx], proof, amount: params.amount };
  }

  /**
   * Build the tx batch that migrates legacy GnosisGroup CRC held by `avatar`
   * into the destination ScoreGroup via the SinkWrapper at
   * `PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress`.
   *
   * Pathfinder → flow-matrix → tx batch. `params.amount` is forwarded
   * verbatim as the pathfinder `targetFlow`; omit it to request the
   * pathfinder's `MAX_FLOW` sentinel (everything the trust graph can route
   * in one shot). `params.maxEdges` caps the number of flow edges (forwarded
   * to the pathfinder's `maxTransfers`).
   *
   * Single attempt: if `findPath` returns nothing or `buildFlowMatrixTx`
   * throws, the error bubbles straight up. Submission is the caller's job —
   * the returned `txs` are meant to be sent atomically through a Safe runner.
   */
  async migration(params: MigrationParams): Promise<MigrationResult> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput('migration() requires `avatar`');
    }
    if (params.amount !== undefined && params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput(
        'migration() amount must be > 0 when supplied (omit it to use MAX_FLOW)',
        { amount: params.amount.toString() }
      );
    }
    if (params.maxEdges !== undefined && params.maxEdges <= 0) {
      throw PermissionlessGroupError.invalidInput(
        'migration() maxEdges must be > 0 when supplied',
        { maxEdges: params.maxEdges }
      );
    }

    const scoreGroup = PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress;
    const rpcUrl = this.config.circlesConfig.circlesRpcUrl;
    const pathfinder = new PathfinderMethods(new RpcClient(rpcUrl));

    const path = await pathfinder.findPath({
      from: params.avatar,
      to: PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      targetFlow: params.amount ?? MAX_FLOW,
      excludeFromTokens: [scoreGroup],
      toTokens: [scoreGroup],
      ...(params.fromTokens?.length ? { fromTokens: params.fromTokens } : {}),
      // `maxEdges` is forwarded straight to the pathfinder's `maxTransfers`,
      // which caps the number of flow edges it returns.
      ...(params.maxEdges !== undefined ? { maxTransfers: params.maxEdges } : {}),
      useWrappedBalances: true,
    });
    if (!path.transfers || path.transfers.length === 0) {
      throw PermissionlessGroupError.invalidInput(
        'pathfinder returned no transfers for the requested migration amount',
        { amount: params.amount?.toString() ?? 'max' }
      );
    }

    const builder = new TransferBuilder(this.config.circlesConfig);
    const txs = await builder.buildFlowMatrixTx(
      params.avatar,
      PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      path,
      {
        excludeFromTokens: [scoreGroup],
        toTokens: [scoreGroup],
        ...(params.fromTokens?.length ? { fromTokens: params.fromTokens } : {}),
        useWrappedBalances: true,
      }
    );
    return { txs: txs as TransactionRequest[], amount: path.maxFlow };
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
 * Loose URL match — ignores trailing slashes and case. Good enough for
 * detecting "did the caller hand us the staging RPC under a slightly
 * different spelling".
 */
function isSameRpcUrl(a: string, b: string): boolean {
  return a.replace(/\/+$/, '').toLowerCase() === b.replace(/\/+$/, '').toLowerCase();
}

function isZeroAddress(a: Address): boolean {
  return a.toLowerCase() === '0x0000000000000000000000000000000000000000';
}

function hexEq(a: Hex, b: Hex): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
