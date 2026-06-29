import { describe, test, expect } from 'bun:test';
import type { Address, TokenBalance, TransferStep } from '@aboutcircles/sdk-types';
import { CirclesConverter } from '@aboutcircles/sdk-utils/circlesConverter';
import { PermissionlessGroup } from '../PermissionlessGroup.js';

const GROUP = '0x93eD5A96347927ff6fF6b790F8Cf5258240c321f' as Address;
const HUB = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8' as Address;
const LIFT = '0x5F99a795dD2743C36D63511f0D4bc667e6d3cDB5' as Address;
const SINK = '0xD4cF9afd3aE777C24454b70dd28E32d1bd516F05' as Address;
const AVATAR = '0x1111111111111111111111111111111111111111' as Address;
const V2_HUMAN = '0xAaA0000000000000000000000000000000000001' as Address;
const V1_HUMAN = '0xbBb0000000000000000000000000000000000002' as Address;
// ERC20 wrapper contracts — deliberately != the issuer, to exercise the
// `tokenAddress`-keyed outgoing subtraction.
const DEMURRAGE_WRAPPER = '0xDDD0000000000000000000000000000000000010' as Address;
const INFLATIONARY_WRAPPER = '0xEEE0000000000000000000000000000000000011' as Address;

// Fixed reference instant — only matters for the inflationary (static↔demurraged)
// conversion paths; ERC1155 / demurrage-ERC20 forms carry no conversion.
const NOW = 1_700_000_000n;
const ONE = 10n ** 18n;

function group(): PermissionlessGroup {
  return new PermissionlessGroup({
    groupAddress: GROUP,
    hubAddress: HUB,
    liftERC20Address: LIFT,
    backendBaseUrl: 'http://backend.invalid',
    rpcUrl: 'http://rpc.invalid',
    circlesConfig: {} as never,
  });
}

/** Flexible TokenBalance fixture across all three forms. */
function makeRow(opts: {
  owner: Address;
  tokenAddress?: Address;
  version?: number;
  isErc20?: boolean;
  isInflationary?: boolean;
  atto?: bigint; // demurraged (attoCircles) — used by ERC1155 / demurrage-ERC20
  staticAtto?: bigint; // static (staticAttoCircles) — used by inflationary-ERC20
}): TokenBalance {
  const isErc20 = opts.isErc20 ?? false;
  const isInflationary = opts.isInflationary ?? false;
  const version = opts.version ?? 2;
  return {
    tokenAddress: opts.tokenAddress ?? opts.owner,
    tokenId: opts.owner,
    tokenOwner: opts.owner,
    tokenType: version === 1 ? 'CrcV1_Signup' : 'CrcV2_RegisterHuman',
    version,
    attoCircles: opts.atto ?? 0n,
    circles: 0,
    staticAttoCircles: opts.staticAtto ?? opts.atto ?? 0n,
    staticCircles: 0,
    attoCrc: 0n,
    crc: 0,
    isErc20,
    isErc1155: !isErc20,
    isWrapped: isErc20,
    isInflationary,
    isGroup: false,
  };
}

/** Convenience: a plain ERC1155 row (the common case). */
function row(owner: Address, version: number, atto: bigint): TokenBalance {
  return makeRow({ owner, version, atto });
}

/** A migration pathfinder edge spending `tokenOwner`'s token out of `from`.
 *  Note: the edge's `tokenOwner` is keyed against the row's `tokenAddress`. */
function spend(from: Address, tokenKey: Address, value: bigint): TransferStep {
  return { from, to: SINK, tokenOwner: tokenKey, value };
}

type Entry = { tokenOwner: Address; total: bigint; heldTotal: bigint };
type WithBreakdown = {
  buildPersonalBreakdown(
    avatar: Address,
    held: TokenBalance[],
    transfers: TransferStep[],
    nowUnixSeconds: bigint,
  ): Entry[];
};

describe('buildPersonalBreakdown — v1 filtering', () => {
  test('excludes Circles v1 balances (version === 1), keeps v2', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [row(V2_HUMAN, 2, 5n * ONE), row(V1_HUMAN, 1, 9n * ONE)],
      [],
      NOW,
    );
    expect(out).toHaveLength(1);
    expect(out[0].tokenOwner).toBe(V2_HUMAN);
    expect(out[0].total).toBe(5n * ONE);
    expect(out[0].heldTotal).toBe(5n * ONE);
  });

  test('drops an avatar whose only holding is v1 (no phantom entry)', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(AVATAR, [row(V1_HUMAN, 1, 100n * ONE)], [], NOW);
    expect(out).toHaveLength(0);
  });
});

describe('buildPersonalBreakdown — held vs. live total (ERC1155)', () => {
  test('heldTotal is the raw held; total subtracts the migration outflow', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [row(V2_HUMAN, 2, 5n * ONE)],
      [spend(AVATAR, V2_HUMAN, 2n * ONE)],
      NOW,
    );
    expect(out[0].heldTotal).toBe(5n * ONE);
    expect(out[0].total).toBe(3n * ONE);
  });

  test('heldTotal is independent of the pathfinder result', () => {
    const g = group() as unknown as WithBreakdown;
    const held = [row(V2_HUMAN, 2, 5n * ONE)];
    const noFlow = g.buildPersonalBreakdown(AVATAR, held, [], NOW);
    const someFlow = g.buildPersonalBreakdown(AVATAR, held, [spend(AVATAR, V2_HUMAN, 4n * ONE)], NOW);
    expect(noFlow[0].total).toBe(5n * ONE);
    expect(someFlow[0].total).toBe(1n * ONE);
    expect(noFlow[0].heldTotal).toBe(5n * ONE);
    expect(someFlow[0].heldTotal).toBe(5n * ONE);
  });

  test('a token fully spent by the migration still appears (heldTotal > 0, total = 0)', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [row(V2_HUMAN, 2, 5n * ONE)],
      [spend(AVATAR, V2_HUMAN, 5n * ONE)],
      NOW,
    );
    expect(out).toHaveLength(1);
    expect(out[0].heldTotal).toBe(5n * ONE);
    expect(out[0].total).toBe(0n);
  });
});

