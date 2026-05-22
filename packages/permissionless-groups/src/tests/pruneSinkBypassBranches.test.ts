import { describe, test, expect } from 'bun:test';
import { pruneSinkBypassBranches } from '../PermissionlessGroup.js';
import type { Address, PathfindingResult, TransferStep } from '@aboutcircles/sdk-types';

const SINK = '0x0000000000000000000000000000000000000001' as Address;
const GROUP = '0x0000000000000000000000000000000000000002' as Address;
const SAFE = '0x0000000000000000000000000000000000000003' as Address;
const ROUTER = '0x0000000000000000000000000000000000000004' as Address;
const HOLDER = '0x0000000000000000000000000000000000000005' as Address;
const OTHER = '0x0000000000000000000000000000000000000006' as Address;

function step(
  from: Address,
  to: Address,
  tokenOwner: Address,
  value: bigint
): TransferStep {
  return { from, to, tokenOwner, value };
}

function pathOf(transfers: TransferStep[]): PathfindingResult {
  // maxFlow = sum of edges landing at SINK
  let maxFlow = 0n;
  for (const t of transfers) if (t.to.toLowerCase() === SINK.toLowerCase()) maxFlow += t.value;
  return { maxFlow, transfers };
}

describe('pruneSinkBypassBranches', () => {
  test('no-op when there are no bypass edges', () => {
    const path = pathOf([
      step(SAFE, ROUTER, SAFE, 100n),
      step(ROUTER, GROUP, SAFE, 100n),
      step(GROUP, SINK, GROUP, 100n),
    ]);
    const out = pruneSinkBypassBranches(path, path, SINK, GROUP);
    expect(out.prunedAmount).toBe(0n);
    expect(out.path.transfers).toEqual(path.transfers);
    expect(out.path.maxFlow).toBe(100n);
  });

  test('full drop: predecessor edge exactly matches bypass amount', () => {
    // SAFE -> HOLDER (group token, 50) -> SINK (bypass)
    // Plus a legitimate parallel flow.
    const path = pathOf([
      step(SAFE, HOLDER, GROUP, 50n), // funds the bypass
      step(HOLDER, SINK, GROUP, 50n), // BYPASS (HOLDER is not GROUP)
      step(SAFE, ROUTER, SAFE, 100n),
      step(ROUTER, GROUP, SAFE, 100n),
      step(GROUP, SINK, GROUP, 100n),
    ]);
    const out = pruneSinkBypassBranches(path, path, SINK, GROUP);
    expect(out.prunedAmount).toBe(50n);
    // The bypass + its sole funder are gone; legitimate flow preserved.
    expect(out.path.transfers).toEqual([
      step(SAFE, ROUTER, SAFE, 100n),
      step(ROUTER, GROUP, SAFE, 100n),
      step(GROUP, SINK, GROUP, 100n),
    ]);
    expect(out.path.maxFlow).toBe(100n);
  });

  test('partial drop: predecessor edge funds bypass + something else', () => {
    // SAFE -> HOLDER (group token, 70). HOLDER sends 50 to SINK (bypass)
    // and 20 to OTHER (legit downstream). The funder must NOT be fully
    // dropped — only the 50-bypass share — or the legit OTHER hop loses
    // its inflow and HOLDER's net breaks.
    const path = pathOf([
      step(SAFE, HOLDER, GROUP, 70n), // funds bypass(50) + legit(20)
      step(HOLDER, SINK, GROUP, 50n), // BYPASS
      step(HOLDER, OTHER, GROUP, 20n), // LEGIT — must survive (no bypass marker since OTHER != SINK)
    ]);
    const out = pruneSinkBypassBranches(path, path, SINK, GROUP);
    expect(out.prunedAmount).toBe(50n);
    // Funder edge value reduced from 70 -> 20; bypass dropped; legit preserved.
    expect(out.path.transfers).toEqual([
      step(SAFE, HOLDER, GROUP, 20n),
      step(HOLDER, OTHER, GROUP, 20n),
    ]);
    // HOLDER net: +20 in, -20 out → zero. SAFE net: -20 (reduced from -70).
    expect(out.path.maxFlow).toBe(0n);
  });

  test('multi-hop full drops chain back to source', () => {
    // SAFE -> A -> B -> SINK (all group token, 30). All edges drop, no
    // leftover, no thrown errors.
    const A = '0x000000000000000000000000000000000000000a' as Address;
    const B = '0x000000000000000000000000000000000000000b' as Address;
    const path = pathOf([
      step(SAFE, A, GROUP, 30n),
      step(A, B, GROUP, 30n),
      step(B, SINK, GROUP, 30n),
    ]);
    const out = pruneSinkBypassBranches(path, path, SINK, GROUP);
    expect(out.prunedAmount).toBe(30n);
    expect(out.path.transfers).toEqual([]);
    expect(out.path.maxFlow).toBe(0n);
  });

  test('bypass with token-owner != GROUP is not pruned (sanity)', () => {
    // Vertex sends to SINK but tokenOwner is SAFE's personal CRC, not the
    // group token. This isn't a "bypass" by the function's definition.
    const path = pathOf([
      step(SAFE, HOLDER, SAFE, 50n),
      step(HOLDER, SINK, SAFE, 50n),
    ]);
    const out = pruneSinkBypassBranches(path, path, SINK, GROUP);
    expect(out.prunedAmount).toBe(0n);
    expect(out.path.transfers).toEqual(path.transfers);
  });

  test('does NOT throw when predecessor edge exceeds bypass (partial-drop case)', () => {
    // This is the case the old implementation threw on. Verify the new
    // implementation handles it via partial drop instead of bailing out.
    const path = pathOf([
      step(SAFE, HOLDER, GROUP, 1000n), // way more than the bypass needs
      step(HOLDER, SINK, GROUP, 5n), // tiny bypass
      step(HOLDER, OTHER, GROUP, 995n), // legitimate larger outflow
    ]);
    expect(() => pruneSinkBypassBranches(path, path, SINK, GROUP)).not.toThrow();
    const out = pruneSinkBypassBranches(path, path, SINK, GROUP);
    expect(out.prunedAmount).toBe(5n);
    // Funder edge: 1000 - 5 = 995. Legit outflow preserved.
    expect(out.path.transfers).toEqual([
      step(SAFE, HOLDER, GROUP, 995n),
      step(HOLDER, OTHER, GROUP, 995n),
    ]);
    expect(out.path.maxFlow).toBe(0n);
  });
});
