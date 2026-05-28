import {
  HubV2Contract,
  ScoreGatedMintPolicyContract,
  LiftERC20Contract,
  DemurrageCirclesContract,
  InflationaryCirclesContract,
} from '@aboutcircles/sdk-core';
import {
  ScoreGroupContractMinimal,
  MerkleTreeRegistryContractMinimal,
} from '@aboutcircles/sdk-core/minimal';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import { PathfinderMethods, RpcClient } from '@aboutcircles/sdk-rpc';
import { encodeAbiParameters } from '@aboutcircles/sdk-utils/abi';
import { CirclesConverter } from '@aboutcircles/sdk-utils/circlesConverter';
import {
  PERMISSIONLESS_GROUPS_STAGING,
  PERMISSIONLESS_GROUPS_MIGRATION,
  SCORE_GROUPS_STAGING_RPC_URL,
  isZeroAddress,
  hexEq,
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
  TransferGroupCrcParams,
  TransferGroupCrcResult,
  ProofResponse,
  BalanceResult,
  GroupCrcBalance,
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
   * Verify a backend score proof on-chain, used as a mint/transfer pre-flight.
   *
   * Defers entirely to the MerkleTreeRegistry's `verifyWithGracePeriod`: one
   * view call that resolves the manager's current/previous root, applies the
   * grace window (~2 blocks), and checks the full proof — so the SDK never has
   * to mirror the registry's freshness rule or compare roots client-side.
   *
   * The OffchainScoreBasedMintPolicy keeps roots in the registry keyed by the
   * group's merkle-tree manager, so we resolve that first via the policy.
   *
   * @param avatar - The proof subject (leaf key)
   * @param proof - The backend `/proof` response (provides `value` + `proof`)
   * @returns Whether the proof verifies against a currently-valid root
   */
  private async verifyProofOnChain(avatar: Address, proof: ProofResponse): Promise<boolean> {
    // The group exposes its own merkle-tree manager (wired at deploy), and the
    // registry address is a known constant — so no Hub/policy lookups are
    // needed. One read (the manager) + the verify call.
    const scoreGroup = new ScoreGroupContractMinimal({
      address: this.config.groupAddress,
      rpcUrl: this.config.rpcUrl,
    });
    const manager = await scoreGroup.merkleTreeManager();
    const registry = new MerkleTreeRegistryContractMinimal({
      address: PERMISSIONLESS_GROUPS_STAGING.merkleTreeRegistryAddress,
      rpcUrl: this.config.rpcUrl,
    });
    return registry.verifyWithGracePeriod(manager, avatar, proof.value, proof.proof);
  }

  /**
   * Read the avatar's holdings of this group's token broken down by form:
   * ERC1155 group-CRC (unwrapped), ERC20 demurrage wrapper, and ERC20
   * inflationary wrapper, plus the resolved wrapper addresses. Wrappers that
   * haven't been deployed yet return 0n with `address = 0x0…0` — that's the
   * chain state, not an error.
   *
   * For the headline summable total (incl. migratable), use {@link balance}.
   * Four `eth_call`s total, no transactions.
   */
  async balanceBreakdown(avatar: Address): Promise<BalanceResult> {
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

    if (!(await this.verifyProofOnChain(params.avatar, proof))) {
      throw PermissionlessGroupError.proofStale(
        'backend proof failed on-chain verification (stale root or invalid proof)',
        { backendRoot: proof.root }
      );
    }

    return this.buildMintBatch(params, proof);
  }

  /**
   * Transfer the **group's** CRC (token id `uint256(groupAddress)`) from
   * `avatar` to `to`.
   *
   * `amount` is given in **demurraged** atto-CRC (today's value) — the unit
   * the caller reasons about. The delivery format depends on the recipient:
   *
   *   - **`to` is a registered Circles organization** → organizations hold the
   *     ERC1155, not the ERC20 wrapper. Unwrap the inflationary ERC20 back to
   *     ERC1155, then `Hub.safeTransferFrom` the *demurraged* amount with the
   *     avatar's **score + Merkle proof** attached as the ERC1155 `data`
   *     (`abi.encode(uint256 score, bytes proof)`) — the format the
   *     score-gated policy decodes inside `onERC1155Received`:
   *       `[ inflationaryWrapper.unwrap(inflationaryAmount),
   *          Hub.safeTransferFrom(avatar, to, groupTokenId, demurragedAmount,
   *                               abi.encode(score, proof)) ]`
   *     The proof is fetched from the score-groups backend and validated
   *     against `policy.merkleRoots(group)` (throws `notEligible` for score 0,
   *     `proofStale` on root mismatch).
   *
   *   - **otherwise** → send the inflationary ERC20 directly, no proof data
   *     (ERC20 transfers carry none):
   *       `[ inflationaryWrapper.transfer(to, inflationaryAmount) ]`
   *
   * The demurraged→inflationary conversion uses `CirclesConverter`
   * (bit-identical with the wrapper's on-chain conversion up to sub-wei
   * truncation). Submission is the caller's job — the returned `txs` (1 for
   * ERC20, 2 for the org path) must be sent atomically.
   */
  async transferGroupCrc(
    params: TransferGroupCrcParams
  ): Promise<TransferGroupCrcResult> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput('transferGroupCrc() requires `avatar`');
    }
    if (!params.to) {
      throw PermissionlessGroupError.invalidInput('transferGroupCrc() requires `to`');
    }
    if (params.amount === undefined || params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput(
        'transferGroupCrc() requires `amount > 0`',
        { amount: params.amount?.toString() }
      );
    }

    const group = this.config.groupAddress;
    const demurragedAmount = params.amount;

    // 1) Read the avatar's group CRC across all three forms.
    const bal = await this.balanceBreakdown(params.avatar);
    if (isZeroAddress(bal.inflationaryWrapperAddress)) {
      throw PermissionlessGroupError.invalidInput(
        'group has no inflationary ERC20 wrapper deployed — nothing to transfer',
        { group }
      );
    }
    const wrapper = new InflationaryCirclesContract({
      address: bal.inflationaryWrapperAddress,
      rpcUrl: this.config.rpcUrl,
    });

    // 2) Sum availability in *demurraged* terms (the inflationary balance is
    //    in inflationary units, so convert it down to compare apples to apples).
    const inflAsDemurrage = CirclesConverter.attoStaticCirclesToAttoCircles(
      bal.inflationaryWrapper
    );
    const totalDemurraged = bal.erc1155 + bal.demurrageWrapper + inflAsDemurrage;
    if (totalDemurraged < demurragedAmount) {
      throw PermissionlessGroupError.invalidInput(
        'insufficient group CRC balance for the requested transfer',
        {
          requested: demurragedAmount.toString(),
          available: totalDemurraged.toString(),
          erc1155: bal.erc1155.toString(),
          demurrageErc20: bal.demurrageWrapper.toString(),
          inflationaryErc20Demurraged: inflAsDemurrage.toString(),
        }
      );
    }

    const isOrg = await this.hub.isOrganization(params.to);

    // 3) Org recipients hold ERC1155, not the ERC20 wrapper → deliver ERC1155.
    //    Use the avatar's existing ERC1155 first; only unwrap ERC20 (demurrage
    //    first, then inflationary) to cover any shortfall — no wrap→unwrap
    //    round-trip. Then `Hub.safeTransferFrom` the demurraged amount; the
    //    avatar's score proof is attached as `data` only when `includeProof`
    //    is set (default: false → empty `data`, no backend fetch).
    if (isOrg) {
      const includeProof = params.includeProof ?? false;

      // Fetch + validate the score proof only when we're attaching it.
      let data: Hex = '0x';
      if (includeProof) {
        const proof = await this.client.getProof(group, params.avatar);
        if (proof.scoreRaw === '0') {
          throw PermissionlessGroupError.notEligible(params.avatar, proof.scoreRaw);
        }
        if (!(await this.verifyProofOnChain(params.avatar, proof))) {
          throw PermissionlessGroupError.proofStale(
            'backend proof failed on-chain verification (stale root or invalid proof)',
            { backendRoot: proof.root }
          );
        }
        data = encodePolicyData(BigInt(proof.scoreRaw), proof.proof);
      }

      const txs: TransactionRequest[] = [];
      // shortfall of ERC1155 to cover the demurraged amount.
      let need = demurragedAmount > bal.erc1155 ? demurragedAmount - bal.erc1155 : 0n;
      // cover from the demurrage wrapper (1:1 demurraged units).
      if (need > 0n && bal.demurrageWrapper > 0n) {
        const take = need < bal.demurrageWrapper ? need : bal.demurrageWrapper;
        const demurrageWrapper = new DemurrageCirclesContract({
          address: bal.demurrageWrapperAddress,
          rpcUrl: this.config.rpcUrl,
        });
        txs.push(demurrageWrapper.unwrap(take));
        need -= take;
      }
      // cover the rest from the inflationary wrapper (convert the demurraged
      // shortfall to inflationary for the unwrap call).
      if (need > 0n) {
        const inflToUnwrap = CirclesConverter.attoCirclesToAttoStaticCircles(need);
        txs.push(wrapper.unwrap(inflToUnwrap));
      }

      const groupTokenId = await this.hub.toTokenId(group);
      txs.push(
        this.hub.safeTransferFrom(
          params.avatar,
          params.to,
          groupTokenId,
          demurragedAmount,
          data
        )
      );
      return { txs, mode: 'erc1155-after-unwrap' };
    }

    // 4) Non-org recipients → deliver inflationary ERC20. Consolidate the
    //    avatar's other forms into the inflationary wrapper first:
    //    demurrage ERC20 → unwrap → ERC1155, then all ERC1155 → wrap inflationary.
    const consolidation: TransactionRequest[] = [];
    if (bal.demurrageWrapper > 0n) {
      const demurrageWrapper = new DemurrageCirclesContract({
        address: bal.demurrageWrapperAddress,
        rpcUrl: this.config.rpcUrl,
      });
      consolidation.push(demurrageWrapper.unwrap(bal.demurrageWrapper));
    }
    const erc1155ToWrap = bal.erc1155 + bal.demurrageWrapper;
    if (erc1155ToWrap > 0n) {
      consolidation.push(this.hub.wrap(group, erc1155ToWrap, CirclesType.Inflation));
    }

    // delivery amount: demurraged → inflationary (64.64, bit-identical with the
    // wrapper's on-chain conversion up to sub-wei truncation).
    const inflationaryAmount =
      CirclesConverter.attoCirclesToAttoStaticCircles(demurragedAmount);

    return {
      txs: [...consolidation, wrapper.transfer(params.to, inflationaryAmount)],
      mode: 'erc20-inflationary',
    };
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
    const path = await this.migrationPath(params);

    const scoreGroup = PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress;
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
   * Preview how much `avatar` could migrate right now — the same pathfinder
   * calculation as {@link migration} (identical params, same
   * `toTokens=[scoreGroup]` / `excludeFromTokens=[scoreGroup]` constraints and
   * `maxEdges` cap), but it stops before building the tx batch.
   *
   * Returns the migratable atto-CRC (`0n` when nothing is migratable). The
   * number reflects chain + pathfinder state at query time; `migration()`
   * re-queries, so the executed amount may differ slightly if the chain moved.
   */
  async migratableAmount(params: MigrationParams): Promise<bigint> {
    const path = await this.migrationPath(params);
    return path.maxFlow;
  }

  /**
   * The avatar's full reachable group CRC balance: its current holdings across
   * all three forms (ERC1155, demurrage ERC20, inflationary ERC20) PLUS the
   * amount still migratable from legacy CRC ({@link migratableAmount} with
   * `maxEdges: 100`). Everything is normalized to **demurraged** atto-CRC so
   * the figures are summable.
   *
   * Reads `balanceBreakdown(avatar)` and runs the migration pathfinder probe
   * in parallel. "Nothing migratable" (no path) counts as `0`, not an error.
   * For the raw per-form breakdown + wrapper addresses, use
   * {@link balanceBreakdown}.
   */
  async balance(avatar: Address): Promise<GroupCrcBalance> {
    const [bal, migratable] = await Promise.all([
      this.balanceBreakdown(avatar),
      this.migratableAmount({ avatar, maxEdges: 100 }).catch(() => 0n),
    ]);

    // inflationary balance is in inflationary units — convert down to demurraged.
    const inflationaryErc20 = CirclesConverter.attoStaticCirclesToAttoCircles(
      bal.inflationaryWrapper
    );
    const heldTotal = bal.erc1155 + bal.demurrageWrapper + inflationaryErc20;

    return {
      erc1155: bal.erc1155,
      demurrageErc20: bal.demurrageWrapper,
      inflationaryErc20,
      heldTotal,
      migratable,
      total: heldTotal + migratable,
    };
  }

  /**
   * Shared pathfinder lookup behind {@link migration} and
   * {@link migratableAmount}: routes `avatar`'s CRC into the SinkWrapper with
   * the migration constraints (destination = score group only, never sourcing
   * the score group token, optional edge cap). Validates params and throws if
   * no path is found.
   */
  private async migrationPath(params: MigrationParams): Promise<PathfindingResult> {
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
      // The migration must arrive at the sink as the ScoreGroup's CRC.
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
    return path;
  }

  /**
   * `Hub.groupMint` requires the group to trust the collateral avatar. The
   * ScoreGroup's `trust(address)` is permissionless — anyone may call it to make
   * the group trust a Hub human (and a self-call also clears a prior opt-out).
   * So when the group doesn't already trust the avatar, we prepend a
   * `group.trust(avatar)` tx to the batch; otherwise nothing is added.
   *
   * Scoped to the known ScoreGroup deployment: only that contract exposes the
   * permissionless `trust(address)`. For any other configured group we add
   * nothing (an arbitrary group may not expose this function, and onboarding is
   * its own concern).
   *
   * @param avatar - The collateral avatar to be trusted by the group
   * @returns `[group.trust(avatar)]` when applicable and not yet trusted, else `[]`
   */
  private async buildGroupTrustTxIfNeeded(avatar: Address): Promise<TransactionRequest[]> {
    const group = this.config.groupAddress;
    if (!hexEq(group, PERMISSIONLESS_GROUPS_STAGING.groupAddress)) return [];
    if (await this.hub.isTrusted(group, avatar)) return [];
    const scoreGroup = new ScoreGroupContractMinimal({ address: group, rpcUrl: this.config.rpcUrl });
    return [scoreGroup.trust(avatar)];
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
      // Step 0: group.trust(avatar) — only when the group doesn't already trust
      // the collateral avatar (groupMint reverts otherwise). Permissionless.
      ...(await this.buildGroupTrustTxIfNeeded(params.avatar)),
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
