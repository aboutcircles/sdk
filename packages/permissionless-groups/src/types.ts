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
 * Per-collateral diagnostics returned alongside the migration tx batch — one
 * entry per distinct collateral avatar that fed the destination router.
 */
export interface MigrationCollateralReport {
  /** Collateral avatar (== token owner — token id is `uint256(uint160(avatar))`). */
  collateral: Address;
  /** Amount the original pathfinder result routed through this collateral. */
  pathAmount: bigint;
  /** Backend-reported cap (`leftToMintEffective`). `null` when the backend cell errored. */
  cap: bigint | null;
  /** Amount actually routed through this collateral after pruning. */
  finalAmount: bigint;
  /** True when `pathAmount > cap` and we had to scale this branch down. */
  capped: boolean;
}

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
 * Result of `PermissionlessGroup.balance()` — an avatar's holdings of the
 * group's token in all three forms.
 *
 * Note: `erc1155` and `demurrageWrapper` share the same demurraged unit, while
 * `inflationary` is in inflationary atto-CRC (different time-units). Don't
 * blindly sum them — convert via `CirclesConverter` first if you need a total.
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
 * Parameters for `PermissionlessGroup.migration()` — moves the avatar's legacy
 * GnosisGroup CRC into the destination ScoreGroup via the SinkWrapper.
 */
export interface MigrationParams {
  /** Avatar holding the legacy GnosisGroup CRC (and the recipient of the wrapped ERC20). */
  avatar: Address;
  /**
   * Atto-CRC to migrate. Optional — when omitted, the SDK runs a two-stage
   * pathfinder probe: first `findPath(MAX_FLOW)` to discover the headline
   * number, then a second `findPath(headline)` for a feasible plan. The
   * indirection is necessary because the pathfinder over-commits
   * intermediate balances when given its `MAX_FLOW` sentinel (it doesn't
   * enforce that intermediates actually hold the routed token in the
   * required quantity), but is reliable for concrete targets. When
   * supplied, `amount` is forwarded verbatim to the pathfinder as
   * `targetFlow`; the pathfinder refuses if it can't be sourced.
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
}


/**
 * Result of `PermissionlessGroup.migratableAmount()` — same pruning pipeline
 * as `migration()` but stops short of building the tx batch. Use this to
 * show "you could migrate up to X CRC" in a UI before the user commits.
 *
 * Note these numbers reflect the chain + pathfinder state *at query time*.
 * The actual `migration()` call re-queries the pathfinder; if the chain
 * has moved, the executed amount may differ slightly (typically within the
 * 10 bp pathfinder buffer baked into the SDK).
 */
export interface MigratableAmountResult {
  /**
   * Atto-CRC the SDK would route into the SinkWrapper if `migration()` were
   * called now. Already net of bypass-branch pruning and per-collateral cap
   * scaling. `0n` when there's nothing migratable.
   */
  amount: bigint;
  /** Raw pathfinder `MAX_FLOW` probe — the headline before any pruning. */
  probedMaxFlow: bigint;
  /** Atto-CRC of sink-bypass branches removed from the pathfinder's plan. */
  bypassPruned: bigint;
  /** Per-collateral diagnostics (same shape as `MigrationResult.collaterals`). */
  collaterals: MigrationCollateralReport[];
}

/**
 * Result of `PermissionlessGroup.migrationRaw()` — pathfinder output handed
 * straight to the flow-matrix builder, no pruning. Use this when you want
 * to debug the pathfinder in isolation or know the path is feasible (e.g.
 * a fixed-amount mint well below caps).
 */
export interface MigrationRawResult {
  /** Ordered transaction batch — submit atomically via the runner. */
  txs: TransactionRequest[];
  /** Atto-CRC the pathfinder routed into the SinkWrapper. */
  amount: bigint;
}

/** Result of `PermissionlessGroup.migration()`. */
export interface MigrationResult {
  /**
   * Ordered transaction batch — submit atomically via the runner. Built by
   * `TransferBuilder` (self-approval if needed, optional unwraps,
   * `operateFlowMatrix`, optional re-wraps).
   */
  txs: TransactionRequest[];
  /**
   * Atto-CRC routed into the SinkWrapper after all pruning. May be strictly
   * less than the pathfinder's reported max because of bypass branches /
   * per-collateral cap / max-flow factor.
   */
  amount: bigint;
  /**
   * Atto-CRC the pathfinder produced before any pruning. When the SDK ran
   * the two-stage probe (max-flow mode), this is the feasible-target path's
   * `maxFlow` (already after the `maxFlowFactor` shrink), not the headline
   * MAX_FLOW probe — that's reported separately as `probedMaxFlow`.
   */
  requestedAmount: bigint;
  /**
   * Only populated in max-flow mode (when `params.amount` was omitted): the
   * headline number from the initial MAX_FLOW probe, before the
   * `maxFlowFactor` shrink. `null` otherwise.
   */
  probedMaxFlow: bigint | null;
  /**
   * Atto-CRC removed from the pathfinder's plan because it would have been
   * deposited into the SinkWrapper from an avatar OTHER than the score group
   * (a bypass branch — the sink only accepts group-CRC deposits via the
   * canonical `router → group → sink` chain). 0n when the path was clean.
   */
  bypassPruned: bigint;
  /**
   * One entry per distinct collateral avatar that contributed to the path.
   * `capped: true` flags the collaterals that forced the global scale-down.
   * Useful for surfacing "you would migrate X CRC, capped to Y because of
   * collateral Z" in the UI.
   */
  collaterals: MigrationCollateralReport[];
}

export interface MintResult {
  /**
   * Ordered transaction batch — submit these atomically (e.g. Safe multisend)
   * for the mint to succeed. Order:
   *   1. policy.snapshotIssuance()
   *   2. Hub.personalMint()
   *   3. Hub.groupMint(group, [avatar], [amount], abi.encode(score, proof))
   *   4. Hub.wrap(group, amount, CirclesType.Inflation)
   */
  txs: TransactionRequest[];
  /** Proof used to build the batch. */
  proof: ProofResponse;
  /**
   * Atto-CRC encoded into `groupMint` and `wrap`. Identical to the input
   * `amount` except `0n`/omitted ("mint max") is replaced with the resolved cap.
   */
  amount: bigint;
}
