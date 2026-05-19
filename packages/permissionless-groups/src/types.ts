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
  /**
   * Maximum time (ms) to spend polling the on-chain root before giving up.
   * Default 120_000 (2 min). Set to 0 to disable polling entirely (one check,
   * then fail).
   */
  rootPollTimeoutMs?: number;
  /**
   * How often (ms) to re-read `policy.merkleRoots(group)` while waiting for
   * the publisher to push the backend's proof root. Default 3000 (3s).
   */
  rootPollIntervalMs?: number;
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
   * Atto-CRC to migrate. Omit to migrate the maximum the pathfinder can source
   * from this avatar (any reachable CRC except already-migrated ScoreGroup CRC).
   * Pathfinder will refuse if a specified amount cannot be sourced.
   */
  amount?: bigint;
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
   * Atto-CRC routed into the SinkWrapper. Identical to the input `amount`
   * except when omitted ("migrate max") — then it's the resolved max-flow.
   */
  amount: bigint;
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
