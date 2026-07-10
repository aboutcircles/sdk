import { describe, test, expect } from 'bun:test';
import { TransactionMethods } from '../methods/transaction.js';
import type { RpcClient } from '../client.js';
import type { Address, PagedResponse, TransferDataRow } from '@aboutcircles/sdk-types';

// Checksummed/lowercase pairs reused across cases.
const ADDR_CS = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed' as Address;
const ADDR_LC = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
const COUNTER_CS = '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359' as Address;
const COUNTER_LC = '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359';

/** Minimal RpcClient stub that records calls and returns a fixed result. */
function mockClient(result: PagedResponse<TransferDataRow>) {
  const calls: { method: string; params: unknown }[] = [];
  const client = {
    call: async (method: string, params: unknown) => {
      calls.push({ method, params });
      return result;
    },
  } as unknown as RpcClient;
  return { client, calls };
}

const emptyPage: PagedResponse<TransferDataRow> = { results: [], hasMore: false, nextCursor: null };

describe('TransactionMethods.getTransferData', () => {
  test('marshals all params in the plugin order, lowercasing addresses', async () => {
    const { client, calls } = mockClient(emptyPage);
    const tx = new TransactionMethods(client);

    await tx.getTransferData(ADDR_CS, 'sent', COUNTER_CS, 100, 200, 25, 'cursor-1');

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('circles_getTransferData');
    // address, direction, counterparty, fromBlock, toBlock, limit, cursor
    expect(calls[0].params).toEqual([ADDR_LC, 'sent', COUNTER_LC, 100, 200, 25, 'cursor-1']);
  });

  test('applies defaults (both directions, no filters, limit 50)', async () => {
    const { client, calls } = mockClient(emptyPage);
    const tx = new TransactionMethods(client);

    await tx.getTransferData(ADDR_CS);

    expect(calls[0].params).toEqual([ADDR_LC, null, null, null, null, 50, null]);
  });

  test('checksums from/to in results and passes the data blob through untouched', async () => {
    const data = '0x010001002f676f7420796f757220474e4f206261636b2e' as `0x${string}`;
    const { client } = mockClient({
      results: [
        {
          blockNumber: 46653686,
          timestamp: 1700000000,
          transactionIndex: 9,
          logIndex: -1,
          transactionHash: '0xabc' as `0x${string}`,
          from: ADDR_LC as Address,
          to: COUNTER_LC as Address,
          data,
        },
      ],
      hasMore: true,
      nextCursor: 'next',
    });
    const tx = new TransactionMethods(client);

    const page = await tx.getTransferData(ADDR_CS, 'sent');

    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe('next');
    expect(page.results[0].from).toBe(ADDR_CS);
    expect(page.results[0].to).toBe(COUNTER_CS);
    expect(page.results[0].data).toBe(data); // hex blob is longer than 40 chars → never mistaken for an address
  });
});
