import { describe, test, expect } from 'bun:test';
import type { RpcClient } from '../client.js';
import { PathfinderMethods } from '../methods/pathfinder.js';
import { checksumAddress } from '../utils.js';
import type { Address } from '@aboutcircles/sdk-types';

// Mixed-case-checksum addresses so we can prove the result is checksummed (not echoed lowercase).
const GROUP = '0x93ed5a96347927ff6ff6b790f8cf5258240c321f' as Address;
const HOLDER = '0x665a55a3ab1de41853cf808df40d112824092534' as Address;
const TREASURY = '0xe445d6f2c5af0b0c6f9b9b9b9b9b9b9b9b9b41ce' as Address;
const COLLATERAL = '0x8b8837e3a2c0f9b9b9b9b9b9b9b9b9b9b9b9e3a2' as Address;

/**
 * Build a PathfinderMethods backed by a stub client that records the last call and
 * returns a canned server-shaped (all-strings) MaxFlowResponse.
 */
function makePathfinder(serverResult: Record<string, unknown>) {
  const calls: { method: string; params: unknown }[] = [];
  const stub = {
    call: async (method: string, params: unknown) => {
      calls.push({ method, params });
      return serverResult;
    },
  } as unknown as RpcClient;
  return { pathfinder: new PathfinderMethods(stub), calls };
}

const ONE_LEG_RESULT = {
  maxFlow: '75',
  transfers: [
    { from: TREASURY, to: HOLDER, tokenOwner: COLLATERAL, value: '75' },
  ],
};

describe('PathfinderMethods.findScoreGroupRedeemPath', () => {
  test('calls circles_findScoreGroupRedeemPath with positional params', async () => {
    const { pathfinder, calls } = makePathfinder(ONE_LEG_RESULT);

    await pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER });

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('circles_findScoreGroupRedeemPath');
    expect(Array.isArray(calls[0].params)).toBe(true);
  });

  test('omits the trailing amount when undefined', async () => {
    const { pathfinder, calls } = makePathfinder(ONE_LEG_RESULT);

    await pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER });

    // [group, holder] — no third element, so the server applies its full-balance default.
    expect(calls[0].params).toEqual([GROUP.toLowerCase(), HOLDER.toLowerCase()]);
  });

  test('includes amount as a decimal string when provided', async () => {
    const { pathfinder, calls } = makePathfinder(ONE_LEG_RESULT);

    await pathfinder.findScoreGroupRedeemPath({
      group: GROUP,
      holder: HOLDER,
      amount: 1000000000000000000n,
    });

    expect(calls[0].params).toEqual([
      GROUP.toLowerCase(),
      HOLDER.toLowerCase(),
      '1000000000000000000',
    ]);
  });

  test('serializes amount === 0n explicitly (not omitted)', async () => {
    const { pathfinder, calls } = makePathfinder({ maxFlow: '0', transfers: [] });

    await pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER, amount: 0n });

    // 0n is a real cap (redeem nothing), distinct from "omitted" → must be sent as "0".
    expect(calls[0].params).toEqual([GROUP.toLowerCase(), HOLDER.toLowerCase(), '0']);
  });

  test('lowercases mixed-case input addresses on the wire', async () => {
    const { pathfinder, calls } = makePathfinder(ONE_LEG_RESULT);

    await pathfinder.findScoreGroupRedeemPath({
      group: checksumAddress(GROUP),
      holder: checksumAddress(HOLDER),
    });

    const params = calls[0].params as string[];
    expect(params[0]).toBe(GROUP.toLowerCase());
    expect(params[1]).toBe(HOLDER.toLowerCase());
  });

  test('parses string amounts to bigint and checksums addresses in the result', async () => {
    const { pathfinder } = makePathfinder(ONE_LEG_RESULT);

    const result = await pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER });

    expect(typeof result.maxFlow).toBe('bigint');
    expect(result.maxFlow).toBe(75n);
    expect(result.transfers).toHaveLength(1);
    expect(typeof result.transfers[0].value).toBe('bigint');
    expect(result.transfers[0].value).toBe(75n);
    // Addresses come back EIP-55 checksummed, identical to findPath's post-processing.
    expect(result.transfers[0].from).toBe(checksumAddress(TREASURY));
    expect(result.transfers[0].to).toBe(checksumAddress(HOLDER));
    expect(result.transfers[0].tokenOwner).toBe(checksumAddress(COLLATERAL));
  });

  test('handles an empty redeem (no entitlement / nothing to redeem)', async () => {
    const { pathfinder } = makePathfinder({ maxFlow: '0', transfers: [] });

    const result = await pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER });

    expect(result.maxFlow).toBe(0n);
    expect(result.transfers).toEqual([]);
  });
});
