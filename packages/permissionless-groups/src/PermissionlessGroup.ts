import {
  HubV2Contract,
  ScoreGatedMintPolicyContract,
  LiftERC20Contract,
  DemurrageCirclesContract,
  InflationaryCirclesContract,
} from "@aboutcircles/sdk-core";
import {
  ScoreGroupContractMinimal,
  MerkleTreeRegistryContractMinimal,
} from "@aboutcircles/sdk-core/minimal";
import { TransferBuilder } from "@aboutcircles/sdk-transfers";
import { PathfinderMethods, RpcClient, CirclesRpc } from "@aboutcircles/sdk-rpc";
import { encodeAbiParameters } from "@aboutcircles/sdk-utils/abi";
import { bytesToHex } from "@aboutcircles/sdk-utils/bytes";
import { CirclesConverter } from "@aboutcircles/sdk-utils/circlesConverter";
import {
  PERMISSIONLESS_GROUPS_STAGING,
  PERMISSIONLESS_GROUPS_MIGRATION,
  isZeroAddress,
  hexEq,
} from "@aboutcircles/sdk-utils";
import { MAX_FLOW } from "@aboutcircles/sdk-utils/constants";
import { CirclesType } from "@aboutcircles/sdk-types";
import type {
  Address,
  Hex,
  PathfindingResult,
  TransferStep,
  TokenBalance,
  TransactionRequest,
} from "@aboutcircles/sdk-types";

import { ScoreGroupsClient } from "./ScoreGroupsClient.js";
import { PermissionlessGroupError } from "./errors.js";
import type {
  PermissionlessGroupConfig,
  MintParams,
  MintResult,
  MigrationParams,
  MigrationResult,
  MigrationAttempt,
  MigrationAttemptLog,
  MigrationRetryOptions,
  MigrationRetryResult,
  TransferGroupCrcParams,
  TransferGroupCrcResult,
  ProofResponse,
  BalanceResult,
  GroupCrcBalance,
  PersonalTokenBalance,
} from "./types.js";

/** Score scale used by the policy: max score == 100. */
const MAX_SCORE = 100n;

/**
 * Clamp a raw score to the policy's 0–100 scale. The backend may report a raw
 * value above 100; the policy treats anything at or above the ceiling as the
 * maximum, so we recognise it as {@link MAX_SCORE} rather than letting it
 * inflate the mintable amount.
 */
const clampScore = (raw: bigint): bigint => (raw > MAX_SCORE ? MAX_SCORE : raw);

/** `a - b`, floored at 0 — never report a negative transferable balance. */
const clampSub = (a: bigint, b: bigint): bigint => (a > b ? a - b : 0n);

/**
 * Default {@link MigrationRetryOptions.isRetryable}: a thrown `submit` error is
 * retryable (a stale-route revert worth re-querying) UNLESS it's a user
 * rejection/cancellation, or it isn't an `Error` at all (e.g. a programmer error
 * in the callback) — those are fatal and rethrown rather than re-prompting the
 * user with a smaller migration.
 */
function defaultIsRetryableSubmitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const m = error.message.toLowerCase();
  const userCancelled =
    m.includes("user rejected") ||
    m.includes("user denied") ||
    m.includes("rejected the request") ||
    m.includes("request rejected") ||
    m.includes("user cancel");
  return !userCancelled;
}

/**
 * Default number of flow edges (`maxTransfers`) we ask the pathfinder for in
 * every migration probe. Migration routes can fan out across many hops, so we
 * always request a generous cap unless the caller overrides it via `maxEdges`.
 */
const DEFAULT_MAX_EDGES = 40;

/**
 * Below this migratable amount we treat the legacy CRC as dust and skip the
 * migration entirely: 0.1 CRC (in atto-CRC). Routing a few micro-CRC through a
 * multi-edge `operateFlowMatrix` costs far more gas than the dust is worth and
 * only bloats the mint batch, so `migration()` returns an empty batch and
 * `migratableAmount()` reports `0n` under this floor. Override per-call via
 * {@link MigrationParams.dustThreshold} (pass `0n` to migrate any amount).
 */
const DEFAULT_MIGRATION_DUST_THRESHOLD = 100_000_000_000_000_000n; // 0.1 CRC

/**
 * Extra inflationary atto-CRC unwrapped on top of the exact converted amount
 * in {@link PermissionlessGroup.transferGroupCrc}. The wrapper's on-chain
 * inflationary→demurraged conversion may round a few wei differently than
 * `CirclesConverter`, so we over-unwrap by this margin; the excess stays in
 * the avatar's own ERC1155 balance.
 */
