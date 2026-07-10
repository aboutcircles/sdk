import { describe, test, expect } from 'bun:test';
import type { Address } from '@aboutcircles/sdk-types';
import { PermissionlessGroup } from '../PermissionlessGroup.js';
import type { ProofResponse } from '../types.js';

const GROUP = '0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c' as Address;
const HUB = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8' as Address;
const LIFT = '0x5F99a795dD2743C36D63511f0D4bc667e6d3cDB5' as Address;
const AVATAR = '0x4d825a98ee3e4801e39f2de6dd16184de2285ce4' as Address;

/** Build a complete ProofResponse with an overridable `scoreRaw`. */
function proofWith(scoreRaw: string): ProofResponse {
  return {
    groupAddress: GROUP,
    userAddress: AVATAR,
    value: '0x00',
    scoreRaw,
    proof: '0x',
    root: '0x1234',
    depth: 160,
    publishStatus: 'published',
    rootPublishedAt: '2026-06-18T00:00:00.000Z',
    lastHeadChangedAt: '2026-06-18T00:00:00.000Z',
    nextHeadEarliestAt: null,
    publishCadenceSeconds: 300,
    serverTime: '2026-06-18T00:00:01.000Z',
    proofValidityModel: 'single-root',
  };
}

/**
 * Construct a PermissionlessGroup with the on-chain/backend seams stubbed.
 * The constructor only stores addresses (no network), so we can override the
 * public `client`/`hub` fields on the instance to drive `mint()` deterministically.
 */
function makeGroup(opts: { scoreRaw: string; issuance: bigint }): PermissionlessGroup {
  const pg = new PermissionlessGroup({
    groupAddress: GROUP,
    hubAddress: HUB,
    liftERC20Address: LIFT,
    backendBaseUrl: 'http://backend.invalid',
    rpcUrl: 'http://rpc.invalid',
    circlesConfig: {} as never,
  });

  // Backend proof fetch.
  (pg as { client: unknown }).client = {
    getProof: async () => proofWith(opts.scoreRaw),
  };

  // Stub every on-chain call the mint paths reach. `calculateIssuance` returns
  // a tuple whose first element is the issuance; the tx-builders just return
  // recognizable TransactionRequests so we can assert batch shape.
  (pg as { hub: unknown }).hub = {
    calculateIssuance: async () => [opts.issuance],
    isTrusted: async () => true, // skip the optional group.trust() prefix
    personalMint: () => ({ to: HUB, data: '0xpersonalmint' }),
    groupMint: () => ({ to: HUB, data: '0xgroupmint' }),
    wrap: () => ({ to: HUB, data: '0xwrap' }),
  };

  // Pre-resolve the policy so `policy()` skips the mintPolicies() lookup.
  // `policyPromise` is private, so cast through `unknown`.
  (pg as unknown as { policyPromise: unknown }).policyPromise = Promise.resolve({
    snapshotIssuance: () => ({ to: HUB, data: '0xsnapshot' }),
  });

  return pg;
}

describe('PermissionlessGroup.mint() — empty-state handling', () => {
  test('mint-max with zero claimable issuance returns an empty batch, not an error', async () => {
    // score > 0 (eligible) but no accrued issuance → (issuance × score) / 100 == 0.
    const pg = makeGroup({ scoreRaw: '50', issuance: 0n });

    const result = await pg.mint({ avatar: AVATAR }); // amount omitted = mint max

    expect(result.amount).toBe(0n);
    expect(result.txs).toHaveLength(0);
    expect(result.proof.scoreRaw).toBe('50');
  });

  test('score 0 still returns the personalMint-only batch (unchanged path)', async () => {
    const pg = makeGroup({ scoreRaw: '0', issuance: 100n });

    const result = await pg.mint({ avatar: AVATAR });

    expect(result.amount).toBe(0n);
    expect(result.txs).toHaveLength(1);
  });

  test('tiny issuance that floors the mintable to 0 is treated as empty, not an error', async () => {
    // issuance × score < 100 → integer division floors to 0. Must not throw.
    const pg = makeGroup({ scoreRaw: '1', issuance: 50n });

    const result = await pg.mint({ avatar: AVATAR });

    expect(result.amount).toBe(0n);
    expect(result.txs).toHaveLength(0);
  });

  test('non-zero claimable issuance still builds the full mint batch (short-circuit does not fire)', async () => {
    // issuance 1000 × score 50 / 100 = 500 → a real mint.
    const pg = makeGroup({ scoreRaw: '50', issuance: 1000n });

    const result = await pg.mint({ avatar: AVATAR });

    expect(result.amount).toBe(500n);
    // snapshotIssuance → personalMint → groupMint → wrap (no trust prefix here).
    expect(result.txs).toHaveLength(4);
  });

  test('explicit amount > 0 is honored regardless of issuance', async () => {
    const pg = makeGroup({ scoreRaw: '50', issuance: 1000n });

    const result = await pg.mint({ avatar: AVATAR, amount: 123n });

    expect(result.amount).toBe(123n);
    expect(result.txs).toHaveLength(4);
  });
});
