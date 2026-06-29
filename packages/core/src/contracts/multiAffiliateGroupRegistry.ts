import { Contract } from './contract.js';
import { multiAffiliateGroupRegistryAbi } from '@aboutcircles/sdk-abis';
import { AFFILIATE_GROUP_LIST_SENTINEL, isZeroAddress, hexEq } from '@aboutcircles/sdk-utils';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';

/**
 * Defensive bound on the affiliate-group linked-list walk in {@link
 * MultiAffiliateGroupRegistryContract.affiliateGroups}. An avatar's list is tiny in
 * practice (each entry is one signalled community), so this only guards against a
 * malformed/cyclic on-chain state — it never truncates a real list.
 */
const MAX_LIST_WALK = 1000;

/**
 * MultiAffiliateGroupRegistry Contract Wrapper (GA 2.0 "communities").
 *
 * Lets a human avatar maintain its own list of affiliate groups it has signalled
 * on-chain intent to join. The registry stores **intent only** — it does not enforce
 * the membership-fee cap or any group criteria (those are computed off-chain: fees from
 * the group profile, served by `circles_getAffiliateGroup*`, and trust by the TMS).
 *
 * This wrapper produces the write calldata ({@link addAffiliateGroup} /
 * {@link removeAffiliateGroup}) and offers thin on-chain reads ({@link isAffiliated},
 * {@link affiliateGroups}) straight from the registry. For an enriched / paginated read
 * (group names, fees, trusted-subset), prefer the RPC methods on `CirclesRpc.affiliate`,
 * which hit the indexer instead of walking the list one `eth_call` at a time.
 *
 * The on-chain Hub is a hardcoded constant (the Gnosis production Hub), so the registry
 * is Gnosis-mainnet only. Construct it with {@link MULTI_AFFILIATE_GROUP_REGISTRY}.
 */
export class MultiAffiliateGroupRegistryContract extends Contract<typeof multiAffiliateGroupRegistryAbi> {
  constructor(config: { address: Address; rpcUrl: string }) {
    super({
      address: config.address,
      abi: multiAffiliateGroupRegistryAbi,
      rpcUrl: config.rpcUrl,
    });
  }

  /**
   * Signal the caller's on-chain intent to join `group` (`addAffiliateGroup`).
   *
   * The caller (tx sender) must be a Hub-registered human and `group` a Hub-registered
   * group, or the tx reverts (`OnlyHuman` / `AffiliateGroupNotExist`). Idempotent on-chain:
   * re-adding a group already in the caller's list is a no-op — the tx still succeeds, but
   * emits no event and changes no state. The membership-fee 100% cap is **not** enforced
   * here; gate it client-side via `CirclesRpc.affiliate.getAffiliateGroupFeesPercentage`.
   *
   * @param group The Circles group to affiliate the caller with
   * @returns Transaction request (caller signs & sends from the avatar)
   */
  addAffiliateGroup(group: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('addAffiliateGroup', [group]),
      value: BigInt(0),
    };
  }

  /**
   * Withdraw the caller's intent to join `group` (`removeAffiliateGroup`).
   *
   * Reverts `AffiliateGroupNotExist` when `group` is not currently in the caller's list,
   * so preflight with {@link isAffiliated} when a no-op revert is undesirable.
   *
   * @param group The Circles group to remove from the caller's list
   * @returns Transaction request (caller signs & sends from the avatar)
   */
  removeAffiliateGroup(group: Address): TransactionRequest {
    return {
      to: this.address,
      data: this.encodeWrite('removeAffiliateGroup', [group]),
      value: BigInt(0),
    };
  }

  /**
   * Whether `avatar` currently lists `group` as an affiliate group (on-chain intent).
   *
   * One `eth_call`: a group present in the list has a non-zero linked-list successor,
   * an absent group reads the mapping's zero default. This is the same test the contract
   * uses to decide whether an add is redundant, so it doubles as a preflight for both
   * "will my `addAffiliateGroup` be a no-op" and "will my `removeAffiliateGroup` revert".
   *
   * @param avatar The avatar that owns the list
   * @param group The group to check for membership
   */
  async isAffiliated(avatar: Address, group: Address): Promise<boolean> {
    const next = (await this.read('affiliateGroupList', [avatar, group])) as Address;
    return !isZeroAddress(next);
  }

  /**
   * The avatar's affiliate groups read **directly from chain**, most-recently-added
   * first (the list is prepend-ordered). Returns `[]` for an empty list.
   *
   * Walks the per-avatar linked list one `eth_call` per entry (head + one per group),
   * so it's chattier than the indexer-backed `CirclesRpc.affiliate.getAffiliateGroupWishlist`
   * — use this only when you need the unindexed on-chain truth (e.g. before the indexer
   * has caught up, or with no RPC). The walk is bounded by {@link MAX_LIST_WALK}.
   *
   * @param avatar The avatar whose intent list to read
   */
  async affiliateGroups(avatar: Address): Promise<Address[]> {
    const groups: Address[] = [];
    let node = (await this.read('affiliateGroupList', [avatar, AFFILIATE_GROUP_LIST_SENTINEL])) as Address;

    for (let i = 0; i < MAX_LIST_WALK; i++) {
      // Empty list (head == 0) or wrapped back to the sentinel tail → done.
      if (isZeroAddress(node) || hexEq(node, AFFILIATE_GROUP_LIST_SENTINEL)) break;
      groups.push(node);
      node = (await this.read('affiliateGroupList', [avatar, node])) as Address;
    }

    return groups;
  }

  /**
   * The account allowed to seed the registry via `initialize` (the deploying account).
   * @returns The deployer address
   */
  async deployer(): Promise<Address> {
    return this.read('deployer') as Promise<Address>;
  }

  /**
   * Whether one-time seeding has been permanently locked (`initialize` disabled).
   * @returns `true` once `lockInitialization` has been called
   */
  async isInitialized(): Promise<boolean> {
    return this.read('isInitialized') as Promise<boolean>;
  }
}
