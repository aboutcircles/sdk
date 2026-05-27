import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { encodeAbiParameters } from '@aboutcircles/sdk-utils';
import type { Address, CirclesConfig } from '@aboutcircles/sdk-types';
import { Invitations } from '../Invitations.js';

/**
 * Selectors for the read calls the invitation flow makes (eth_call dispatch).
 */
const SEL = {
  isHuman: '0xf72c436f',
  isTrusted: '0x6713e230',
  isModuleEnabled: '0x2d9ad53d',
  claimableFreeInvites: '0x29b66e19',
  claimInvite: '0x81d42f52',
  invitationModule: '0xfa659bd1',
  claimFreeInvite: '0xc8c0d9a2',
} as const;

const HUB = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8' as Address;
const GRANTEE = '0x5fF9293B9062d2741DD8bFDd2cB6ffd50BdBe587' as Address;
const FARM = '0xd28b7C4f148B1F1E190840A1f7A796C5525D8902' as Address;
const REFERRALS_MODULE = '0x12105a9B291aF2ABb0591001155A75949b062CE5' as Address;
const INVITATION_MODULE = '0x00738aca013B7B2e6cfE1690F0021C3182Fa40B5' as Address;

const INVITER = '0x4d825a98ee3e4801e39f2de6dd16184de2285ce4' as Address;
const INVITEE = '0xde374ece6fa50e781e81aac78e811b33d16912c7' as Address;
const BOT_ID = 0x000000000000000000000000abcabcabcabcabcabcabcabcabcabcabcabcabcan;

function baseConfig(overrides: Partial<CirclesConfig> = {}): CirclesConfig {
  return {
    circlesRpcUrl: 'http://localhost:9999/',
    profileServiceUrl: 'http://localhost:9999/profiles/',
    referralsServiceUrl: 'http://localhost:9999/referrals/',
    v2HubAddress: HUB,
    nameRegistryAddress: '0x0000000000000000000000000000000000000001' as Address,
    baseGroupMintPolicy: '0x0000000000000000000000000000000000000002' as Address,
    standardTreasury: '0x0000000000000000000000000000000000000003' as Address,
    coreMembersGroupDeployer: '0x0000000000000000000000000000000000000004' as Address,
    baseGroupFactoryAddress: '0x0000000000000000000000000000000000000005' as Address,
    liftERC20Address: '0x0000000000000000000000000000000000000006' as Address,
    invitationFarmAddress: FARM,
    referralsModuleAddress: REFERRALS_MODULE,
    invitationModuleAddress: INVITATION_MODULE,
    gnosisPayInviteQuotaGranteeAddress: GRANTEE,
    ...overrides,
  };
}

interface MockState {
  claimableFreeInvites: bigint;
  realInvitersCalled: boolean;
  farmPathCalled: boolean;
}

const bool = (b: boolean) => encodeAbiParameters(['bool'], [b]);
const uint = (n: bigint) => encodeAbiParameters(['uint256'], [n]);
const addr = (a: Address) => encodeAbiParameters(['address'], [a]);

/**
 * Installs a fetch mock that answers the eth_call reads the flow performs and
 * tracks whether the proxy-inviter / farm paths were ever consulted.
 */
function installFetchMock(state: MockState) {
  const origFetch = globalThis.fetch;
  const mock = (async (input: unknown, init?: { body?: unknown }) => {
    const body = JSON.parse(String(init?.body ?? '{}'));
    const method = body.method as string;
    const result = (hex: string) =>
      ({ ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id: body.id, result: hex }) });

    if (method === 'eth_call') {
      const call = body.params[0] as { to: string; data: string };
      const to = call.to.toLowerCase();
      const sel = call.data.slice(0, 10);

      if (sel === SEL.isHuman) return result(bool(false));        // invitee not registered
      if (sel === SEL.isModuleEnabled) return result(bool(true)); // module enabled on inviter's safe
      if (sel === SEL.isTrusted) return result(bool(true));       // module already trusts inviter
      if (to === GRANTEE.toLowerCase() && sel === SEL.claimableFreeInvites) {
        return result(uint(state.claimableFreeInvites));
      }
      if (to === FARM.toLowerCase() && sel === SEL.claimInvite) {
        return result(uint(BOT_ID));
      }
      if (to === FARM.toLowerCase() && sel === SEL.invitationModule) {
        return result(addr(INVITATION_MODULE));
      }
      // Any pathfinder/trust JSON-RPC indicates the proxy/farm path was taken.
      return result(uint(0n));
    }

    // The pathfinder + trust graph methods are custom RPC methods; reaching
    // them means the free path did NOT short-circuit.
    if (method?.startsWith('circles_') || method?.startsWith('circlesV2_')) {
      state.realInvitersCalled = true;
      return result('{}');
    }

    return origFetch(input as Parameters<typeof fetch>[0], init as Parameters<typeof fetch>[1]);
  });
  globalThis.fetch = mock as unknown as typeof fetch;

  return () => {
    globalThis.fetch = origFetch;
  };
}

