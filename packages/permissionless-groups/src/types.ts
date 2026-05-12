import type { Address, Hex, ContractRunner } from '@aboutcircles/sdk-types';

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
 * No separate verifier contract: the policy holds the SMT root itself via
 * `merkleRoots(group)`, so freshness is checked against the policy directly.
 */
export interface PermissionlessGroupConfig {
  /** The score-gated group avatar address. */
  groupAddress: Address;
  /** Hub V2 contract address (prod Gnosis Hub for staging+prod). */
  hubAddress: Address;
  /**
   * ScoreGatedMintPolicy address. Must be the policy currently registered for
   * `groupAddress` on `hubAddress` (i.e. `Hub.mintPolicies(group)` returns it).
   */
  mintPolicyAddress: Address;
  /** Base URL of the score-groups backend, e.g. `https://host/score-groups` (no trailing slash). */
  backendBaseUrl: string;
  /** JSON-RPC endpoint for read calls. */
  rpcUrl: string;
  /** Runner that signs and submits the mint batch. */
  runner: ContractRunner;
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

export interface MintResult {
  /**
   * Transaction receipt from the batched runner call
   * (snapshot, personalMint, groupMint, wrap).
   */
  receipt: unknown;
  /** Proof used for the mint. */
  proof: ProofResponse;
  /**
   * Atto-CRC actually submitted to `groupMint`. Identical to the input
   * `amount` except `0n` ("mint max") is replaced with the resolved cap.
   */
  amount: bigint;
}
