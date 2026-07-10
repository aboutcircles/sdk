import { describe, test, expect } from 'bun:test';
import type { Address, TokenBalance } from '@aboutcircles/sdk-types';
import { PermissionlessGroup } from '../PermissionlessGroup.js';

const GROUP = '0x93eD5A96347927ff6fF6b790F8Cf5258240c321f' as Address;
const HUB = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8' as Address;
const LIFT = '0x5F99a795dD2743C36D63511f0D4bc667e6d3cDB5' as Address;
const AVATAR = '0x1111111111111111111111111111111111111111' as Address;
const V2_HUMAN = '0xAaA0000000000000000000000000000000000001' as Address;
const V1_HUMAN = '0xbBb0000000000000000000000000000000000002' as Address;

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

/** Minimal ERC1155 TokenBalance row with an overridable version. */
function row(owner: Address, version: number, atto: bigint): TokenBalance {
  return {
    tokenAddress: owner,
    tokenId: owner,
    tokenOwner: owner,
    tokenType: version === 1 ? 'CrcV1_Signup' : 'CrcV2_RegisterHuman',
    version,
    attoCircles: atto,
    circles: 0,
    staticAttoCircles: atto,
    staticCircles: 0,
    attoCrc: 0n,
    crc: 0,
    isErc20: false,
    isErc1155: true,
    isWrapped: false,
    isInflationary: false,
    isGroup: false,
  };
}

// `buildPersonalBreakdown` is private — exercise it directly; it's pure (no I/O).
type WithBreakdown = {
  buildPersonalBreakdown(
    avatar: Address,
    held: TokenBalance[],
    transfers: never[],
  ): { tokenOwner: Address; total: bigint }[];
};

describe('buildPersonalBreakdown — v1 filtering', () => {
  test('excludes Circles v1 balances (version === 1), keeps v2', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [row(V2_HUMAN, 2, 5n * 10n ** 18n), row(V1_HUMAN, 1, 9n * 10n ** 18n)],
      [],
    );
    expect(out).toHaveLength(1);
    expect(out[0].tokenOwner).toBe(V2_HUMAN);
    expect(out[0].total).toBe(5n * 10n ** 18n);
  });

  test('drops an avatar whose only holding is v1 (no phantom entry)', () => {
    const g = group() as unknown as WithBreakdown;
    const out = g.buildPersonalBreakdown(
      AVATAR,
      [row(V1_HUMAN, 1, 100n * 10n ** 18n)],
      [],
    );
    expect(out).toHaveLength(0);
  });
});
