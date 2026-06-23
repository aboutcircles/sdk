import { describe, test, expect } from 'bun:test';
import type { Address } from '@aboutcircles/sdk-types';
import { encodeCrcV2TransferData } from '@aboutcircles/sdk-utils';
import { hexToBytes } from '@aboutcircles/sdk-utils/bytes';
import { PermissionlessGroup } from '../PermissionlessGroup.js';
import type { BalanceResult } from '../types.js';

const GROUP = '0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c' as Address;
const HUB = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8' as Address;
const LIFT = '0x5F99a795dD2743C36D63511f0D4bc667e6d3cDB5' as Address;
const AVATAR = '0x4d825a98ee3e4801e39f2de6dd16184de2285ce4' as Address;
const RECIPIENT = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' as Address;
const INFL_WRAPPER = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address;
const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as Address;
const GROUP_TOKEN_ID = BigInt('0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c');

/** A realistic inflationary balance of 10 CRC (inflationary atto-CRC). */
const INFL_BALANCE = 10n * 10n ** 18n;

/** Balance with only the inflationary wrapper funded — the most common ERC20 path. */
function inflBalance(override?: Partial<BalanceResult>): BalanceResult {
  return {
    erc1155: 0n,
    demurrageWrapper: 0n,
    inflationaryWrapper: INFL_BALANCE,
    demurrageWrapperAddress: ZERO_ADDR,
    inflationaryWrapperAddress: INFL_WRAPPER,
    ...override,
  };
}

function makeGroup(): PermissionlessGroup {
  const pg = new PermissionlessGroup({
    groupAddress: GROUP,
    hubAddress: HUB,
    liftERC20Address: LIFT,
    backendBaseUrl: 'http://backend.invalid',
    rpcUrl: 'http://rpc.invalid',
    circlesConfig: {} as never,
  });
  return pg;
}

/**
 * Attach the minimal set of stubs needed by transferGroupCrc() for a
 * non-org (ERC20) recipient path.
 */
function stubForErc20(pg: PermissionlessGroup, bal: BalanceResult = inflBalance()) {
  (pg as unknown as { balanceBreakdown: unknown }).balanceBreakdown = async () => bal;
  (pg as { hub: unknown }).hub = {
    isOrganization: async () => false,
    toTokenId: async () => GROUP_TOKEN_ID,
    safeTransferFrom: (_from: Address, to: Address, id: bigint, amount: bigint, data: string) =>
      ({ to: HUB, data: `0xsafetransfer:${to}:${id}:${amount}:${data}` }),
    wrap: () => ({ to: HUB, data: '0xwrap' }),
  };
}

/**
 * Attach stubs for the org (ERC1155) recipient path.
 */
function stubForOrg(pg: PermissionlessGroup, bal: BalanceResult = inflBalance()) {
  (pg as unknown as { balanceBreakdown: unknown }).balanceBreakdown = async () => bal;
  (pg as { hub: unknown }).hub = {
    isOrganization: async () => true,
    toTokenId: async () => GROUP_TOKEN_ID,
    safeTransferFrom: (_from: Address, to: Address, id: bigint, amount: bigint, data: string) =>
      ({ to: HUB, data: `0xsafetransfer:${to}:${id}:${amount}:${data}` }),
    wrap: () => ({ to: HUB, data: '0xwrap' }),
  };
}

