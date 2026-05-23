import { describe, test, expect } from 'bun:test';
import { PermissionlessGroup } from '../PermissionlessGroup.js';

// Minimal config — only used to construct the instance; the guarded code path
// runs before any network call, so we don't need a working RPC.
const RPC = 'https://rpc.staging.aboutcircles.com/';
const CONFIG = {
  groupAddress: '0x0000000000000000000000000000000000000aaa' as `0x${string}`,
  hubAddress: '0x0000000000000000000000000000000000000bbb' as `0x${string}`,
  liftERC20Address: '0x0000000000000000000000000000000000000ccc' as `0x${string}`,
  backendBaseUrl: 'https://score-groups-backend.staging.example.com',
  rpcUrl: RPC,
  circlesConfig: {
    circlesRpcUrl: RPC,
    v2HubAddress: '0x0000000000000000000000000000000000000bbb' as `0x${string}`,
    liftERC20Address: '0x0000000000000000000000000000000000000ccc' as `0x${string}`,
  } as any,
};

const AVATAR = '0x0000000000000000000000000000000000000ddd' as `0x${string}`;

async function expectThrows(p: Promise<unknown>, pattern: RegExp): Promise<void> {
  let thrown: unknown = null;
  try {
    await p;
  } catch (e) {
    thrown = e;
  }
  expect(thrown).not.toBeNull();
  const msg = thrown instanceof Error ? thrown.message : String(thrown);
  expect(msg).toMatch(pattern);
}

describe('migrationRaw — MAX_FLOW guard', () => {
  test('throws when amount is undefined', async () => {
    const group = new PermissionlessGroup(CONFIG);
    await expectThrows(group.migrationRaw({ avatar: AVATAR }), /explicit `amount`/);
  });

  test('throws when amount is zero', async () => {
    const group = new PermissionlessGroup(CONFIG);
    await expectThrows(
      group.migrationRaw({ avatar: AVATAR, amount: 0n }),
      /must be > 0/
    );
  });

  test('throws when avatar is missing', async () => {
    const group = new PermissionlessGroup(CONFIG);
    await expectThrows(
      // @ts-expect-error - avatar intentionally missing
      group.migrationRaw({ amount: 100n }),
      /requires `avatar`/
    );
  });
});