describe('Invitations — Gnosis Pay free invites', () => {
  let restore: () => void;
  let state: MockState;

  beforeEach(() => {
    state = { claimableFreeInvites: 0n, realInvitersCalled: false, farmPathCalled: false };
    restore = installFetchMock(state);
  });

  afterEach(() => restore());

  test('generateInvite uses the free-invite path when eligible', async () => {
    state.claimableFreeInvites = 3n;
    const inv = new Invitations(baseConfig());

    const txs = await inv.generateInvite(INVITER, INVITEE);

    // Setup (module enabled + trusted ⇒ no setup txs) + [claimFreeInvite, claimInvite, safeTransferFrom]
    expect(txs).toHaveLength(3);

    // 1) claimFreeInvite() to the grantee
    expect(txs[0].to?.toLowerCase()).toBe(GRANTEE.toLowerCase());
    expect((txs[0].data as string).slice(0, 10)).toBe(SEL.claimFreeInvite);

    // 2) claimInvite() to the farm
    expect(txs[1].to?.toLowerCase()).toBe(FARM.toLowerCase());
    expect((txs[1].data as string).slice(0, 10)).toBe(SEL.claimInvite);

    // 3) safeTransferFrom to the invitation module (via Hub)
    expect(txs[2].to?.toLowerCase()).toBe(HUB.toLowerCase());

    // The proxy-inviter / farm-quota path must never be consulted.
    expect(state.realInvitersCalled).toBe(false);
  });

  test('generateReferral uses the free-invite path when eligible and returns a private key', async () => {
    state.claimableFreeInvites = 1n;
    const inv = new Invitations(baseConfig());

    const { transactions, privateKey } = await inv.generateReferral(INVITER);

    expect(transactions).toHaveLength(3);
    expect(transactions[0].to?.toLowerCase()).toBe(GRANTEE.toLowerCase());
    expect(transactions[1].to?.toLowerCase()).toBe(FARM.toLowerCase());
    expect((transactions[1].data as string).slice(0, 10)).toBe(SEL.claimInvite);
    expect(transactions[2].to?.toLowerCase()).toBe(HUB.toLowerCase());
    expect(privateKey).toMatch(/^0x[0-9a-f]{64}$/);
    expect(state.realInvitersCalled).toBe(false);
  });

  test('getClaimableFreeInvites returns the grantee value', async () => {
    state.claimableFreeInvites = 2n;
    const inv = new Invitations(baseConfig());
    expect(await inv.getClaimableFreeInvites(INVITER)).toBe(2n);
  });

  test('getClaimableFreeInvites returns 0 when the grantee is not configured', async () => {
    const inv = new Invitations(baseConfig({ gnosisPayInviteQuotaGranteeAddress: undefined }));
    expect(await inv.getClaimableFreeInvites(INVITER)).toBe(0n);
  });

  test('not eligible (0) does not use the free-invite path', async () => {
    state.claimableFreeInvites = 0n;
    const inv = new Invitations(baseConfig());

    // The proxy/farm path will run; with the mock returning empty graph data it
    // throws noPathFound. The point is the free path was skipped.
    await expect(inv.generateInvite(INVITER, INVITEE)).rejects.toBeDefined();
    expect(state.realInvitersCalled).toBe(true);
  });
});