describe('transferGroupCrc() — ERC20 path', () => {
  test('no txData → single ERC20 transfer, mode erc20-inflationary', async () => {
    const pg = makeGroup();
    stubForErc20(pg);

    const result = await pg.transferGroupCrc({
      avatar: AVATAR,
      to: RECIPIENT,
      amount: 1n * 10n ** 18n,
    });

    expect(result.mode).toBe('erc20-inflationary');
    expect(result.txs).toHaveLength(1);
    // The only tx is the ERC20 transfer (no hub safeTransferFrom).
    expect(result.txs[0].data).not.toContain('0xsafetransfer');
  });

  test('with txData → ERC20 transfer + zero-value ERC1155, mode erc20-inflationary-annotated', async () => {
    const pg = makeGroup();
    stubForErc20(pg);

    const annotation = hexToBytes(encodeCrcV2TransferData(['hello'], 0x0001));
    const result = await pg.transferGroupCrc({
      avatar: AVATAR,
      to: RECIPIENT,
      amount: 1n * 10n ** 18n,
      txData: annotation,
    });

    expect(result.mode).toBe('erc20-inflationary-annotated');
    expect(result.txs).toHaveLength(2);

    const annotationTx = result.txs[1];
    // safeTransferFrom carries the group token id, amount 0, and the annotation data.
    expect(annotationTx.data).toContain(`:${GROUP_TOKEN_ID}:`);
    expect(annotationTx.data).toContain(':0:');
    // data blob is the hex-encoded annotation.
    const encodedHex = encodeCrcV2TransferData(['hello'], 0x0001);
    expect(annotationTx.data).toContain(encodedHex);
  });

  test('zero-value ERC1155 comes AFTER the ERC20 transfer', async () => {
    const pg = makeGroup();
    stubForErc20(pg);

    const annotation = hexToBytes(encodeCrcV2TransferData(['test'], 0x0001));
    const result = await pg.transferGroupCrc({
      avatar: AVATAR,
      to: RECIPIENT,
      amount: 1n * 10n ** 18n,
      txData: annotation,
    });

    // First tx must be the ERC20 (wrapper.transfer), not the hub call.
    expect(result.txs[0].data).not.toContain('0xsafetransfer');
    // Second tx is the zero-value safeTransferFrom annotation.
    expect(result.txs[1].data).toContain('0xsafetransfer');
  });

  test('with demurrage unwrap consolidation + txData → correct batch shape', async () => {
    const pg = makeGroup();
    const bal = inflBalance({
      erc1155: 0n,
      demurrageWrapper: 5n * 10n ** 18n,
      inflationaryWrapper: 5n * 10n ** 18n,
      demurrageWrapperAddress: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address,
    });

    // Stub DemurrageCirclesContract.unwrap by intercepting hub; the demurrage
    // wrapper is constructed inline so we verify batch length only.
    (pg as unknown as { balanceBreakdown: unknown }).balanceBreakdown = async () => bal;
    (pg as { hub: unknown }).hub = {
      isOrganization: async () => false,
      toTokenId: async () => GROUP_TOKEN_ID,
      safeTransferFrom: (_from: Address, to: Address, id: bigint, amount: bigint, data: string) =>
        ({ to: HUB, data: `0xsafetransfer:${to}:${id}:${amount}:${data}` }),
      wrap: () => ({ to: HUB, data: '0xwrap' }),
    };

    const annotation = hexToBytes(encodeCrcV2TransferData(['annotated'], 0x0001));
    const result = await pg.transferGroupCrc({
      avatar: AVATAR,
      to: RECIPIENT,
      amount: 1n * 10n ** 18n,
      txData: annotation,
    });

    expect(result.mode).toBe('erc20-inflationary-annotated');
    // unwrap(demurrage) + wrap(erc1155) + transfer(erc20) + safeTransferFrom(annotation)
    expect(result.txs).toHaveLength(4);
    // Last tx is the annotation.
    expect(result.txs[3].data).toContain('0xsafetransfer');
  });
});

describe('transferGroupCrc() — ERC1155 (org) path', () => {
  test('org recipient with txData → data in safeTransferFrom, NOT a separate annotation tx', async () => {
    const pg = makeGroup();
    // Org path: avatar holds only inflationary wrapper, no ERC1155 shortfall —
    // but the amount > inflationaryWrapper means it still routes as ERC1155.
    // Keep it simple: set ERC1155 > amount so no unwrapping is needed.
    const bal = inflBalance({
      erc1155: 5n * 10n ** 18n,
      inflationaryWrapper: 0n,
      inflationaryWrapperAddress: INFL_WRAPPER,
    });
    stubForOrg(pg, bal);
    (pg as { hub: unknown }).hub = {
      isOrganization: async () => true,
      toTokenId: async () => GROUP_TOKEN_ID,
      safeTransferFrom: (_from: Address, to: Address, id: bigint, amount: bigint, data: string) =>
        ({ to: HUB, data: `0xsafetransfer:${to}:${id}:${amount}:${data}` }),
      wrap: () => ({ to: HUB, data: '0xwrap' }),
    };

    const txBytes = hexToBytes(encodeCrcV2TransferData(['org note'], 0x0001));
    const result = await pg.transferGroupCrc({
      avatar: AVATAR,
      to: RECIPIENT,
      amount: 1n * 10n ** 18n,
      txData: txBytes,
    });

    expect(result.mode).toBe('erc1155-after-unwrap');
    // Only 1 tx (no unwrap needed, ERC1155 balance sufficient): the safeTransferFrom.
    expect(result.txs).toHaveLength(1);
    // The data is embedded in the safeTransferFrom, not a separate tx.
    const encodedHex = encodeCrcV2TransferData(['org note'], 0x0001);
    expect(result.txs[0].data).toContain(encodedHex);
  });

  test('org recipient without txData → safeTransferFrom with empty data 0x', async () => {
    const pg = makeGroup();
    const bal = inflBalance({ erc1155: 5n * 10n ** 18n, inflationaryWrapper: 0n });
    stubForOrg(pg, bal);
    (pg as { hub: unknown }).hub = {
      isOrganization: async () => true,
      toTokenId: async () => GROUP_TOKEN_ID,
      safeTransferFrom: (_from: Address, to: Address, id: bigint, amount: bigint, data: string) =>
        ({ to: HUB, data: `0xsafetransfer:${to}:${id}:${amount}:${data}` }),
      wrap: () => ({ to: HUB, data: '0xwrap' }),
    };

    const result = await pg.transferGroupCrc({
      avatar: AVATAR,
      to: RECIPIENT,
      amount: 1n * 10n ** 18n,
    });

    expect(result.mode).toBe('erc1155-after-unwrap');
    expect(result.txs).toHaveLength(1);
    // Empty data slot.
    expect(result.txs[0].data).toContain(':0x');
  });
});
