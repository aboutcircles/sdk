import { describe, test, expect } from 'bun:test';
import type { Address, TransactionRequest } from '@aboutcircles/sdk-types';
import { PermissionlessGroup } from '../PermissionlessGroup.js';
import type {
  MigrationParams,
  MigrationResult,
  MigrationAttempt,
  MigrationRetryResult,
} from '../types.js';

const GROUP = '0x93eD5A96347927ff6fF6b790F8Cf5258240c321f' as Address;
const HUB = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8' as Address;
const LIFT = '0x5F99a795dD2743C36D63511f0D4bc667e6d3cDB5' as Address;
const AVATAR = '0x1111111111111111111111111111111111111111' as Address;

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

const TX: TransactionRequest = { to: HUB, data: '0x', value: 0n };

/** Stub `migration()` so the retry logic runs with no network. Returns the
 *  sequence of `maxEdges` it was called with. */
function stubMigration(
  g: PermissionlessGroup,
  impl: (p: MigrationParams) => MigrationResult | Promise<MigrationResult>,
): number[] {
  const seenEdges: number[] = [];
  (g as unknown as {
    migration: (p: MigrationParams) => Promise<MigrationResult>;
  }).migration = async (p: MigrationParams) => {
    seenEdges.push(p.maxEdges ?? -1);
    return impl(p);
  };
  return seenEdges;
}

function expectSuccess<T>(
  r: MigrationRetryResult<T>,
): Extract<MigrationRetryResult<T>, { success: true }> {
  expect(r.success).toBe(true);
  if (!r.success) throw new Error('expected success');
  return r;
}
function expectFailure<T>(
  r: MigrationRetryResult<T>,
): Extract<MigrationRetryResult<T>, { success: false }> {
  expect(r.success).toBe(false);
  if (r.success) throw new Error('expected failure');
  return r;
}

describe('migrateWithRetry — happy path & hop reduction', () => {
  test('re-queries and shrinks the edge cap on each revert, then succeeds', async () => {
    const g = group();
    const caps = stubMigration(g, (p) => ({
      txs: [TX],
      amount: 100n,
      edges: p.maxEdges ?? 0,
    }));

    let submitCalls = 0;
    const res = await g.migrateWithRetry(
      { avatar: AVATAR },
      async () => {
        submitCalls += 1;
        if (submitCalls < 3) throw new Error('operateFlowMatrix reverted: ERC1155InsufficientBalance');
        return 'TXHASH';
      },
      { startEdges: 40, reductionFactor: 0.5, minEdges: 5 },
    );

    const ok = expectSuccess(res);
    expect(ok.result).toBe('TXHASH');
    expect(ok.amount).toBe(100n);
    expect(caps).toEqual([40, 20, 10]);
    expect(ok.attempts).toHaveLength(3);
    expect(ok.attempts[0].error).toContain('ERC1155InsufficientBalance');
    expect(ok.attempts[2].error).toBeUndefined();
  });

  test('next cap is keyed on the route’s ACTUAL edge count, not the requested cap', async () => {
    const g = group();
    // Requested cap is 40, but the built route only uses 12 edges.
    const caps = stubMigration(g, () => ({ txs: [TX], amount: 1n, edges: 12 }));

    let submitCalls = 0;
    await g.migrateWithRetry(
      { avatar: AVATAR },
      async () => {
        submitCalls += 1;
        if (submitCalls < 2) throw new Error('revert');
        return 'OK';
      },
      { startEdges: 40, reductionFactor: 0.5, minEdges: 1 },
    );

    // 1st cap 40 (built edges 12) → fail → next = floor(12 * 0.5) = 6, NOT 20.
    expect(caps).toEqual([40, 6]);
  });

  test('the submit callback receives accurate attempt info; attempts log carries amount/edges/maxEdges', async () => {
    const g = group();
    stubMigration(g, (p) => ({ txs: [TX], amount: 77n, edges: (p.maxEdges ?? 0) + 1 }));

    const seen: MigrationAttempt[] = [];
    const res = await g.migrateWithRetry(
      { avatar: AVATAR },
      async (_txs, attempt) => {
        seen.push(attempt);
        if (attempt.attempt < 2) throw new Error('revert');
        return 'OK';
      },
      { startEdges: 30, reductionFactor: 0.5, minEdges: 1 },
    );

    const ok = expectSuccess(res);
    expect(seen[0]).toEqual({ attempt: 1, maxEdges: 30, amount: 77n, edges: 31 });
    expect(seen[1].attempt).toBe(2);
    expect(seen[1].maxEdges).toBe(15); // floor(31 * 0.5)
    expect(ok.attempts[1]).toMatchObject({ attempt: 2, maxEdges: 15, amount: 77n, edges: 16 });
  });
});

describe('migrateWithRetry — failure outcomes', () => {
  test('stops immediately (no submit) when nothing is migratable → reason "empty"', async () => {
    const g = group();
    const caps = stubMigration(g, () => ({ txs: [], amount: 0n, edges: 0 }));

    let submitCalls = 0;
    const res = await g.migrateWithRetry({ avatar: AVATAR }, async () => {
      submitCalls += 1;
      return 'X';
    });

    const fail = expectFailure(res);
    expect(fail.reason).toBe('empty');
    expect(submitCalls).toBe(0);
    expect(caps).toHaveLength(1);
    expect(fail.attempts[0].error).toContain('empty batch');
  });

  test('exhausting all retries → reason "exhausted" with the full log', async () => {
    const g = group();
    const caps = stubMigration(g, (p) => ({ txs: [TX], amount: 50n, edges: p.maxEdges ?? 0 }));

    const res = await g.migrateWithRetry(
      { avatar: AVATAR },
      async () => {
        throw new Error('revert');
      },
      { maxAttempts: 3, startEdges: 30, minEdges: 5, reductionFactor: 0.5 },
    );

    const fail = expectFailure(res);
    expect(fail.reason).toBe('exhausted');
    expect(fail.amount).toBe(0n);
    expect(fail.attempts).toHaveLength(3);
    expect(fail.attempts.every((a) => a.error)).toBe(true);
    expect(caps).toEqual([30, 15, 7]);
  });

  test('edge cap never drops below minEdges', async () => {
    const g = group();
    const caps = stubMigration(g, (p) => ({ txs: [TX], amount: 1n, edges: p.maxEdges ?? 0 }));

    await g.migrateWithRetry(
      { avatar: AVATAR },
      async () => {
        throw new Error('revert');
      },
      { maxAttempts: 5, startEdges: 8, minEdges: 5, reductionFactor: 0.5 },
    );

    expect(caps[0]).toBe(8);
    expect(caps.slice(1).every((c) => c === 5)).toBe(true);
  });
});

