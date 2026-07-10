[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / TransactionMethods

# Class: TransactionMethods

Defined in: [packages/rpc/src/methods/transaction.ts:42](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/transaction.ts#L42)

Transaction history RPC methods

## Constructors

### Constructor

```ts
new TransactionMethods(client): TransactionMethods;
```

Defined in: [packages/rpc/src/methods/transaction.ts:43](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/transaction.ts#L43)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`TransactionMethods`

## Methods

### getTransactionHistory()

```ts
getTransactionHistory(
   avatar, 
   limit, 
sortOrder): PagedQuery<TransactionHistoryRow>;
```

Defined in: [packages/rpc/src/methods/transaction.ts:73](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/transaction.ts#L73)

Get transaction history for an address using cursor-based pagination

Returns a PagedQuery instance that can be used to fetch transaction history page by page.
Automatically calculates circle amounts for each v2 transaction.

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query transaction history for

##### limit

`number` = `50`

Number of transactions per page (default: 50)

##### sortOrder

Sort order for results (default: 'DESC')

`"ASC"` | `"DESC"`

#### Returns

[`PagedQuery`](PagedQuery.md)\<[`TransactionHistoryRow`](../interfaces/TransactionHistoryRow.md)\>

PagedQuery instance for iterating through transaction history

#### Example

```typescript
const query = rpc.transaction.getTransactionHistory('0xAvatar...', 50);

// Get first page
await query.queryNextPage();
query.currentPage.results.forEach(tx => {
  console.log(`${tx.from} -> ${tx.to}: ${tx.circles} CRC`);
});

// Get next page if available
if (query.currentPage.hasMore) {
  await query.queryNextPage();
  // Process next page...
}
```
