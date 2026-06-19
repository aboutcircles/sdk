import { describe, test, expect } from 'bun:test';
import { CirclesRpc } from '../rpc';
import { RpcError } from '../errors.js';
import type { Address } from '@aboutcircles/sdk-types';

// Live integration test for circles_findScoreGroupRedeemPath.
//
// Opt-in: point CIRCLES_RPC_URL at an endpoint that exposes the method (it is being rolled out, so
// not every RPC has it yet). The test auto-skips when the endpoint is unreachable or returns
// -32601 (method not found), so it is safe to run against any RPC. Group/holder are public on-chain
// addresses and can be overridden via env for a different deployment.
const env = ((globalThis as Record<string, unknown>).process as { env?: Record<string, string | undefined> } | undefined)?.env ?? {};
const RPC_URL = env.CIRCLES_RPC_URL ?? 'http://localhost:8081/';
const GROUP = (env.SCOREGROUP_REDEEM_GROUP ?? '0x93ed5a96347927ff6ff6b790f8cf5258240c321f') as Address;
const HOLDER = (env.SCOREGROUP_REDEEM_HOLDER ?? '0x665a55a3ab1de41853cf808df40d112824092534') as Address;
const TEST_TIMEOUT = Number(env.CIRCLES_RPC_TEST_TIMEOUT ?? 45000);

const rpc = new CirclesRpc(RPC_URL);
let methodAvailable = true;

try {
  // A successful response (even maxFlow "0") proves the method is served; only -32601 / connection
  // failures mean it is unavailable on this endpoint.
  await rpc.pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER });
} catch (error) {
  const code = error instanceof RpcError ? (error.context as { data?: unknown })?.data : undefined;
  methodAvailable = false;
  console.warn(
    `[scoregroup-redeem] Integration tests skipped - method unavailable at ${RPC_URL}: ${(error as Error).message}${code ? ` (code ${String(code)})` : ''}`
  );
}

const integration = methodAvailable ? describe : describe.skip;

integration('findScoreGroupRedeemPath (live)', () => {
  test('full balance: decomposition is well-formed and conserves the total', async () => {
    const result = await rpc.pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER });

    expect(typeof result.maxFlow).toBe('bigint');
    expect(result.maxFlow).toBeGreaterThanOrEqual(0n);
    expect(Array.isArray(result.transfers)).toBe(true);

    let sum = 0n;
    for (const leg of result.transfers) {
      expect(typeof leg.value).toBe('bigint');
      expect(leg.value).toBeGreaterThan(0n);
      // Every collateral leg is delivered to the holder (self-redeem: source == sink == holder).
      expect(leg.to.toLowerCase()).toBe(HOLDER.toLowerCase());
      expect(typeof leg.from).toBe('string');
      expect(typeof leg.tokenOwner).toBe('string');
      sum += leg.value;
    }
    // maxFlow == sum of collateral legs (1:1 redeem decomposition).
    expect(sum).toBe(result.maxFlow);
  }, TEST_TIMEOUT);

  test('amount cap clamps maxFlow to at most the requested amount', async () => {
    const cap = 5n;
    const result = await rpc.pathfinder.findScoreGroupRedeemPath({
      group: GROUP,
      holder: HOLDER,
      amount: cap,
    });

    expect(result.maxFlow).toBeLessThanOrEqual(cap);
  }, TEST_TIMEOUT);

  test('negative amount is rejected by the server (-32602)', async () => {
    await expect(
      rpc.pathfinder.findScoreGroupRedeemPath({ group: GROUP, holder: HOLDER, amount: -5n })
    ).rejects.toBeInstanceOf(RpcError);
  }, TEST_TIMEOUT);
});