describe('buildPersonalBreakdown — inflationary ERC20 (demurrage conversion)', () => {
  test('heldTotal converts static held DOWN to demurraged (and the conversion is non-identity)', () => {
    const g = group() as unknown as WithBreakdown;
    const heldStatic = 5n * ONE;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [makeRow({ owner: V2_HUMAN, tokenAddress: INFLATIONARY_WRAPPER, isErc20: true, isInflationary: true, staticAtto: heldStatic })],
      [],
      NOW,
    );
    const expected = CirclesConverter.attoStaticCirclesToAttoCircles(heldStatic, NOW);
    expect(out).toHaveLength(1);
    expect(out[0].heldTotal).toBe(expected);
    expect(out[0].total).toBe(expected); // no transfers
    expect(expected).not.toBe(heldStatic); // guard: demurrage actually applied at NOW
  });

  test('total subtracts the outflow, converting the demurraged edge UP to static first', () => {
    const g = group() as unknown as WithBreakdown;
    const heldStatic = 5n * ONE;
    const outDemurraged = 1n * ONE;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [makeRow({ owner: V2_HUMAN, tokenAddress: INFLATIONARY_WRAPPER, isErc20: true, isInflationary: true, staticAtto: heldStatic })],
      [spend(AVATAR, INFLATIONARY_WRAPPER, outDemurraged)], // edge keyed on the wrapper
      NOW,
    );
    const outStatic = CirclesConverter.attoCirclesToAttoStaticCircles(outDemurraged, NOW);
    const expectedTotal = CirclesConverter.attoStaticCirclesToAttoCircles(heldStatic - outStatic, NOW);
    const expectedHeld = CirclesConverter.attoStaticCirclesToAttoCircles(heldStatic, NOW);
    expect(out[0].heldTotal).toBe(expectedHeld);
    expect(out[0].total).toBe(expectedTotal);
    expect(out[0].total).toBeLessThan(out[0].heldTotal);
  });
});

describe('buildPersonalBreakdown — demurrage ERC20 & tokenAddress keying', () => {
  test('subtracts the outflow directly (no conversion), keyed on the wrapper tokenAddress', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [makeRow({ owner: V2_HUMAN, tokenAddress: DEMURRAGE_WRAPPER, isErc20: true, atto: 5n * ONE })],
      [spend(AVATAR, DEMURRAGE_WRAPPER, 2n * ONE)],
      NOW,
    );
    expect(out[0].heldTotal).toBe(5n * ONE);
    expect(out[0].total).toBe(3n * ONE);
  });

  test('an edge keyed on the issuer (not the wrapper) does NOT subtract from an ERC20 row', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [makeRow({ owner: V2_HUMAN, tokenAddress: DEMURRAGE_WRAPPER, isErc20: true, atto: 5n * ONE })],
      [spend(AVATAR, V2_HUMAN, 2n * ONE)], // wrong key: issuer, not the wrapper
      NOW,
    );
    expect(out[0].total).toBe(5n * ONE); // untouched
  });
});

describe('buildPersonalBreakdown — aggregation', () => {
  test('one owner across all three forms rolls up into a single demurraged heldTotal', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [
        makeRow({ owner: V2_HUMAN, atto: 2n * ONE }), // ERC1155
        makeRow({ owner: V2_HUMAN, tokenAddress: DEMURRAGE_WRAPPER, isErc20: true, atto: 3n * ONE }),
        makeRow({ owner: V2_HUMAN, tokenAddress: INFLATIONARY_WRAPPER, isErc20: true, isInflationary: true, staticAtto: 4n * ONE }),
      ],
      [],
      NOW,
    );
    expect(out).toHaveLength(1);
    const expected = 2n * ONE + 3n * ONE + CirclesConverter.attoStaticCirclesToAttoCircles(4n * ONE, NOW);
    expect(out[0].heldTotal).toBe(expected);
    expect(out[0].total).toBe(expected);
  });

  test('personalHeldTotal (sum of heldTotal) is stable while personalTotal drifts', () => {
    const g = group() as unknown as WithBreakdown;
    const held = [
      row(V2_HUMAN, 2, 5n * ONE),
      row('0xCcc0000000000000000000000000000000000003' as Address, 2, 3n * ONE),
    ];
    const a = g.buildPersonalBreakdown(AVATAR, held, [], NOW);
    const b = g.buildPersonalBreakdown(AVATAR, held, [spend(AVATAR, V2_HUMAN, 2n * ONE)], NOW);
    const heldSum = (xs: Entry[]) => xs.reduce((s, x) => s + x.heldTotal, 0n);
    const totalSum = (xs: Entry[]) => xs.reduce((s, x) => s + x.total, 0n);
    expect(heldSum(a)).toBe(8n * ONE);
    expect(heldSum(b)).toBe(8n * ONE);
    expect(totalSum(a)).toBe(8n * ONE);
    expect(totalSum(b)).toBe(6n * ONE);
  });
});
