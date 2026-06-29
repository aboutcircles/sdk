import type { Address, CirclesConfig, Hex, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Response shape from the score-groups backend's `/groups/{group}/proof/{address}` endpoint.
 * Mirrors the staging API contract (proofValidityModel: "single-root" today).
 */
export interface ProofResponse {
  groupAddress: Address;
  userAddress: Address;
  /** Leaf hash, bytes32 of scoreRaw. SDK rarely needs this. */
  value: Hex;
  /** Integer score as a decimal string (0–100 scale). Use this when calling the policy. */
  scoreRaw: string;
  /** Opaque proof bytes — pass verbatim into the mint policy data. */
  proof: Hex;
  /** SMT root the proof verifies against. */
  root: Hex;
  /** Tree depth. Always 160 today. */
  depth: number;

  publishStatus: 'published' | 'pending';
  /** ISO timestamp when this root was broadcast on-chain. null when pending. */
  rootPublishedAt: string | null;
  /** ISO timestamp of the most recent on-chain root change for this group. */
  lastHeadChangedAt: string | null;
  /** ISO timestamp — earliest possible next root change. null when publisher is idle. */
  nextHeadEarliestAt: string | null;
  publishCadenceSeconds: number;
  /** Server-side ISO timestamp at response generation. Use this (not local clock) for skew. */
  serverTime: string;
  proofValidityModel: 'single-root' | 'ring-buffer';
}

/**
 * Per-cell migration cap from the score-groups batch endpoint.
 * Mirrors `POST /groups/mint-limits/batch` results (groupUsers mode), where
 * each cell is keyed on `(group, user)` and `user` is interpreted as the
 * source-collateral avatar (`tokenId = uint256(uint160(user))`).
 */
export interface MintLimitsCell {
  ok: true;
  groupAddress: Address;
  userAddress: Address;
  collateralTokenId: string;
  migration: {
    historicalSupplyInitialized: boolean;
    historicalSupplyOnTodayRaw: string;
    mintedAmountOnToday: string;
    alreadyInTreasury: string;
    maxTotalRaw: string;
    maxTotalEffective: string;
    maxTotalEffectiveCrc: string;
    leftToMintRaw: string;
    leftToMintEffective: string;
    leftToMintEffectiveCrc: string;
    collateralLimitReached: boolean;
  };
  personalMint: {
    score: string;
    currentIssuance: string;
    scoreAdjustedIssuanceLimit: string;
    scoreAdjustedIssuanceLimitCrc: string;
  };
}

export interface MintLimitsCellError {
  ok: false;
  groupAddress: Address;
  userAddress: Address;
  error: { code: string; message: string };
}

export type MintLimitsBatchEntry = MintLimitsCell | MintLimitsCellError;

/**
 * Configuration for a PermissionlessGroup instance.
 *
 * The mint policy is not configured here — it is resolved at runtime from
 * `Hub.mintPolicies(groupAddress)`. The policy itself holds the SMT root via
 * `merkleRoots(group)`, so freshness is checked against the resolved policy.
 *
 * No runner here either — `mint()` returns the tx batch and the caller
 * decides how to submit it (Safe multisend, single-shot, simulation, …).
 */
export interface PermissionlessGroupConfig {
  /** The score-gated group avatar address. */
  groupAddress: Address;
  /** Hub V2 contract address (prod Gnosis Hub for staging+prod). */
  hubAddress: Address;
  /**
   * LiftERC20 contract address — needed by `balance()` to look up the group's
   * demurrage / inflationary ERC20 wrapper addresses.
   * `circlesConfig[100].liftERC20Address` on Gnosis Chain.
   */
  liftERC20Address: Address;
  /** Base URL of the score-groups backend, e.g. `https://host/score-groups` (no trailing slash). */
  backendBaseUrl: string;
  /** JSON-RPC endpoint for read calls. */
  rpcUrl: string;
  /**
   * Full CirclesConfig used to drive the pathfinder + flow-matrix build for
   * `migration()`. Needs at minimum `circlesRpcUrl`, `v2HubAddress`,
   * `liftERC20Address`. `circlesConfig[100]` from `@aboutcircles/sdk-utils`
   * works as-is.
   */
  circlesConfig: CirclesConfig;
}

/** Parameters for PermissionlessGroup.mint(). */
export interface MintParams {
  /**
   * Avatar minting from the group. Used as the proof subject, the collateral
   * provider (always `[avatar]`), and the destination of the wrapped group
   * tokens. Must equal the runner's signing account — the policy binds the
   * proof to msg.sender.
   */
  avatar: Address;
  /**
   * Atto-CRC to mint and wrap. Omit (or pass `0n`) to mint the maximum the
   * policy allows right now: `(snapshottedIssuance × score) / 100`.
   */
  amount?: bigint;
}

/**
 * Result of `PermissionlessGroup.balanceBreakdown()` — an avatar's holdings of
 * the group's token in all three forms, plus the resolved wrapper addresses.
 *
 * Note: `erc1155` and `demurrageWrapper` share the same demurraged unit, while
 * `inflationary` is in inflationary atto-CRC (different time-units). Don't
 * blindly sum them — convert via `CirclesConverter` first if you need a total
 * (or use `PermissionlessGroup.balance()` ({@link GroupCrcBalance})).
 */
export interface BalanceResult {
  /** ERC1155 group-CRC balance held by the avatar (demurraged atto-CRC). */
  erc1155: bigint;
  /**
   * ERC20 demurrage-wrapper balance (demurraged atto-CRC). 0n when the
   * wrapper has not been deployed for this group yet.
   */
  demurrageWrapper: bigint;
  /**
   * ERC20 inflationary-wrapper balance (inflationary atto-CRC). 0n when the
   * wrapper has not been deployed for this group yet.
   */
  inflationaryWrapper: bigint;
  /** Resolved demurrage wrapper address (zero when not deployed). */
  demurrageWrapperAddress: Address;
  /** Resolved inflationary wrapper address (zero when not deployed). */
  inflationaryWrapperAddress: Address;
}

/**
 * One personal-CRC token the avatar holds, with the still-**transferable**
 * amount in each form after the migration's outgoing flow is subtracted.
 *
 * Keyed by `tokenOwner` (the issuing avatar/group). The same issuer may hold
 * balance in more than one form simultaneously (raw ERC1155 + an ERC20
 * wrapper), so all three are reported on a single entry. Each form's value is
 * `held − outgoing`, where `outgoing` is the sum of migration pathfinder edges
 * that spent *that specific form* of this token (see
 * {@link GroupCrcBalance.personalBreakdown}).
 *
 * Units mirror the on-chain balances: `erc1155` and `demurrageErc20` are
 * **demurraged** atto-CRC, while `inflationaryErc20` is **inflationary/static**
 * atto-CRC (the unit the inflationary wrapper holds) — don't sum across forms
 * without converting first.
 *
 * Excludes the configured group's own token (that's reported as the held gCRC
 * on {@link GroupCrcBalance}, not as migration collateral).
 */
export interface PersonalTokenBalance {
  /** Issuing avatar/group of this CRC token (the ERC1155 token id source). */
  tokenOwner: Address;
  /** Transferable raw ERC1155 balance (demurraged): held ERC1155 − outgoing ERC1155 flow. */
  erc1155: bigint;
  /** Transferable demurrage-wrapper ERC20 balance (demurraged): held − outgoing demurrage-ERC20 flow. */
  demurrageErc20: bigint;
  /** Transferable inflationary-wrapper ERC20 balance (inflationary/static): held − outgoing inflationary-ERC20 flow. */
  inflationaryErc20: bigint;
  /**
   * Sum of this token's three forms **after** the migration's outgoing flow is
   * subtracted, normalized to **demurraged** atto-CRC (`inflationaryErc20`
   * converted down first) — the transferable balance of this token left over
   * once the migration in {@link GroupCrcBalance.scoreGroupMigratable} is spent.
   * This is a **live estimate**: it moves with the pathfinder result (which
   * tracks the indexer block). For a value that depends only on the avatar's own
   * holdings, use {@link heldTotal}.
   */
  total: bigint;
  /**
   * Sum of this token's three forms **before** any migration subtraction,
   * normalized to **demurraged** atto-CRC — the raw held balance of this token.
   * Depends only on the avatar's own holdings, so it is **deterministic** for a
   * given chain state (unlike {@link total}, which tracks the live pathfinder
   * result).
   */
  heldTotal: bigint;
}

/**
 * The avatar's held score-group CRC across the three forms, normalized to
 * **demurraged** atto-CRC so the figures are summable.
 */
export interface ScoreGroupBreakdown {
  /** ERC1155 group-CRC the avatar holds (demurraged). */
  erc1155: bigint;
  /** Demurrage-wrapper ERC20 balance (demurraged). */
  demurrageErc20: bigint;
  /** Inflationary-wrapper ERC20 balance, converted to demurraged for summing. */
  inflationaryErc20: bigint;
}

/**
 * Result of `PermissionlessGroup.balance()` — the avatar's current score-group
 * CRC across all three forms PLUS the amount still migratable from legacy CRC,
 * all normalized to **demurraged** atto-CRC so the figures are summable;
 * alongside the avatar's personal CRC.
 *
 * Two classes of figure are returned, and they behave differently:
 *
 *   - **Deterministic** (depend only on the avatar's own holdings for a given
 *     chain state): {@link scoreGroupBreakdown}, {@link scoreGroupHeldTotal},
 *     {@link personalBreakdown} `heldTotal`s, {@link personalHeldTotal}.
 *   - **Live estimate** (computed from the migration pathfinder, a network
 *     max-flow that tracks the indexer block — see {@link migratableAtBlock} —
 *     and so changes between calls even when the avatar's holdings don't):
 *     {@link scoreGroupMigratable}, {@link scoreGroupTotal}, the per-token
 *     `total`s in {@link personalBreakdown}, and {@link personalTotal}.
 *
 * The migratable max-flow routes the avatar's CRC through the wider trust graph,
 * so it is inherently unstable across blocks; prefer the deterministic figures
 * for anything that must not change without a balance change.
 *
 * For the raw per-form breakdown + wrapper addresses, see
 * `PermissionlessGroup.balanceBreakdown()` ({@link BalanceResult}).
 */
export interface GroupCrcBalance {
  /** Held score-group CRC per form (demurraged). See {@link ScoreGroupBreakdown}. */
  scoreGroupBreakdown: ScoreGroupBreakdown;
  /**
   * Sum of the three held forms (demurraged) — score-group CRC held right now.
   * **Deterministic**: depends only on the avatar's own balances.
   */
  scoreGroupHeldTotal: bigint;
  /**
   * Amount still migratable from legacy CRC into the score group (migration
   * pathfinder max-flow; demurraged). **Live estimate** — a network max-flow
   * computed at {@link migratableAtBlock} that moves as the trust graph changes,
   * independent of the avatar's own holdings.
   */
  scoreGroupMigratable: bigint;
  /**
   * `scoreGroupHeldTotal + scoreGroupMigratable` (demurraged) — full reachable
   * score-group CRC. **Live estimate** (inherits the volatility of
   * {@link scoreGroupMigratable}); use {@link scoreGroupHeldTotal} for a stable
   * held-only figure.
   */
  scoreGroupTotal: bigint;
  /**
   * Indexer block the migration pathfinder computed {@link scoreGroupMigratable}
   * (and the per-token `total`s in {@link personalBreakdown}) against, when the
   * RPC reports it. `undefined` if the probe was skipped/failed, no path was
   * found, or the RPC omitted the block — read {@link migratableProbe} to tell
   * those apart.
   */
  migratableAtBlock?: bigint;
  /**
   * Outcome of the migration-pathfinder probe — disambiguates a `0n`
   * {@link scoreGroupMigratable}:
   *   - `'ok'`: the pathfinder ran; the migratable/total figures are live & valid.
   *   - `'skipped'`: `includeMigratable: false` — the probe was not run; the live
   *     figures equal their held counterparts by construction.
   *   - `'failed'`: the pathfinder RPC errored; migratable fell back to `0n` and
   *     `scoreGroupTotal`/`personalTotal` collapsed to the held figures. This is a
   *     **fallback, not a real zero** — do not render it as "nothing to migrate".
   */
  migratableProbe: "ok" | "skipped" | "failed";
  /**
   * Per-token personal-CRC breakdown: every personal CRC the avatar holds
   * (human + non-group-token group/org CRC). Each entry carries both a stable
   * `heldTotal` (raw held) and a live `total` (held minus the migration's
   * outgoing flow that spent that token). One entry per issuing token; an entry
   * appears whenever the avatar holds any of that token (`heldTotal > 0`), even
   * if the migration would spend all of it. Excludes the configured group's own
   * token (counted as score-group CRC). See {@link PersonalTokenBalance}.
   */
  personalBreakdown: PersonalTokenBalance[];
  /**
   * Sum of the per-token `total`s in {@link personalBreakdown} (demurraged) —
   * personal CRC left transferable after the migration's outgoing flow is
   * subtracted. **Live estimate** (tracks the pathfinder); use
   * {@link personalHeldTotal} for the stable held figure. Excludes the group's
   * own token (counted as score-group CRC).
   */
  personalTotal: bigint;
  /**
   * Sum of the per-token `heldTotal`s in {@link personalBreakdown} (demurraged)
   * — the avatar's total held personal CRC, before any migration subtraction.
   * **Deterministic**: depends only on the avatar's own holdings. Excludes the
   * group's own token (counted as score-group CRC).
   */
  personalHeldTotal: bigint;
  /**
   * Outcome of the `circles_getTokenBalances` read backing
   * {@link personalBreakdown}:
   *   - `'ok'`: balances were read; the personal figures are valid.
   *   - `'failed'`: the read errored and was caught — `personalBreakdown` is empty
   *     and `personalTotal`/`personalHeldTotal` are `0n` as a **fallback, not a
   *     real zero**. Do not render it as "no personal CRC".
   */
  personalProbe: "ok" | "failed";
}

/**
 * Parameters for `PermissionlessGroup.migration()` — moves the avatar's legacy
 * GnosisGroup CRC into the destination ScoreGroup via the SinkWrapper.
 */
export interface MigrationParams {
  /** Avatar holding the legacy GnosisGroup CRC (and the recipient of the wrapped ERC20). */
  avatar: Address;
  /**
   * Atto-CRC to migrate, forwarded verbatim to the pathfinder as
   * `targetFlow`. Omit to request the pathfinder's `MAX_FLOW` sentinel
   * (everything the trust graph can route in one shot).
   */
  amount?: bigint;
  /**
   * Restrict which source CRC token(s) the pathfinder may draw from. Each
   * entry is an avatar address (a token id = `uint256(avatar)`). Useful when
   * only a specific set of CRCs is acceptable as collateral for the
   * destination — e.g. routing collateral that the ScoreGroup actually
   * trusts. When omitted, the pathfinder may use any CRC reachable from
   * `avatar` (except those in `excludeFromTokens`).
   */
  fromTokens?: Address[];
  /**
   * Source CRC token(s) the pathfinder must NOT draw from, merged with the
   * built-in exclusion of the destination ScoreGroup's own token. Accepts
   * avatar addresses and ERC20 wrapper addresses (the pathfinder excludes the
   * exact balance row either way). Use this to keep the migration disjoint
   * from another flow matrix built against the same chain state — e.g. pass
   * the source tokens of an invitation path when batching both atomically,
   * so the two legs can't double-spend the same balance.
   */
  excludeFromTokens?: Address[];
  /**
   * Forwarded directly to the pathfinder's `maxTransfers`. Influences how the
   * pathfinder searches and splits the flow, but is **not** a hard cap on the
   * number of edges returned — observed results carry slightly more transfer
   * steps than this value, and raising it does not necessarily increase the
   * routed amount. Higher values let the search fan out further (potentially a
   * larger, costlier `operateFlowMatrix`); lower values steer it toward a
   * smaller batch. Defaults to 40 when omitted.
   */
  maxEdges?: number;
  /**
   * Minimum migratable atto-CRC worth building a migration for. When the
   * pathfinder finds less than this, `migration()` returns an empty batch —
   * avoiding a multi-edge `operateFlowMatrix` whose gas dwarfs the dust it
   * moves. Only affects `migration()`; `migratableAmount()` always reports the
   * true reachable amount. Defaults to 0.1 CRC (`10^17`). Pass `0n` to migrate
   * any non-zero amount.
   */
  dustThreshold?: bigint;
}


/**
 * Result of `PermissionlessGroup.migration()` — pathfinder output handed
 * straight to the flow-matrix builder.
 */
export interface MigrationResult {
  /**
   * Ordered transaction batch — submit atomically via the runner. Built by
   * `TransferBuilder` (self-approval if needed, optional unwraps,
   * `operateFlowMatrix`, optional re-wraps).
   */
  txs: TransactionRequest[];
  /** Atto-CRC the pathfinder routed into the SinkWrapper. */
  amount: bigint;
  /**
   * Number of flow edges (transitive transfer hops) in the routed path. `0`
   * when the batch is empty. More edges ⇒ a larger `operateFlowMatrix` and more
   * exposure to intermediary balance changes between build and execution (each
   * edge must still hold its baked amount on-chain or the tx reverts). Useful to
   * gauge how fragile a migration is — see {@link MigrationRetryOptions}.
   */
  edges: number;
}

/**
 * One attempt made by {@link PermissionlessGroup.migrateWithRetry}.
 */
export interface MigrationAttempt {
  /** 1-based attempt number. */
  attempt: number;
  /** `maxEdges` cap the pathfinder was queried with for this attempt. */
  maxEdges: number;
  /** Atto-CRC the built batch would migrate (`0` if the batch was empty). */
  amount: bigint;
  /** Flow-edge count of the built batch. */
  edges: number;
}

/**
 * Options for {@link PermissionlessGroup.migrateWithRetry}.
 *
 * The migration path is a live network max-flow that goes stale within blocks
 * (intermediary balances move), so a batch built even seconds early can revert.
 * `migrateWithRetry` mitigates this by re-querying the pathfinder fresh on every
 * attempt AND shrinking the edge cap after a failure — a shorter route touches
 * fewer intermediaries and is less likely to be stale, at the cost of migrating
 * a little less.
 */
export interface MigrationRetryOptions {
  /** Maximum attempts (each one re-queries the pathfinder). Must be ≥ 1. Default 4. */
  maxAttempts?: number;
  /** Edge cap for the first attempt. Must be ≥ `minEdges`. Default `params.maxEdges` ?? 40. */
  startEdges?: number;
  /** Lower bound for the shrinking edge cap. Must be ≥ 1. Default 5. */
  minEdges?: number;
  /**
   * After a failed attempt, the next edge cap is `floor(edgesUsed × factor)`
   * (clamped to `minEdges`), where `edgesUsed` is the failed route's actual edge
   * count. Must be in the open interval `(0, 1)`. Default 0.6.
   */
  reductionFactor?: number;
  /**
   * Classifies a thrown `submit` error: `true` ⇒ retryable revert (shrink hops &
   * retry), `false` ⇒ fatal (rethrow immediately, abort the loop). Default:
   * treat `Error`s as retryable EXCEPT user-rejection / cancellation messages,
   * and treat non-`Error` throws (e.g. a bug in `submit`) as fatal. Override to
   * match your runner's revert shape so a user cancel or a programmer error
   * isn't re-prompted with a smaller migration.
   */
  isRetryable?: (error: unknown) => boolean;
}

/**
 * A {@link MigrationAttempt} annotated with the failure message when that attempt
 * failed. `error` is absent on the attempt that succeeded.
 */
export interface MigrationAttemptLog extends MigrationAttempt {
  error?: string;
}

/**
 * Result of {@link PermissionlessGroup.migrateWithRetry} — a discriminated union
 * on `success`, so `result` narrows without a non-null assertion.
 *
 * The method **returns** (does not throw) for the two *normal* failure outcomes:
 * `reason: 'empty'` (nothing migratable / only dust) and `reason: 'exhausted'`
 * (every attempt's submit reverted). It **throws** only on a non-retryable
 * `submit` error (e.g. a user rejection — see
 * {@link MigrationRetryOptions.isRetryable}); pathfinder/build errors are treated
 * as retryable and logged into `attempts`, not thrown.
 *
 * @typeParam T - the submit callback's return type (e.g. a tx hash / receipt).
 */
export type MigrationRetryResult<T> =
  | {
      success: true;
      /** The successful submit's return value. */
      result: T;
      /** Atto-CRC migrated by the successful attempt. */
      amount: bigint;
      /** Every attempt in order; the last one succeeded. */
      attempts: MigrationAttemptLog[];
    }
  | {
      success: false;
      /**
       * Why it failed: `'empty'` = nothing to migrate (benign, like
       * {@link migration} returning an empty batch); `'exhausted'` = real value
       * but every attempt's submit reverted (worth surfacing/retrying later).
       */
      reason: "empty" | "exhausted";
      /** Always `0n` — nothing was migrated. */
      amount: bigint;
      /** Every attempt in order, each annotated with its `error`. */
      attempts: MigrationAttemptLog[];
    };

/**
 * A score-attested transaction batch: the txs to submit, the backend proof
 * encoded into them, and the atto-CRC the batch acts on. Backs {@link MintResult}.
 */
export interface ScoredTxBatchResult {
  /** Ordered transaction batch — submit atomically via the runner. */
  txs: TransactionRequest[];
  /** Proof fetched from the score-groups backend and encoded into the tx data. */
  proof: ProofResponse;
  /** Atto-CRC the batch acts on. */
  amount: bigint;
}

/**
 * Result of `PermissionlessGroup.mint()`.
 *
 * `txs` order: `snapshotIssuance()` → `personalMint()` →
 * `groupMint(group, [avatar], [amount], abi.encode(score, proof))` →
 * `wrap(group, amount, CirclesType.Inflation)`. `amount` is the atto-CRC
 * encoded into `groupMint`/`wrap` (the resolved cap when "mint max").
 */
export type MintResult = ScoredTxBatchResult;

/**
 * Parameters for `PermissionlessGroup.transferGroupCrc()` — moves the group's
 * CRC (token id `uint256(groupAddress)`) from `avatar` to `to`.
 */
export interface TransferGroupCrcParams {
  /** Holder + sender of the group CRC. */
  avatar: Address;
  /** Recipient. If it's a registered Circles organization, the SDK unwraps to
   *  ERC1155 and sends that; otherwise it sends the inflationary ERC20. */
  to: Address;
  /**
   * Amount to transfer, **in demurraged atto-CRC** (today's value). The SDK
   * converts to the wrapper's inflationary units for the ERC20 transfer, or
   * sends the demurraged amount directly when routing as ERC1155.
   */
  amount: bigint;
  /**
   * Only relevant when `to` is an organization (the ERC1155 path). When `true`,
   * the avatar's score + Merkle proof is fetched, validated, and attached as
   * the ERC1155 `data` (`abi.encode(score, proof)`) so a policy-aware org can
   * act on it — this requires the avatar to be score-eligible (throws
   * `notEligible` for score 0, `proofStale` on root mismatch). When `false`
   * (default), the ERC1155 transfer carries empty `data` and no proof is
   * fetched. Ignored for non-org (ERC20) transfers, which never carry data.
   *
   * Mutually exclusive with {@link txData}: pass at most one.
   */
  includeProof?: boolean;
  /**
   * Arbitrary bytes to attach as annotation data for the transfer. For
   * organization recipients (ERC1155 path) this is passed verbatim as the
   * `data` argument of `Hub.safeTransferFrom`. For non-org recipients (ERC20
   * path) ERC20 transfers have no `data` slot, so the SDK appends a
   * zero-value `Hub.safeTransferFrom(avatar, to, groupTokenId, 0, txData)` in
   * the same batch so the indexer can pick up the annotation. Encode with
   * {@link encodeCrcV2TransferData} from `@aboutcircles/sdk-utils`.
   *
   * Mutually exclusive with {@link includeProof}: pass at most one (the SDK
   * throws if both are set, since both write the same `data` slot).
   */
  txData?: Uint8Array;
}

/** How `transferGroupCrc()` delivered the group CRC. */
export type TransferGroupCrcMode =
  | 'erc20-inflationary'
  | 'erc20-inflationary-annotated'
  | 'erc1155-after-unwrap';

/** Result of `PermissionlessGroup.transferGroupCrc()`. */
export interface TransferGroupCrcResult {
  /**
   * Ordered transaction batch — submit atomically via the runner. Begins with
   * any consolidation steps (wrap ERC1155 → inflationary; unwrap demurrage
   * ERC20 → wrap → inflationary), then the delivery:
   * - `erc20-inflationary`: `… inflationaryWrapper.transfer(to, inflationaryAmount)`
   * - `erc20-inflationary-annotated`: `… inflationaryWrapper.transfer(to, inflationaryAmount),
   *                                       Hub.safeTransferFrom(avatar, to, groupTokenId, 0, txData)`
   * - `erc1155-after-unwrap`: `… inflationaryWrapper.unwrap(inflationaryAmount),
   *                              Hub.safeTransferFrom(avatar, to, groupTokenId,
   *                                demurragedAmount, abi.encode(score, proof))`
   */
  txs: TransactionRequest[];
  /** Which delivery path was chosen (based on whether `to` is an organization). */
  mode: TransferGroupCrcMode;
}
