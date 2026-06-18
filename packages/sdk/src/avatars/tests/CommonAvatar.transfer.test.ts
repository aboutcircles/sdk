import { describe, test, expect } from 'bun:test';
import type { Address, ContractRunner, TransactionRequest } from '@aboutcircles/sdk-types';
import type { TransactionReceipt } from 'viem';
import { Core } from '@aboutcircles/sdk-core';
import {
  bytesToHex,
  hexToBytes,
  decodeAbiParameters,
  encodeCrcV2TransferData,
  decodeCrcV2TransferData,
} from '@aboutcircles/sdk-utils';
import { HumanAvatar } from '../HumanAvatar.js';

const SENDER = '0x4d825a98ee3e4801e39f2de6dd16184de2285ce4' as Address;
const RECIPIENT = '0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c' as Address;
const ERC20_TOKEN = '0x0d8c4901dd270fe101b8014a5dbecc4e4432eb1e' as Address;

const ERC20_TRANSFER_SELECTOR = '0xa9059cbb'; // transfer(address,uint256)
const SAFE_TRANSFER_FROM_SELECTOR = '0xf242432a'; // safeTransferFrom(address,address,uint256,uint256,bytes)

const ERC20_TYPE = 'CrcV2_ERC20WrapperDeployed_Demurraged';
const ERC1155_TYPE = 'CrcV2_RegisterHuman';

const FAKE_RECEIPT = { status: 'success', transactionHash: '0xdead' } as unknown as TransactionReceipt;

/**
 * Construct a HumanAvatar with the on-chain/RPC seams stubbed so the transfer
 * paths run fully offline. The runner stub captures the TransactionRequest[]
 * batch so we can assert its shape. Mirrors the field-override pattern used in
 * packages/permissionless-groups/src/tests/mint.test.ts.
 */
function makeAvatar(tokenType: string) {
  let captured: TransactionRequest[] | undefined;

  const runner = {
    sendTransaction: async (txs: TransactionRequest[]) => {
      captured = txs;
      return FAKE_RECEIPT;
    },
  } as unknown as ContractRunner;

  const avatar = new HumanAvatar(SENDER, new Core(), runner);

  // Drive the token-type branch in transfer.direct without hitting the RPC.
  (avatar as unknown as { rpc: unknown }).rpc = {
    token: { getTokenInfo: async () => ({ tokenType }) },
  };

  // The ERC1155 path resolves the token id via an on-chain read; stub it so the
  // test stays offline. (The ERC20 path computes BigInt(address) locally and
  // never calls this.)
  (avatar.core.hubV2 as unknown as { toTokenId: (a: Address) => Promise<bigint> }).toTokenId =
    async (a: Address) => BigInt(a);

  return { avatar, getCaptured: () => captured };
}

/** Decode safeTransferFrom(from,to,id,amount,data) calldata (after the selector). */
function decodeSafeTransferFrom(data: string) {
  const [from, to, id, amount, payload] = decodeAbiParameters(
    ['address', 'address', 'uint256', 'uint256', 'bytes'],
    '0x' + data.slice(10)
  ) as [Address, Address, bigint, bigint, string];
  return { from, to, id, amount, payload };
}

describe('CommonAvatar.transfer.direct — gCRC (ERC20) annotation', () => {
  test('(a) plain gCRC send sends a single, unchanged ERC20 transfer tx', async () => {
    const { avatar, getCaptured } = makeAvatar(ERC20_TYPE);

    await avatar.transfer.direct(RECIPIENT, 100n, ERC20_TOKEN);

    const txs = getCaptured()!;
    expect(txs).toHaveLength(1);
    expect(txs[0].to!.toLowerCase()).toBe(ERC20_TOKEN.toLowerCase());
    expect((txs[0].data as string).slice(0, 10)).toBe(ERC20_TRANSFER_SELECTOR);
    expect(txs[0].value).toBe(0n);
  });

  test('(b) gCRC send with annotation batches a 0-value ERC1155 safeTransferFrom carrier', async () => {
    const { avatar, getCaptured } = makeAvatar(ERC20_TYPE);
    const txData = hexToBytes(encodeCrcV2TransferData(['Thanks 🎉'], 0x0001));

    await avatar.transfer.direct(RECIPIENT, 100n, ERC20_TOKEN, txData);

    const txs = getCaptured()!;
    expect(txs).toHaveLength(2);

    // tx[0] = the unchanged ERC20 transfer
    expect(txs[0].to!.toLowerCase()).toBe(ERC20_TOKEN.toLowerCase());
    expect((txs[0].data as string).slice(0, 10)).toBe(ERC20_TRANSFER_SELECTOR);

    // tx[1] = a 0-value ERC1155 safeTransferFrom to the hub carrying the annotation
    expect(txs[1].to!.toLowerCase()).toBe(avatar.core.config.v2HubAddress.toLowerCase());
    expect(txs[1].value).toBe(0n);
    expect((txs[1].data as string).slice(0, 10)).toBe(SAFE_TRANSFER_FROM_SELECTOR);

    const { from, to, id, amount, payload } = decodeSafeTransferFrom(txs[1].data as string);
    expect(from.toLowerCase()).toBe(SENDER.toLowerCase()); // from = sender
    expect(to.toLowerCase()).toBe(RECIPIENT.toLowerCase()); // to = recipient (mirror)
    expect(id).toBe(BigInt(SENDER)); // sender's own avatar token id
    expect(amount).toBe(0n); // 0-value carrier
    expect(payload.toLowerCase()).toBe(bytesToHex(txData).toLowerCase());
  });

  test('(c) ERC1155 personal-token transfer still sends a single safeTransferFrom with the real amount', async () => {
    const { avatar, getCaptured } = makeAvatar(ERC1155_TYPE);
    const txData = hexToBytes(encodeCrcV2TransferData(['gm'], 0x0001));

    await avatar.transfer.direct(RECIPIENT, 100n, SENDER, txData);

    const txs = getCaptured()!;
    expect(txs).toHaveLength(1);
    expect((txs[0].data as string).slice(0, 10)).toBe(SAFE_TRANSFER_FROM_SELECTOR);

    const { amount, payload } = decodeSafeTransferFrom(txs[0].data as string);
    expect(amount).toBe(100n); // real amount, not a 0-value carrier
    expect(payload.toLowerCase()).toBe(bytesToHex(txData).toLowerCase());
  });

  test('(d) the carried annotation round-trips through decodeCrcV2TransferData', async () => {
    const { avatar, getCaptured } = makeAvatar(ERC20_TYPE);
    const message = 'Thanks for lunch 🍣';
    const txData = hexToBytes(encodeCrcV2TransferData([message], 0x0001));

    await avatar.transfer.direct(RECIPIENT, 1n, ERC20_TOKEN, txData);

    const { payload } = decodeSafeTransferFrom(getCaptured()![1].data as string);
    const decoded = decodeCrcV2TransferData(payload);
    expect(decoded.type).toBe(0x0001);
    expect(decoded.payload).toBe(message);
  });

  test('(e) empty txData does not add a carrier tx (treated as no annotation)', async () => {
    const { avatar, getCaptured } = makeAvatar(ERC20_TYPE);

    await avatar.transfer.direct(RECIPIENT, 1n, ERC20_TOKEN, new Uint8Array(0));

    expect(getCaptured()!).toHaveLength(1);
  });
});