describe('migrateWithRetry — error classification & build errors', () => {
  test('a non-retryable submit error (user rejection) is rethrown, not retried', async () => {
    const g = group();
    const caps = stubMigration(g, (p) => ({ txs: [TX], amount: 1n, edges: p.maxEdges ?? 0 }));

    let submitCalls = 0;
    await expect(
      g.migrateWithRetry({ avatar: AVATAR }, async () => {
        submitCalls += 1;
        throw new Error('MetaMask Tx Signature: User rejected the request.');
      }),
    ).rejects.toThrow('User rejected');

    expect(submitCalls).toBe(1); // no re-prompt with a smaller migration
    expect(caps).toHaveLength(1);
  });

  test('a non-Error throw from submit (programmer bug) is fatal, not swallowed', async () => {
    const g = group();
    stubMigration(g, (p) => ({ txs: [TX], amount: 1n, edges: p.maxEdges ?? 0 }));

    await expect(
      g.migrateWithRetry({ avatar: AVATAR }, async () => {
        // e.g. a TypeError surfaced as a thrown non-Error
        throw 'boom';
      }),
    ).rejects.toBe('boom');
  });

  test('custom isRetryable can force a retry on an otherwise-fatal-looking error', async () => {
    const g = group();
    const caps = stubMigration(g, (p) => ({ txs: [TX], amount: 1n, edges: p.maxEdges ?? 0 }));

    let submitCalls = 0;
    const res = await g.migrateWithRetry(
      { avatar: AVATAR },
      async () => {
        submitCalls += 1;
        if (submitCalls < 2) throw new Error('user rejected'); // normally fatal
        return 'OK';
      },
      { isRetryable: () => true, startEdges: 10, minEdges: 1, reductionFactor: 0.5 },
    );

    expectSuccess(res);
    expect(submitCalls).toBe(2);
    expect(caps).toEqual([10, 5]);
  });

  test('a build/pathfinder error is logged and retried (not thrown), preserving the attempt log', async () => {
    const g = group();
    let calls = 0;
    const caps = stubMigration(g, (p) => {
      calls += 1;
      if (calls === 1) throw new Error('circlesV2_findPath: connection failed');
      return { txs: [TX], amount: 9n, edges: p.maxEdges ?? 0 };
    });

    const res = await g.migrateWithRetry(
      { avatar: AVATAR },
      async () => 'OK',
      { startEdges: 20, minEdges: 1, reductionFactor: 0.5 },
    );

    const ok = expectSuccess(res);
    expect(ok.result).toBe('OK');
    expect(caps).toEqual([20, 10]); // build failed at 20 → retried at 10
    expect(ok.attempts).toHaveLength(2);
    expect(ok.attempts[0].error).toContain('connection failed');
  });
});

describe('migrateWithRetry — defaults & option validation', () => {
  test('defaults: startEdges falls back to params.maxEdges, reduction 0.6', async () => {
    const g = group();
    const caps = stubMigration(g, (p) => ({ txs: [TX], amount: 1n, edges: p.maxEdges ?? 0 }));

    await g.migrateWithRetry({ avatar: AVATAR, maxEdges: 25 }, async () => {
      throw new Error('revert');
    });

    expect(caps[0]).toBe(25); // params.maxEdges
    expect(caps[1]).toBe(15); // floor(25 * 0.6)
  });

  test('defaults: bare params → startEdges 40 (DEFAULT_MAX_EDGES)', async () => {
    const g = group();
    const caps = stubMigration(g, (p) => ({ txs: [TX], amount: 1n, edges: p.maxEdges ?? 0 }));

    await g.migrateWithRetry({ avatar: AVATAR }, async () => {
      throw new Error('revert');
    });

    expect(caps[0]).toBe(40);
    expect(caps[1]).toBe(24); // floor(40 * 0.6)
  });

  test('rejects nonsensical options', async () => {
    const g = group();
    stubMigration(g, (p) => ({ txs: [TX], amount: 1n, edges: p.maxEdges ?? 0 }));
    const submit = async () => 'X';

    await expect(g.migrateWithRetry({ avatar: AVATAR }, submit, { maxAttempts: 0 })).rejects.toThrow();
    await expect(g.migrateWithRetry({ avatar: AVATAR }, submit, { reductionFactor: 1 })).rejects.toThrow();
    await expect(g.migrateWithRetry({ avatar: AVATAR }, submit, { reductionFactor: 0 })).rejects.toThrow();
    await expect(g.migrateWithRetry({ avatar: AVATAR }, submit, { minEdges: 0 })).rejects.toThrow();
    await expect(
      g.migrateWithRetry({ avatar: AVATAR }, submit, { startEdges: 3, minEdges: 5 }),
    ).rejects.toThrow();
  });
});
