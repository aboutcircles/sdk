import {
  HubV2Contract,
  ScoreGatedMintPolicyContract,
  LiftERC20Contract,
  DemurrageCirclesContract,
  InflationaryCirclesContract,
} from '@aboutcircles/sdk-core';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import {
  getTokenInfoMapFromPath,
  replaceWrappedTokensWithAvatars,
} from '@aboutcircles/sdk-pathfinder';
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
  PathfindingResult,
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
  MigrationRawResult,
  MigrationCollateralReport,
  MigratableAmountResult,
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
   * Omit `params.amount` to migrate the maximum the trust graph + destination
   * policy will accept. In that case the SDK runs a two-stage probe: first
   * `findPath(MAX_FLOW)` to discover the headline number, then a second
   * `findPath(headline)` for the actual plan. The indirection is necessary
   * because the pathfinder over-commits intermediate balances when given
   * its `MAX_FLOW` sentinel — the headline plan usually reverts on-chain
   * with `ERC1155InsufficientBalance` — but is reliable for any concrete
   * target. Pass `amount` explicitly when you want a specific deposit
   * size; the probe is skipped.
   *
   * The pathfinder is the authority on what's *routable* through the trust
   * graph — but the destination policy enforces an additional *per-collateral*
   * cap (`policy.beforeMintPolicy`: `historicalSupply + minted − treasury`),
   * and the SinkWrapper only accepts group-CRC deposits via the canonical
   * `router → scoreGroup → sink` chain (any other path reverts with
   * `ERC1155InvalidReceiver(sinkWrapper)`).
   *
   * Pipeline:
   *   1. Pathfinder lookup (one query against `amount`, or two when in
   *      max-flow mode). Constraints: dest=SinkWrapper,
   *      `toTokens=[ScoreGroup]`, `excludeFromTokens=[ScoreGroup]`.
   *   2. Drop *sink-bypass branches* (edges to=sink with from≠scoreGroup),
   *      walking backwards to remove the predecessor edges that funded them
   *      so per-vertex netting stays consistent.
   *   3. Bucket every hop with `to == scoreRouter` by *resolved avatar* of
   *      `tokenOwner` (wrapper addresses resolved to their underlying CRC
   *      avatar). Sum is the amount of that collateral the path would deposit.
   *   4. Batch-fetch `leftToMintEffective` for each collateral via
   *      `POST /groups/mint-limits/batch` (groupUsers mode).
   *   5. If any branch exceeds its cap, uniformly scale the *entire* path
   *      down by `factor = min(cap[c] / pathAmount[c])`. Uniform scaling
   *      preserves the netted-flow invariant without rebuilding the DAG.
   *   6. Hand the (possibly scaled) path to `TransferBuilder.buildFlowMatrixTx`
   *      which handles unwraps, `operateFlowMatrix`, and re-wraps.
   *
   * Submission is the caller's job — the returned `txs` are meant to be sent
   * atomically through a Safe runner. Use `migratableAmount()` first when you
   * want to preview the migratable size without building the tx batch.
   */
  async migration(params: MigrationParams): Promise<MigrationResult> {
    const prep = await this._prepareMigrationPath(params);

    // Hand the cleaned + scaled path to the shared flow-matrix builder
    // (self-approval check, unwraps, `operateFlowMatrix`, optional re-wraps).
    const builder = new TransferBuilder(this.config.circlesConfig);
    const txs = await builder.buildFlowMatrixTx(
      params.avatar,
      PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      prep.scaledPath,
      {
        excludeFromTokens: [PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress],
        toTokens: [PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress],
        ...(params.fromTokens?.length ? { fromTokens: params.fromTokens } : {}),
        useWrappedBalances: true,
      }
    );

    return {
      txs: txs as TransactionRequest[],
      amount: prep.scaledPath.maxFlow,
      requestedAmount: prep.rawPath.maxFlow,
      probedMaxFlow: prep.probedMaxFlow,
      bypassPruned: prep.bypassPruned,
      collaterals: prep.collaterals,
    };
  }

  /**
   * Raw migration: pathfinder → flow-matrix → tx batch, with **no** SDK-side
   * pruning or retries. No bypass-branch removal, no per-collateral cap
   * scaling, no two-stage probe. `params.amount` is forwarded verbatim as
   * `targetFlow`; omit it to request the pathfinder's `MAX_FLOW` sentinel
   * (everything the trust graph can route in one shot — caveat that
   * MAX_FLOW plans are often over-committed and may revert on-chain).
   *
   * Single attempt: if `findPath` returns nothing or `buildFlowMatrixTx`
   * throws, the error bubbles straight up. Any retry policy is the
   * caller's responsibility.
   *
   * Use this when you want to inspect the pathfinder in isolation or you
   * already know the path is feasible. For production use cases call
   * `migration()` instead — it adds the pruning + buffering that keeps the
   * live tx from reverting under normal staging/prod conditions.
   */
  async migrationRaw(params: MigrationParams): Promise<MigrationRawResult> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput('migrationRaw() requires `avatar`');
    }
    if (params.amount !== undefined && params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput(
        'migrationRaw() amount must be > 0 when supplied (omit it to use MAX_FLOW)',
        { amount: params.amount.toString() }
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

  /**
   * Compute how much `avatar` could migrate right now without building or
   * submitting any transactions. Runs the same pathfinder probe + bypass /
   * cap pruning as `migration()`, then reports the resulting headline.
   *
   * Useful for UIs that want to show "you could migrate up to X CRC" before
   * the user commits — pair it with `migration()` to actually execute. The
   * numbers reflect chain/pathfinder state *at query time*; the real
   * `migration()` call re-queries, so the executed amount may differ
   * slightly (typically within the SDK's 10 bp pathfinder buffer).
   *
   * Same parameters as `migration()`; `amount` is honored as the pathfinder
   * target when supplied.
   */
  async migratableAmount(params: MigrationParams): Promise<MigratableAmountResult> {
    const prep = await this._prepareMigrationPath(params);
    return {
      amount: prep.scaledPath.maxFlow,
      probedMaxFlow: prep.probedMaxFlow ?? prep.rawPath.maxFlow,
      bypassPruned: prep.bypassPruned,
      collaterals: prep.collaterals,
    };
  }

  /**
   * Shared pipeline for `migration()` and `migratableAmount()`:
   *   - pathfinder lookup (with two-stage probe in max-flow mode)
   *   - sink-bypass branch pruning
   *   - per-collateral cap scaling
   *
   * Returns the scaled path (ready for `buildFlowMatrixTx`), the raw
   * post-pruning path (for `requestedAmount` reporting), and the diagnostic
   * fields surfaced by both public methods.
   */
  private async _prepareMigrationPath(params: MigrationParams): Promise<{
    rawPath: PathfindingResult;
    scaledPath: PathfindingResult;
    probedMaxFlow: bigint | null;
    bypassPruned: bigint;
    collaterals: MigrationCollateralReport[];
  }> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput('migration() requires `avatar`');
    }
    if (params.amount !== undefined && params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput(
        'migration() amount must be > 0 when supplied (omit it to migrate max)',
        { amount: params.amount.toString() }
      );
    }

    const sink = PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress.toLowerCase() as Address;
    const router = PERMISSIONLESS_GROUPS_MIGRATION.scoreRouterAddress.toLowerCase() as Address;
    const scoreGroup = PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress;

    const rpcUrl = this.config.circlesConfig.circlesRpcUrl;
    const pathfinder = new PathfinderMethods(new RpcClient(rpcUrl));

    const findPathArgs = {
      from: params.avatar,
      to: PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      excludeFromTokens: [scoreGroup],
      toTokens: [scoreGroup],
      ...(params.fromTokens?.length ? { fromTokens: params.fromTokens } : {}),
      useWrappedBalances: true,
    };

    // 1) Pathfinder lookup.
    //
    //    When `amount` is supplied we trust it and submit one query. When
    //    omitted we run a two-stage probe: the pathfinder over-commits
    //    intermediate balances when asked for its `MAX_FLOW` sentinel (it
    //    sums per-edge flows without enforcing that intermediates actually
    //    hold the routed token), so the MAX_FLOW plan itself often reverts
    //    on-chain with `ERC1155InsufficientBalance`. The reported headline
    //    `maxFlow` IS correct, though — re-querying the pathfinder with
    //    that exact concrete number produces a feasible plan, because the
    //    pathfinder is reliable for non-sentinel targets.
    let probedMaxFlow: bigint | null = null;
    let path;
    if (params.amount !== undefined) {
      path = await pathfinder.findPath({ ...findPathArgs, targetFlow: params.amount });
    } else {
      const probe = await pathfinder.findPath({ ...findPathArgs, targetFlow: MAX_FLOW });
      probedMaxFlow = probe.maxFlow;
      if (probedMaxFlow === 0n) {
        throw PermissionlessGroupError.invalidInput(
          'pathfinder max-flow probe returned 0 — nothing migratable',
          { probedMaxFlow: probedMaxFlow.toString() }
        );
      }
      // 10 basis points (0.1%) sub-headline buffer. Asking the pathfinder
      // for the *exact* MAX_FLOW headline gives it zero slack — any block-
      // level state change between probe and build flips the plan from
      // feasible to over-committed. 1 bp was empirically too tight under
      // staging-indexer drift; 10 bp absorbs the typical block-level
      // perturbation without meaningfully reducing the migration size.
      const feasibleTarget = (probedMaxFlow * 9_990n) / 10_000n;
      path = await pathfinder.findPath({
        ...findPathArgs,
        targetFlow: feasibleTarget > 0n ? feasibleTarget : probedMaxFlow,
      });
    }

    if (!path.transfers || path.transfers.length === 0) {
      throw PermissionlessGroupError.invalidInput(
        'pathfinder returned no transfers for the requested migration amount',
        { amount: params.amount?.toString() ?? 'max' }
      );
    }

    // 2) Resolve wrapper addresses (if any) so collateral bucketing keys on
    //    the underlying avatar — that's what the policy/treasury caps are
    //    indexed by (`tokenId = uint256(uint160(avatar))`).
    const tokenInfoMap = await getTokenInfoMapFromPath(params.avatar, rpcUrl, path);
    const resolvedPathRaw = replaceWrappedTokensWithAvatars(path, tokenInfoMap);

    // 2a) Prune *sink-bypass branches*. The SinkWrapper's `onERC1155Received`
    //     calls `Hub.wrap(group=scoreGroup, ...)` which only succeeds when the
    //     received token id maps to a registered group. The pathfinder may
    //     produce edges where an arbitrary intermediate vertex (one that
    //     happens to hold pre-minted scoreGroup CRC) sends the group token
    //     straight to the sink, bypassing `router → scoreGroup → sink`. Those
    //     edges revert on-chain (`ERC1155InvalidReceiver(sinkWrapper)`),
    //     because the `wrap` step then transfers the group token to its
    //     inflationary wrapper using `safeTransferFrom(sinkWrapper, …)` —
    //     which works at the wrap-call level but the receipt magic from the
    //     nested batch acceptance trips up the original `operateFlowMatrix`
    //     call. We just drop these branches plus their funding predecessors.
    const sinkBypassResult = pruneSinkBypassBranches(
      path,
      resolvedPathRaw,
      sink,
      scoreGroup.toLowerCase() as Address
    );
    const cleanedPath = sinkBypassResult.path;
    const resolvedPath = replaceWrappedTokensWithAvatars(cleanedPath, tokenInfoMap);

    if (!cleanedPath.transfers.length) {
      throw PermissionlessGroupError.invalidInput(
        'after pruning sink-bypass branches, no transfers remain',
        { amount: params.amount?.toString() ?? 'max' }
      );
    }

    // 3) Sum per-collateral deposits into the destination router.
    const pathPerCollateral = bucketPerCollateralAtRouter(resolvedPath, router);
    const collateralAvatars = [...pathPerCollateral.keys()] as Address[];

    // 4) Fetch caps in one (or a few, when > 100) batch calls.
    const capCells = collateralAvatars.length
      ? await this.client.getMintLimitsBatch(scoreGroup, collateralAvatars)
      : [];
    const capByCollateral = new Map<string, bigint | null>();
    for (const cell of capCells) {
      const key = cell.userAddress.toLowerCase();
      capByCollateral.set(
        key,
        cell.ok ? BigInt(cell.migration.leftToMintEffective) : null
      );
    }

    // 5) Compute the binding scaling factor. The path's value field is a
    //    plain bigint, so we apply the scale via numerator/denominator in
    //    `scalePathValues` to avoid float drift.
    let scaleNum = 1n;
    let scaleDen = 1n;
    for (const collateral of collateralAvatars) {
      const key = collateral.toLowerCase();
      const pathAmount = pathPerCollateral.get(key)!;
      const cap = capByCollateral.get(key);
      if (cap === null || cap === undefined) continue; // backend cell errored — skip
      if (pathAmount > cap) {
        // factor = cap / pathAmount. Compose with running factor by
        // multiplying numerators/denominators.
        const newNum = scaleNum * cap;
        const newDen = scaleDen * pathAmount;
        // keep the most-binding ratio (smallest factor)
        if (newNum * scaleDen < scaleNum * newDen) {
          scaleNum = newNum;
          scaleDen = newDen;
        }
      }
    }

    const needsScaling = scaleNum !== scaleDen;
    const scaledPath = needsScaling
      ? scalePathValues(cleanedPath, sink, scaleNum, scaleDen)
      : cleanedPath;

    const finalPerCollateral = needsScaling
      ? bucketPerCollateralAtRouter(
          replaceWrappedTokensWithAvatars(scaledPath, tokenInfoMap),
          router
        )
      : pathPerCollateral;

    const collaterals: MigrationCollateralReport[] = collateralAvatars.map((c) => {
      const key = c.toLowerCase();
      const pathAmount = pathPerCollateral.get(key)!;
      const cap = capByCollateral.get(key);
      const finalAmount = finalPerCollateral.get(key) ?? 0n;
      return {
        collateral: c,
        pathAmount,
        cap: cap ?? null,
        finalAmount,
        capped: cap !== null && cap !== undefined && pathAmount > cap,
      };
    });

    return {
      rawPath: path,
      scaledPath,
      probedMaxFlow,
      bypassPruned: sinkBypassResult.prunedAmount,
      collaterals,
    };
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

/**
 * Sum per-collateral deposits into `router`. Assumes `path` has already been
 * resolved through `replaceWrappedTokensWithAvatars` so `tokenOwner` is an
 * avatar address (not a wrapper).
 */
function bucketPerCollateralAtRouter(
  path: PathfindingResult,
  router: Address
): Map<string, bigint> {
  const sums = new Map<string, bigint>();
  for (const t of path.transfers) {
    if (t.to.toLowerCase() !== router.toLowerCase()) continue;
    const key = t.tokenOwner.toLowerCase();
    sums.set(key, (sums.get(key) ?? 0n) + BigInt(t.value));
  }
  return sums;
}

/**
 * Drop edges that deposit the group token into the SinkWrapper from a source
 * other than the score group itself, plus the predecessor edges that funded
 * those bypass vertices. This keeps `_verifyFlowMatrix`'s per-vertex netting
 * intact (the bypass node receives X from Safe and forwards X to sink — drop
 * both legs together) without re-running the pathfinder.
 *
 * The predecessor walk is bounded: we only follow inflow edges into the
 * bypass vertex on the *current* pass and stop once total dropped inflow
 * matches the dropped outflow. Multi-hop fan-in is supported, but cycles
 * are not (the pathfinder produces a DAG).
 *
 * `path` is the original wrapper-keyed path (passed straight to
 * `TransferBuilder.buildFlowMatrixTx` afterwards, so unwrap/re-wrap math
 * stays consistent). `resolvedPath` is the same path with wrappers replaced
 * by their underlying avatars — we use it to identify which edges deposit
 * the *group* token id at the sink.
 */
function pruneSinkBypassBranches(
  path: PathfindingResult,
  resolvedPath: PathfindingResult,
  sink: Address,
  scoreGroup: Address
): { path: PathfindingResult; prunedAmount: bigint } {
  const sinkLc = sink.toLowerCase();
  const groupLc = scoreGroup.toLowerCase();

  // Mark indices that are bypass-edges to start.
  const drop = new Set<number>();
  let prunedAmount = 0n;

  // Find bypass *sink* edges in the resolved path: to == sink AND tokenOwner
  // is the score group AND from != score group.
  const seedVertices: Array<{ vertex: string; remaining: bigint }> = [];
  for (let i = 0; i < resolvedPath.transfers.length; i++) {
    const t = resolvedPath.transfers[i];
    if (
      t.to.toLowerCase() === sinkLc &&
      t.tokenOwner.toLowerCase() === groupLc &&
      t.from.toLowerCase() !== groupLc
    ) {
      drop.add(i);
      prunedAmount += BigInt(t.value);
      seedVertices.push({ vertex: t.from.toLowerCase(), remaining: BigInt(t.value) });
    }
  }

  if (seedVertices.length === 0) {
    return { path, prunedAmount: 0n };
  }

  // Walk backwards: each bypass vertex V0 had its outflow X dropped, so V0's
  // net is now `+X` (received more than sent). To restore `V0` net = 0, drop
  // X-worth of V0's inflow edges. Each predecessor edge `W → V0` we drop
  // moves W from net=0 to net=+X (W's outflow dropped). Continue until W is
  // the original source (Safe) — at which point reduced outflow is fine,
  // since the maxFlow is meant to drop by the bypassed amount.
  //
  // _verifyFlowMatrix nets per-vertex (not per-tokenOwner), so dropping an
  // inflow edge of a different tokenOwner than the outflow that triggered it
  // is still consistent.
  const queue: Array<{ vertex: string; remaining: bigint }> = [...seedVertices];
  while (queue.length) {
    const { vertex, remaining } = queue.shift()!;
    let stillNeeded = remaining;
    for (let i = 0; i < resolvedPath.transfers.length; i++) {
      if (stillNeeded === 0n) break;
      if (drop.has(i)) continue;
      const t = resolvedPath.transfers[i];
      if (t.to.toLowerCase() !== vertex) continue;
      const value = BigInt(t.value);
      // The pathfinder's bypass branches are single-edge funding chains in
      // practice (verified against the staging path). Whole-edge drops keep
      // values bigint-exact — splitting edges would require recomputing
      // coordinates downstream. If we ever hit `value > stillNeeded`, the
      // assumption no longer holds and we bail out loudly.
      if (value > stillNeeded) {
        throw new Error(
          `pruneSinkBypassBranches: predecessor edge ${i} (value=${value}) ` +
            `exceeds bypassed outflow ${stillNeeded} for vertex ${vertex}. ` +
            `Path topology not supported — re-run pathfinder with a different ` +
            `excludeFromTokens / fromTokens combination.`
        );
      }
      drop.add(i);
      stillNeeded -= value;
      queue.push({ vertex: t.from.toLowerCase(), remaining: value });
    }
  }

  // Apply the drop set to the *original* (wrapper-keyed) path so wrapped
  // edge semantics survive.
  const kept = path.transfers.filter((_, i) => !drop.has(i));
  let maxFlow = 0n;
  for (const t of kept) {
    if (t.to.toLowerCase() === sinkLc) maxFlow += BigInt(t.value);
  }
  return { path: { maxFlow, transfers: kept }, prunedAmount };
}

/**
 * Multiply every edge value in `path` by `num/den`. Drops edges whose scaled
 * value rounds to 0 (sub-unit flows) and recomputes `maxFlow` from the
 * incoming-to-sink sum after scaling. This preserves the netted-flow
 * invariant because we scale uniformly — every per-vertex inflow/outflow
 * shrinks by the same ratio.
 */
function scalePathValues(
  path: PathfindingResult,
  sink: Address,
  num: bigint,
  den: bigint
): PathfindingResult {
  if (den === 0n) throw new Error('scalePathValues: denominator is zero');
  const transfers = [];
  let incomingToSink = 0n;
  for (const t of path.transfers) {
    const scaled = (BigInt(t.value) * num) / den;
    if (scaled === 0n) continue;
    transfers.push({ ...t, value: scaled });
    if (t.to.toLowerCase() === sink.toLowerCase()) incomingToSink += scaled;
  }
  return { maxFlow: incomingToSink, transfers };
}
