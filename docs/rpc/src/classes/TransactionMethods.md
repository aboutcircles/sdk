[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / TransactionMethods

# Class: TransactionMethods

Defined in: [packages/rpc/src/methods/transaction.ts:8](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/transaction.ts#L8)

Transaction history RPC methods

## Constructors

### Constructor

```ts
new TransactionMethods(client): TransactionMethods;
```

Defined in: [packages/rpc/src/methods/transaction.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/transaction.ts#L9)

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
cursor?): Promise<PagedResponse<TransactionHistoryRow>>;
```

Defined in: [packages/rpc/src/methods/transaction.ts:30](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/transaction.ts#L30)

Get transaction history for an address

Uses the native RPC method which efficiently queries transfers and calculates
all circle amount formats server-side. Fetches all results using cursor-based
pagination up to the specified limit.

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query transaction history for

##### limit

`number` = `50`

Maximum number of transactions to return (default: 50)

##### cursor?

`string` | `null`

#### Returns

`Promise`\<`PagedResponse`\<`TransactionHistoryRow`\>\>

Array of transaction history rows with all circle amount formats

#### Example

```typescript
const history = await rpc.transaction.getTransactionHistory('0xAvatar...', 50);
history.forEach(tx => {
  console.log(`${tx.from} -> ${tx.to}: ${tx.circles} CRC`);
});
```

***

### getTransactionHistoryEnriched()

```ts
getTransactionHistoryEnriched(
   avatar, 
   fromBlock, 
   toBlock, 
   limit, 
cursor?): Promise<PagedResponse<EnrichedTransaction>>;
```

Defined in: [packages/rpc/src/methods/transaction.ts:56](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/transaction.ts#L56)

Get enriched transaction history
Includes profile data and pre-calculated balance formats

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query

##### fromBlock

`number` = `0`

##### toBlock

`number` | `null`

##### limit

`number` = `20`

Number of transactions per page (default: 20)

##### cursor?

Pagination cursor

`string` | `null`

#### Returns

`Promise`\<`PagedResponse`\<`EnrichedTransaction`\>\>

Paged response with enriched transactions