const UNWRAP_ROUNDING_BUFFER = 1_000n;

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
    // Use the caller-supplied RPC as-is. The pathfinder (`circlesV2_findPath`)
    // is served by the main Circles RPC (`circlesConfig.circlesRpcUrl`), so the
    // SDK never pins a specific pathfinder endpoint — it flows from config.
    this.config = config;
    this.client = new ScoreGroupsClient(config.backendBaseUrl);
    this.hub = new HubV2Contract({
      address: config.hubAddress,
      rpcUrl: this.config.rpcUrl,
    });
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
        },
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
  private async verifyProofOnChain(
    avatar: Address,
    proof: ProofResponse,
  ): Promise<boolean> {
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
    return registry.verifyWithGracePeriod(
      manager,
      avatar,
      proof.value,
      proof.proof,
    );
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

    const proof = await this.client.getProof(
      this.config.groupAddress,
      params.avatar,
    );

    // Score 0 = avatar not in the SMT, ineligible for the group mint. Don't
    // fail the caller. Emit only
    // Hub.personalMint() and skip snapshot/groupMint/wrap entirely.
    if (proof.scoreRaw === "0") {
      return { txs: [this.hub.personalMint()], proof, amount: 0n };
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
   *     ERC1155, then `Hub.safeTransferFrom` the *demurraged* amount, optionally
   *     attaching bytes to the ERC1155 `data` slot so the recipient's
   *     `onERC1155Received` hook can act on it:
   *       `[ inflationaryWrapper.unwrap(inflationaryAmount),
   *          Hub.safeTransferFrom(avatar, to, groupTokenId, demurragedAmount,
   *                               data) ]`
   *     `data` is, in priority order: caller-supplied `params.txData` (attached
   *     verbatim); else, when `params.includeProof` is set, the avatar's
   *     **score + Merkle proof** as `abi.encode(uint256 score, bytes proof)`
   *     (the format the score-gated policy decodes) — fetched from the
   *     score-groups backend and validated against `policy.merkleRoots(group)`
   *     (throws `notEligible` for score 0, `proofStale` on root mismatch); else
   *     empty. `data` and `includeProof` are mutually exclusive.
   *
   *   - **otherwise** → send the inflationary ERC20. When `params.txData` is
   *     set, a zero-value `Hub.safeTransferFrom(avatar, to, groupTokenId, 0,
   *     txData)` is appended in the same batch so the indexer can store the
   *     annotation (ERC20 has no `data` slot):
   *       `[ inflationaryWrapper.transfer(to, inflationaryAmount) ]`
   *       or with annotation:
   *       `[ inflationaryWrapper.transfer(to, inflationaryAmount),
   *          Hub.safeTransferFrom(avatar, to, groupTokenId, 0, txData) ]`
   *
   * The demurraged→inflationary conversion uses `CirclesConverter`
   * (bit-identical with the wrapper's on-chain conversion up to sub-wei
   * truncation). Submission is the caller's job — the returned `txs` (1–2 for
   * ERC20, 2–3 for the org path) must be sent atomically.
   */
  async transferGroupCrc(
    params: TransferGroupCrcParams,
  ): Promise<TransferGroupCrcResult> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput(
        "transferGroupCrc() requires `avatar`",
      );
    }
    if (!params.to) {
      throw PermissionlessGroupError.invalidInput(
        "transferGroupCrc() requires `to`",
      );
    }
    if (params.amount === undefined || params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput(
        "transferGroupCrc() requires `amount > 0`",
        { amount: params.amount?.toString() },
      );
    }

    const group = this.config.groupAddress;
    const demurragedAmount = params.amount;

    // 1) Read the avatar's group CRC across all three forms.
    const bal = await this.balanceBreakdown(params.avatar);
    if (isZeroAddress(bal.inflationaryWrapperAddress)) {
      throw PermissionlessGroupError.invalidInput(
        "group has no inflationary ERC20 wrapper deployed — nothing to transfer",
        { group },
      );
    }
    const wrapper = new InflationaryCirclesContract({
      address: bal.inflationaryWrapperAddress,
      rpcUrl: this.config.rpcUrl,
    });

    // 2) Sum availability in *demurraged* terms (the inflationary balance is
    //    in inflationary units, so convert it down to compare apples to apples).
    const inflAsDemurrage = CirclesConverter.attoStaticCirclesToAttoCircles(
      bal.inflationaryWrapper,
    );
    const totalDemurraged =
      bal.erc1155 + bal.demurrageWrapper + inflAsDemurrage;
    if (totalDemurraged < demurragedAmount) {
      throw PermissionlessGroupError.invalidInput(
        "insufficient group CRC balance for the requested transfer",
        {
          requested: demurragedAmount.toString(),
          available: totalDemurraged.toString(),
          erc1155: bal.erc1155.toString(),
          demurrageErc20: bal.demurrageWrapper.toString(),
          inflationaryErc20Demurraged: inflAsDemurrage.toString(),
        },
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
      const customData = params.txData;
      if (includeProof && customData !== undefined) {
        throw PermissionlessGroupError.invalidInput(
          "transferGroupCrc() accepts at most one of `includeProof` and `txData` — both write the ERC1155 `data` slot",
        );
      }

      // The ERC1155 `data` slot, in priority order:
      //   - `txData`: caller-supplied bytes, attached verbatim for the org's hook.
      //   - `includeProof`: fetch + validate the avatar's score proof and encode
      //     it (`abi.encode(score, proof)`) for a policy-aware org.
      //   - otherwise empty.
      let data: Hex = "0x";
      if (customData !== undefined) {
        data = bytesToHex(customData) as Hex;
      } else if (includeProof) {
        const proof = await this.client.getProof(group, params.avatar);
        if (proof.scoreRaw === "0") {
          throw PermissionlessGroupError.notEligible(
            params.avatar,
            proof.scoreRaw,
          );
        }
        // Off-chain proof pre-flight (verifyProofOnChain) intentionally skipped
        // — see note in mint(). The on-chain transfer is the source of truth.
        data = encodePolicyData(BigInt(proof.scoreRaw), proof.proof);
      }

      const txs: TransactionRequest[] = [];
      // shortfall of ERC1155 to cover the demurraged amount.
      let need =
        demurragedAmount > bal.erc1155 ? demurragedAmount - bal.erc1155 : 0n;
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
      // shortfall to inflationary for the unwrap call). unwrap() floors the
      // inflationary→demurraged conversion on-chain, so the exact converted
      // amount round-trips to a few hundred wei *less* than `need` and the
      // safeTransferFrom below would revert — top up until the round trip
      // covers the shortfall, plus a buffer for wei-level rounding drift,
      // capped at the wrapper balance. Excess stays as the avatar's ERC1155.
      if (need > 0n) {
        let inflToUnwrap =
          CirclesConverter.attoCirclesToAttoStaticCircles(need);
        let back =
          CirclesConverter.attoStaticCirclesToAttoCircles(inflToUnwrap);
        while (back < need) {
          inflToUnwrap +=
            CirclesConverter.attoCirclesToAttoStaticCircles(need - back) + 1n;
          back = CirclesConverter.attoStaticCirclesToAttoCircles(inflToUnwrap);
        }
        inflToUnwrap += UNWRAP_ROUNDING_BUFFER;
        if (inflToUnwrap > bal.inflationaryWrapper) {
          inflToUnwrap = bal.inflationaryWrapper;
        }
        txs.push(wrapper.unwrap(inflToUnwrap));
      }

      const groupTokenId = await this.hub.toTokenId(group);
      txs.push(
        this.hub.safeTransferFrom(
          params.avatar,
          params.to,
          groupTokenId,
          demurragedAmount,
          data,
        ),
      );
      return { txs, mode: "erc1155-after-unwrap" };
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
      consolidation.push(
        this.hub.wrap(group, erc1155ToWrap, CirclesType.Inflation),
      );
    }

    // delivery amount: demurraged → inflationary (64.64, bit-identical with the
    // wrapper's on-chain conversion up to sub-wei truncation).
    const inflationaryAmount =
      CirclesConverter.attoCirclesToAttoStaticCircles(demurragedAmount);

    // When txData is provided, append a zero-value ERC1155 safeTransferFrom so
    // the indexer can pick up the annotation (ERC20 transfers carry no data slot).
    if (params.txData !== undefined) {
      const annotationData = bytesToHex(params.txData) as Hex;
      const groupTokenId = await this.hub.toTokenId(group);
      return {
        txs: [
          ...consolidation,
          wrapper.transfer(params.to, inflationaryAmount),
          this.hub.safeTransferFrom(params.avatar, params.to, groupTokenId, 0n, annotationData),
        ],
        mode: "erc20-inflationary-annotated",
      };
    }

    return {
      txs: [...consolidation, wrapper.transfer(params.to, inflationaryAmount)],
      mode: "erc20-inflationary",
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
   * in one shot). `params.maxEdges` is forwarded to the pathfinder's
   * `maxTransfers` (it steers the search/splitting; it is not a hard cap on the
   * returned edges — see {@link MigrationParams.maxEdges}).
   *
   * When nothing can be migrated (the pathfinder finds no route) — or only a
   * dust amount below {@link MigrationParams.dustThreshold} (default 0.1 CRC) —
   * this returns an empty batch `{ txs: [], amount: 0n, edges: 0 }` rather than
   * throwing.
   * Migration being impossible (or not worth the gas) is a normal state, so
   * callers can simply check `txs.length`/`amount`. Submission is the caller's
   * job; the returned `txs` are meant to be sent atomically through a Safe runner.
   */
  async migration(params: MigrationParams): Promise<MigrationResult> {
    const path = await this.migrationPath(params);
    if (!path.transfers || path.transfers.length === 0) {
      return { txs: [], amount: 0n, edges: 0 };
    }
    // Skip dust: routing a sub-threshold amount through operateFlowMatrix costs
    // more gas than it's worth and only bloats the batch.
    const dustThreshold = params.dustThreshold ?? DEFAULT_MIGRATION_DUST_THRESHOLD;
    if (path.maxFlow < dustThreshold) {
      return { txs: [], amount: 0n, edges: 0 };
    }

    const scoreGroup = PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress;
    const builder = new TransferBuilder(this.config.circlesConfig);
    const txs = await builder.buildFlowMatrixTx(
      params.avatar,
      PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      path,
      {
        excludeFromTokens: [scoreGroup, ...(params.excludeFromTokens ?? [])],
        toTokens: [scoreGroup],
        ...(params.fromTokens?.length ? { fromTokens: params.fromTokens } : {}),
        useWrappedBalances: true,
      },
    );
    return {
      txs: txs as TransactionRequest[],
      amount: path.maxFlow,
      edges: path.transfers.length,
    };
  }

  /**
   * Build + submit a migration with automatic re-query and hop-reduction retries.
   *
   * Migration routes through *intermediary* avatars' balances (transitive
   * transfers), and that route goes stale within blocks — a batch built even
   * seconds early can revert with `ERC20/ERC1155InsufficientBalance` once an
   * intermediary moves. This helper hardens that on every attempt:
   *
   *   1. **Re-query fresh** — {@link migration} is called again right before each
   *      submit, shrinking the staleness window to (ideally) one block.
   *   2. **Shrink the edge cap on a retryable failure** — the next attempt caps
   *      `maxEdges` at `floor(edgesUsed × reductionFactor)` (≥ `minEdges`),
   *      routing a shorter path through fewer intermediaries: a little less
   *      migrated for a much higher chance of landing.
   *
   * Submission stays runner-agnostic: `submit` sends the batch and must
   * **throw/reject on revert**. Whether a thrown error is a *retryable* revert
   * or a *fatal* error (user rejection, a bug in `submit`) is decided by
   * {@link MigrationRetryOptions.isRetryable}; fatal errors are **rethrown
   * immediately** rather than re-prompting the user with a smaller migration. A
   * pathfinder/build error inside the loop is treated as retryable (logged, then
   * retried), so it never discards the attempt log.
   *
   * Returns a discriminated {@link MigrationRetryResult}: `success: true` with the
   * submit return value, or `success: false` with `reason: 'empty'` (nothing
   * migratable / only dust — a smaller cap can't find more) or
   * `reason: 'exhausted'` (real value, but every attempt reverted).
   *
   * @typeParam T - the submit callback's return type.
   * @throws if an option is out of range, or on a non-retryable `submit` error.
   */
  async migrateWithRetry<T>(
    params: MigrationParams,
    submit: (txs: TransactionRequest[], attempt: MigrationAttempt) => Promise<T>,
    options?: MigrationRetryOptions,
  ): Promise<MigrationRetryResult<T>> {
    const maxAttempts = options?.maxAttempts ?? 4;
    const minEdges = options?.minEdges ?? 5;
    const reductionFactor = options?.reductionFactor ?? 0.6;
    const startEdges = options?.startEdges ?? params.maxEdges ?? DEFAULT_MAX_EDGES;
    const isRetryable = options?.isRetryable ?? defaultIsRetryableSubmitError;

    if (maxAttempts < 1) {
      throw PermissionlessGroupError.invalidInput(
        "migrateWithRetry() maxAttempts must be >= 1",
        { maxAttempts },
      );
    }
    if (minEdges < 1) {
      throw PermissionlessGroupError.invalidInput(
        "migrateWithRetry() minEdges must be >= 1",
        { minEdges },
      );
    }
    if (!(reductionFactor > 0 && reductionFactor < 1)) {
      throw PermissionlessGroupError.invalidInput(
        "migrateWithRetry() reductionFactor must be in the open interval (0, 1)",
        { reductionFactor },
      );
    }
    if (startEdges < minEdges) {
      throw PermissionlessGroupError.invalidInput(
        "migrateWithRetry() startEdges must be >= minEdges",
        { startEdges, minEdges },
      );
    }

    let nextEdges = startEdges;
    const attempts: MigrationAttemptLog[] = [];

    for (let i = 1; i <= maxAttempts; i++) {
      const maxEdges = Math.max(minEdges, Math.floor(nextEdges));

      // Fresh pathfinder query + rebuild on every attempt — the route is only
      // valid for the current chain state, so we build as late as possible. A
      // build/pathfinder error is transient-friendly: log it and retry rather
      // than throw mid-loop and discard the attempt log.
      let built: MigrationResult;
      try {
        built = await this.migration({ ...params, maxEdges });
      } catch (err) {
        attempts.push({
          attempt: i,
          maxEdges,
          amount: 0n,
          edges: 0,
          error: err instanceof Error ? err.message : String(err),
        });
        nextEdges = Math.floor(maxEdges * reductionFactor);
        continue;
      }

      const info: MigrationAttempt = {
        attempt: i,
        maxEdges,
        amount: built.amount,
        edges: built.edges,
      };

      if (built.txs.length === 0) {
        // Nothing migratable at this cap (no route, or only dust). A smaller cap
        // can't find more, so stop rather than burn the remaining attempts.
        attempts.push({ ...info, error: "no migratable route (empty batch)" });
        return { success: false, reason: "empty", amount: 0n, attempts };
      }

      try {
        const result = await submit(built.txs, info);
        attempts.push(info);
        return { success: true, result, amount: built.amount, attempts };
      } catch (err) {
        if (!isRetryable(err)) {
          // Fatal (user rejection, a bug in `submit`, …): don't re-prompt with a
          // smaller migration — surface the real error to the caller.
          throw err;
        }
        attempts.push({
          ...info,
          error: err instanceof Error ? err.message : String(err),
        });
        // Shrink based on the edges this failed route actually used, so the next
        // attempt is a genuinely shorter (more robust) path.
        nextEdges = Math.floor((built.edges || maxEdges) * reductionFactor);
      }
    }

    return { success: false, reason: "exhausted", amount: 0n, attempts };
  }

  /**
   * Preview how much `avatar` could migrate right now — the same pathfinder
   * calculation as {@link migration} (identical params, same
   * `toTokens=[scoreGroup]` / `excludeFromTokens=[scoreGroup]` constraints and
   * `maxEdges` cap), but it stops before building the tx batch.
   *
   * Returns the migratable atto-CRC (`0n` when nothing is migratable). This is
   * the true reachable amount — the {@link MigrationParams.dustThreshold} skip
   * applies only when {@link migration} actually builds a batch, so this value
   * always reflects what's there. The number reflects chain + pathfinder state
   * at query time; `migration()` re-queries, so the executed amount may differ
   * slightly if the chain moved.
   */
  async migratableAmount(params: MigrationParams): Promise<bigint> {
    const path = await this.migrationPath(params);
    return path.maxFlow;
  }

  /**
   * The avatar's full reachable group CRC balance: its current holdings across
   * all three forms (ERC1155, demurrage ERC20, inflationary ERC20) PLUS the
   * amount still migratable from legacy CRC (migration pathfinder, `maxEdges:
   * {@link DEFAULT_MAX_EDGES}`). Group-CRC figures are normalized to
   * **demurraged** atto-CRC so they're summable.
   *
   * Returns both **deterministic** figures (`scoreGroupHeldTotal`,
   * `personalHeldTotal`, and each breakdown entry's `heldTotal`) that depend
   * only on the avatar's own holdings, and **live estimates**
   * (`scoreGroupMigratable`, `scoreGroupTotal`, `personalTotal`, and the
   * per-entry `total`) derived from the migration pathfinder — a network
   * max-flow that tracks the indexer block (`migratableAtBlock`) and so changes
   * between calls even when the avatar's holdings don't. See
   * {@link GroupCrcBalance} for the full field-by-field contract.
   *
   * `personalBreakdown` lists the avatar's held personal CRC (from
   * `circles_getTokenBalances`, excluding the group's own token); each entry's
   * `total` is reduced by the migration's outgoing flow, while `heldTotal` is
   * the raw held amount. See {@link PersonalTokenBalance}.
   *
   * Reads `balanceBreakdown(avatar)`, the migration pathfinder probe, and the
   * personal token balances in parallel. "Nothing migratable" (no path) counts
   * as `0`, not an error. For the raw per-form group-CRC breakdown + wrapper
   * addresses, use {@link balanceBreakdown}.
   *
   * @param options.includeMigratable - default `true`. Pass `false` to **skip
   *   the migration pathfinder probe entirely** — faster, and avoids pulling a
   *   live network max-flow you don't intend to show. With it off, the result is
   *   fully deterministic: `scoreGroupMigratable` is `0n`, `scoreGroupTotal`
   *   equals `scoreGroupHeldTotal`, `personalTotal` equals `personalHeldTotal`
   *   (no outgoing flow is subtracted), and `migratableAtBlock` is omitted. Use
   *   this for a stable balance display; only run with migratable on the
   *   migrate/cashback action.
   */
  async balance(
    avatar: Address,
    options?: { includeMigratable?: boolean },
  ): Promise<GroupCrcBalance> {
    const includeMigratable = options?.includeMigratable ?? true;

    // One wall-clock reference for every demurrage conversion in this call, so
    // the held figures and the migration estimate are normalized against the
    // same instant. `CirclesConverter` otherwise samples `Date.now()` per call,
    // which would let the parallel reads below drift apart by a few wei.
    const nowUnixSeconds = BigInt(Math.floor(Date.now() / 1000));

    // Run the migration probe once and reuse its result for both the
    // `migratable` figure AND the per-token personal breakdown — the path's
    // outgoing edges (the flow this migration would spend) are exactly what we
    // subtract from the held personal balances. "No path" is a normal empty
    // state, not an error: fall back to an empty path. When the caller opts out
    // of migratable we skip the pathfinder call altogether (no round-trip) and
    // use an empty path, so every figure collapses to its held (stable) form.
    const emptyPath: PathfindingResult = { maxFlow: 0n, transfers: [] };
    // Tag each fallible read with its outcome so a swallowed RPC failure is
    // distinguishable from a genuine zero — `findPath`/`getTokenBalances` THROW
    // on transport/server errors (a true "no path"/"no balance" is a normal
    // non-error result), so a bare catch would otherwise mask an outage as a real
    // zero. Surfaced via `migratableProbe` / `personalProbe`.
    const probePromise: Promise<{
      path: PathfindingResult;
      probe: "ok" | "skipped" | "failed";
    }> = includeMigratable
      ? this.migrationPath({ avatar, maxEdges: DEFAULT_MAX_EDGES })
          .then((p) => ({ path: p, probe: "ok" as const }))
          .catch(() => ({ path: emptyPath, probe: "failed" as const }))
      : Promise.resolve({ path: emptyPath, probe: "skipped" as const });

    const [bal, probeResult, personalRead] = await Promise.all([
      this.balanceBreakdown(avatar),
      probePromise,
      new CirclesRpc(this.config.circlesConfig.circlesRpcUrl).balance
        .getTokenBalances(avatar)
        .then((b) => ({ balances: b, probe: "ok" as const }))
        .catch(() => ({ balances: [] as TokenBalance[], probe: "failed" as const })),
    ]);
    const path = probeResult.path;
    const migratableProbe = probeResult.probe;
    const personalBalances = personalRead.balances;
    const personalProbe = personalRead.probe;

    // inflationary balance is in inflationary units — convert down to demurraged.
    const inflationaryErc20 = CirclesConverter.attoStaticCirclesToAttoCircles(
      bal.inflationaryWrapper,
      nowUnixSeconds,
    );
    const scoreGroupHeldTotal =
      bal.erc1155 + bal.demurrageWrapper + inflationaryErc20;

    const personalBreakdown = this.buildPersonalBreakdown(
      avatar,
      personalBalances,
      path.transfers,
      nowUnixSeconds,
    );
    // `total` is the post-migration estimate; `heldTotal` is the raw held figure.
    const personalTotal = personalBreakdown.reduce((sum, p) => sum + p.total, 0n);
    const personalHeldTotal = personalBreakdown.reduce(
      (sum, p) => sum + p.heldTotal,
      0n,
    );

    // The migratable max-flow is computed at a specific indexer block; surface it
    // so callers know which block the live estimate reflects (bigint, normalized
    // at the RPC boundary).
    const migratableAtBlock = path.graphBlock;

    return {
      scoreGroupBreakdown: {
        erc1155: bal.erc1155,
        demurrageErc20: bal.demurrageWrapper,
        inflationaryErc20,
      },
      scoreGroupHeldTotal,
      scoreGroupMigratable: path.maxFlow,
      scoreGroupTotal: scoreGroupHeldTotal + path.maxFlow,
      ...(migratableAtBlock !== undefined ? { migratableAtBlock } : {}),
      migratableProbe,
      personalBreakdown,
      personalTotal,
      personalHeldTotal,
      personalProbe,
    };
  }

  /**
   * Build the per-token personal-CRC breakdown: the avatar's held personal CRC
   * (everything except the configured group's own token) minus the migration's
   * outgoing flow, attributed **per form**.
   *
   * Held balances come from `circles_getTokenBalances`, where each row carries
   * the token's form flags (`isErc20`/`isInflationary`) plus `tokenAddress`
   * (the wrapper contract for ERC20, the issuer for ERC1155) and `tokenOwner`
   * (always the issuer). A migration pathfinder edge's `tokenOwner` field is the
   * spent token's `tokenAddress`, so we key the subtraction on `tokenAddress`:
   *   - ERC1155 / demurrage-ERC20 rows: subtract the edge `value` directly
   *     (both are demurraged atto-CRC, same unit as the row).
   *   - inflationary-ERC20 rows: the row balance is in static units, so convert
   *     the edge's demurraged `value` to static before subtracting.
   * Each transferable form is clamped at 0 (the pathfinder figure and the
   * indexer snapshot can disagree at the margin). Every entry also carries the
   * raw held amount per form (before the subtraction) so the caller can read a
   * stable `heldTotal` alongside the live `total`. A token is emitted whenever
   * the avatar holds any of it (`heldTotal > 0`), even if the migration would
   * spend all of it. Circles v1 balances (`version === 1`) are skipped — they're
   * not migratable into a v2 score group.
   *
   * @param nowUnixSeconds - shared timestamp for the demurrage rollup so every
   *   entry is normalized to the same instant.
   */
  private buildPersonalBreakdown(
    avatar: Address,
    held: TokenBalance[],
    transfers: TransferStep[],
    nowUnixSeconds: bigint,
  ): PersonalTokenBalance[] {
    const group = this.config.groupAddress;

    // Outgoing flow spent by `avatar`, summed per spent token contract
    // (`tokenAddress`), in the edge's native demurraged unit.
    const outgoingByToken = new Map<string, bigint>();
    for (const t of transfers) {
      if (!hexEq(t.from, avatar)) continue;
      const key = t.tokenOwner.toLowerCase();
      outgoingByToken.set(key, (outgoingByToken.get(key) ?? 0n) + BigInt(t.value));
    }

    // Accumulate per issuer, bucketed by form. We track BOTH the raw held amount
    // (`held*`, stable) and the amount left after subtracting the migration's
    // outgoing flow (the public per-form fields, a live estimate).
    type Acc = PersonalTokenBalance & {
      heldErc1155: bigint;
      heldDemurrageErc20: bigint;
      heldInflationaryErc20: bigint;
    };
    const byOwner = new Map<string, Acc>();
    for (const row of held) {
      // Personal CRC means Circles v2 only. v1 tokens (`version === 1`) live in
      // the old Hub, can't be migrated into a v2 score group, and aren't
      // routable by the v2 pathfinder — skip them so they don't inflate the
      // breakdown with un-migratable balance.
      if (row.version === 1) continue;

      // The group's own token is reported as held gCRC, not migration
      // collateral — exclude it from the personal breakdown.
      if (hexEq(row.tokenOwner, group)) continue;

      const ownerKey = row.tokenOwner.toLowerCase();
      const entry =
        byOwner.get(ownerKey) ??
        ({
          tokenOwner: row.tokenOwner,
          erc1155: 0n,
          demurrageErc20: 0n,
          inflationaryErc20: 0n,
          total: 0n,
          heldTotal: 0n,
          heldErc1155: 0n,
          heldDemurrageErc20: 0n,
          heldInflationaryErc20: 0n,
        } satisfies Acc);

      const outgoing = outgoingByToken.get(row.tokenAddress.toLowerCase()) ?? 0n;

      if (row.isInflationary) {
        // Row balance is static; the outgoing edge value is demurraged.
        const outgoingStatic = CirclesConverter.attoCirclesToAttoStaticCircles(
          outgoing,
          nowUnixSeconds,
        );
        entry.heldInflationaryErc20 += row.staticAttoCircles;
        entry.inflationaryErc20 += clampSub(row.staticAttoCircles, outgoingStatic);
      } else if (row.isErc20) {
        entry.heldDemurrageErc20 += row.attoCircles;
        entry.demurrageErc20 += clampSub(row.attoCircles, outgoing);
      } else {
        entry.heldErc1155 += row.attoCircles;
        entry.erc1155 += clampSub(row.attoCircles, outgoing);
      }

      byOwner.set(ownerKey, entry);
    }

    // Roll up each token's forms into demurraged totals (the inflationary form is
    // static, so convert it down before adding). `total` is post-migration (a
    // live estimate); `heldTotal` is the raw held figure (stable). Emit any token
    // the avatar holds, even if the migration would spend all of it.
    return Array.from(byOwner.values())
      .map(
        (e) =>
          ({
            tokenOwner: e.tokenOwner,
            erc1155: e.erc1155,
            demurrageErc20: e.demurrageErc20,
            inflationaryErc20: e.inflationaryErc20,
            total:
              e.erc1155 +
              e.demurrageErc20 +
              CirclesConverter.attoStaticCirclesToAttoCircles(
                e.inflationaryErc20,
                nowUnixSeconds,
              ),
            heldTotal:
              e.heldErc1155 +
              e.heldDemurrageErc20 +
              CirclesConverter.attoStaticCirclesToAttoCircles(
                e.heldInflationaryErc20,
                nowUnixSeconds,
              ),
          }) satisfies PersonalTokenBalance,
      )
      .filter((e) => e.heldTotal > 0n);
  }

  /**
   * Shared pathfinder lookup behind {@link migration} and
   * {@link migratableAmount}: routes `avatar`'s CRC into the SinkWrapper with
   * the migration constraints (destination = score group only, never sourcing
   * the score group token, `maxEdges` defaulting to {@link DEFAULT_MAX_EDGES}).
   * Validates params and throws on invalid input.
   */
  private async migrationPath(
    params: MigrationParams,
  ): Promise<PathfindingResult> {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput(
        "migration() requires `avatar`",
      );
    }
    if (params.amount !== undefined && params.amount <= 0n) {
      throw PermissionlessGroupError.invalidInput(
        "migration() amount must be > 0 when supplied (omit it to use MAX_FLOW)",
        { amount: params.amount.toString() },
      );
    }
    if (params.maxEdges !== undefined && params.maxEdges <= 0) {
      throw PermissionlessGroupError.invalidInput(
        "migration() maxEdges must be > 0 when supplied",
        { maxEdges: params.maxEdges },
      );
    }
    if (params.dustThreshold !== undefined && params.dustThreshold < 0n) {
      throw PermissionlessGroupError.invalidInput(
        "migration() dustThreshold must be >= 0 when supplied",
        { dustThreshold: params.dustThreshold.toString() },
      );
    }

    const scoreGroup = PERMISSIONLESS_GROUPS_MIGRATION.scoreGroupAddress;
    const rpcUrl = this.config.circlesConfig.circlesRpcUrl;
    const pathfinder = new PathfinderMethods(new RpcClient(rpcUrl));

    const path = await pathfinder.findPath({
      from: params.avatar,
      to: PERMISSIONLESS_GROUPS_MIGRATION.sinkWrapperAddress,
      targetFlow: params.amount ?? MAX_FLOW,
      // The group's own token is never a migration source; callers may extend
      // the exclusion (e.g. with an invitation path's source tokens) to keep
      // two same-state flow matrices disjoint in one atomic batch.
      excludeFromTokens: [scoreGroup, ...(params.excludeFromTokens ?? [])],
      // The migration must arrive at the sink as the ScoreGroup's CRC.
      toTokens: [scoreGroup],
      ...(params.fromTokens?.length ? { fromTokens: params.fromTokens } : {}),
      // `maxEdges` is forwarded straight to the pathfinder's `maxTransfers` — it
      // steers the search, not a hard cap on the returned edges. Default to 40 so
      // every migration probe asks for the same generous value unless overridden.
      maxTransfers: params.maxEdges ?? DEFAULT_MAX_EDGES,
      useWrappedBalances: true,
    });

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
  private async buildGroupTrustTxIfNeeded(
    avatar: Address,
  ): Promise<TransactionRequest[]> {
    const group = this.config.groupAddress;
    if (!hexEq(group, PERMISSIONLESS_GROUPS_STAGING.groupAddress)) return [];
    if (await this.hub.isTrusted(group, avatar)) return [];
    const scoreGroup = new ScoreGroupContractMinimal({
      address: group,
      rpcUrl: this.config.rpcUrl,
    });
    return [scoreGroup.trust(avatar)];
  }

  private async buildMintBatch(
    params: MintParams,
    proof: ProofResponse,
  ): Promise<MintResult> {
    // The encoded proof payload must carry the raw score (it's the SMT leaf the
    // policy verifies on-chain), but everything that interprets the score on the
    // 0–100 scale — the mintable-amount calc — uses the clamped value.
    const rawScore = BigInt(proof.scoreRaw);
    const policyData = encodePolicyData(rawScore, proof.proof);
    const amount = await this.resolveAmount(params, clampScore(rawScore));

    // "Mint max" with no claimable issuance right now is a normal empty state,
    // not an error: issuance accrues over time, so an avatar that just minted
    // has ~0 and `(issuance × score) / 100` floors to 0. Return an empty batch
    // so callers branch on `amount`/`txs.length` — mirroring `migration()` and
    // the `scoreRaw === "0"` path in `mint()`. Building a 0-amount groupMint
    // would only produce a batch that reverts on-chain.
    if (amount === 0n) {
      return { txs: [], proof, amount: 0n };
    }

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
        policyData,
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
   * "you have X / Y required" before the user attempts a mint. Returns the
   * real, uncapped score — the 0–100 cap only applies to the minting math
   * (see {@link clampScore}).
   */
  async getScore(avatar: Address): Promise<bigint> {
    const proof = await this.client.getProof(this.config.groupAddress, avatar);
    return BigInt(proof.scoreRaw);
  }

  private validateMintParams(params: MintParams): void {
    if (!params.avatar) {
      throw PermissionlessGroupError.invalidInput("mint() requires `avatar`");
    }
    if (params.amount !== undefined && params.amount < 0n) {
      throw PermissionlessGroupError.invalidInput("amount must be >= 0", {
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
   *
   * Returns `0n` when the avatar has no claimable issuance right now (it just
   * minted, so nothing has accrued yet). That's a normal empty state, not an
   * error — {@link buildMintBatch} turns a 0 resolve into an empty batch
   * instead of throwing.
   */
  private async resolveAmount(
    params: MintParams,
    score: bigint,
  ): Promise<bigint> {
    if (params.amount !== undefined && params.amount > 0n) return params.amount;

    const [issuance] = await this.hub.calculateIssuance(params.avatar);
    return (issuance * score) / MAX_SCORE;
  }
}

/**
 * ABI-encode the mint policy's expected `data` argument as `(uint256, bytes)`.
 * Exported for test reuse.
 */
export function encodePolicyData(score: bigint, proof: Hex): Hex {
  return encodeAbiParameters(["uint256", "bytes"], [score, proof]);
}
