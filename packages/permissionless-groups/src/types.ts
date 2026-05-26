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
 * Result of `PermissionlessGroup.balance()` — the avatar's current group CRC
 * across all three forms PLUS the amount still migratable from legacy CRC, all
 * normalized to **demurraged** atto-CRC so the figures are summable.
 *
 * For the raw per-form breakdown + wrapper addresses, see
 * `PermissionlessGroup.balanceBreakdown()` ({@link BalanceResult}).
 */
export interface GroupCrcBalance {
  /** ERC1155 group-CRC the avatar holds (demurraged). */
  erc1155: bigint;
  /** Demurrage-wrapper ERC20 balance (demurraged). */
  demurrageErc20: bigint;
  /** Inflationary-wrapper ERC20 balance, converted to demurraged for summing. */
  inflationaryErc20: bigint;
  /** Sum of the three held forms (demurraged) — what the avatar holds right now. */
  heldTotal: bigint;
  /** Amount still migratable from legacy CRC (pathfinder, maxEdges 100; demurraged). */
  migratable: bigint;
  /** `heldTotal + migratable` (demurraged) — the avatar's full reachable group CRC. */
  total: bigint;
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
   * Cap the number of flow edges in the resulting `operateFlowMatrix`,
   * forwarded directly to the pathfinder's `maxTransfers`. Lower values give
   * a smaller, cheaper batch at a marginal cost to the migrated amount.
   * Omit for the pathfinder's natural plan.
   */
  maxEdges?: number;
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
}

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
   */
  includeProof?: boolean;
}

/** How `transferGroupCrc()` delivered the group CRC. */
export type TransferGroupCrcMode = 'erc20-inflationary' | 'erc1155-after-unwrap';

/** Result of `PermissionlessGroup.transferGroupCrc()`. */
export interface TransferGroupCrcResult {
  /**
   * Ordered transaction batch — submit atomically via the runner. Begins with
   * any consolidation steps (wrap ERC1155 → inflationary; unwrap demurrage
   * ERC20 → wrap → inflationary), then the delivery:
   * - `erc20-inflationary`: `… inflationaryWrapper.transfer(to, inflationaryAmount)`
   * - `erc1155-after-unwrap`: `… inflationaryWrapper.unwrap(inflationaryAmount),
   *                              Hub.safeTransferFrom(avatar, to, groupTokenId,
   *                                demurragedAmount, abi.encode(score, proof))`
   */
  txs: TransactionRequest[];
  /** Which delivery path was chosen (based on whether `to` is an organization). */
  mode: TransferGroupCrcMode;
}
