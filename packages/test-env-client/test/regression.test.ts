import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { TestEnvClient, type Session } from '../src/index.js';
import fixtures from './fixtures.json';

/**
 * Block-pinned regression suite against the hosted test-env.
 *
 * Asserts ONLY genuinely-pinned planes (Anvil real fork + pathfinder
 * X-Max-Block-Number). DB/RPC count assertions are intentionally excluded —
 * those planes are not block-pinned (see fixtures.json `_comment`).
 *
 * One session per fixture block, reused across every assertion for that block,
 * to stay under the test-env rate limiter. Run with:
 *   bun test packages/test-env-client/test/regression.test.ts
 * Override target with TEST_ENV_URL.
 */

const baseUrl =
  process.env.TEST_ENV_URL ?? 'http://localhost:5200';
const TIMEOUT = 120_000;

const HUB = fixtures.hub;
const BALANCE_OF = '0x00fdd58e'; // ERC1155.balanceOf(address,uint256)
const pad32 = (hexNoPrefix: string) => hexNoPrefix.padStart(64, '0');
const encodeBalanceOf = (account: string, tokenId: string) =>
  BALANCE_OF +
  pad32(account.toLowerCase().replace(/^0x/, '')) +
  pad32(BigInt(tokenId).toString(16));

for (const fx of fixtures.blocks) {
  describe(`block ${fx.block}`, () => {
    const client = new TestEnvClient({ baseUrl, timeoutMs: 90_000 });
    let session: Session;

    beforeAll(async () => {
      session = await client.createSession({
        blockNumber: fx.block,
        features: ['anvil', 'pathfinder'],
        ttlMinutes: 10,
      });
    }, TIMEOUT);

    afterAll(async () => {
      await session?.release();
    });

    test(
      'anvil fork reports the expected chainId',
      async () => {
        const chainId = await session.anvil!.call<string>('eth_chainId', []);
        expect(chainId).toBe(fx.anvil.chainId);
      },
      TIMEOUT,
    );

    for (const b of fx.anvil.balanceOf) {
      test(
        `anvil balanceOf — ${b.label}`,
        async () => {
          const data = encodeBalanceOf(b.account, BigInt(b.tokenOwner).toString());
          const hex = await session.anvil!.call<string>('eth_call', [
            { to: HUB, data },
            'latest',
          ]);
          expect(BigInt(hex).toString()).toBe(b.expectedWei);
        },
        TIMEOUT,
      );
    }

    for (const p of fx.pathfinder.findPath) {
      test(
        `pathfinder findPath — ${p.label}`,
        async () => {
          const path = await session.pathfinder!.findPath({
            source: p.source,
            sink: p.sink,
            targetFlow: BigInt(p.amountWei),
          });
          expect(path.transfers.length).toBe(p.expectTransfers);
          expect(String(path.maxFlow)).toBe(p.expectMaxFlowWei);
        },
        TIMEOUT,
      );
    }
  });
}
