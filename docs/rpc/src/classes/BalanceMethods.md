[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / BalanceMethods

# Class: BalanceMethods

Defined in: [packages/rpc/src/methods/balance.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/balance.ts#L9)

Balance query RPC methods

## Constructors

### Constructor

```ts
new BalanceMethods(client): BalanceMethods;
```

Defined in: [packages/rpc/src/methods/balance.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/balance.ts#L10)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`BalanceMethods`

## Methods

### getTotalBalance()

```ts
getTotalBalance(address, asTimeCircles): Promise<bigint>;
```

Defined in: [packages/rpc/src/methods/balance.ts:25](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/balance.ts#L25)

Get the total v2 Circles balance of an account

#### Parameters

##### address

`` `0x${string}` ``

The avatar address to query

##### asTimeCircles

`boolean` = `true`

Whether to return balance as TimeCircles (default: true)

#### Returns

`Promise`\<`bigint`\>

The total v2 balance in attoCircles (10^18 per Circle) as bigint

#### Example

```typescript
const balance = await rpc.balance.getTotalBalance('0xcadd4ea3bcc361fc4af2387937d7417be8d7dfc2');
console.log(balance); // 1000000000000000000n (1 Circle in attoCircles)
```

***

### getTokenBalances()

```ts
getTokenBalances(address): Promise<TokenBalance[]>;
```

Defined in: [packages/rpc/src/methods/balance.ts:45](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/balance.ts#L45)

Query the balance breakdown of a specific avatar address

#### Parameters

##### address

`` `0x${string}` ``

The avatar address to query

#### Returns

`Promise`\<`TokenBalance`[]\>

Array of token balances (amounts as bigint)

#### Example

```typescript
const balances = await rpc.balance.getTokenBalances('0x7cadf434b692ca029d950607a4b3f139c30d4e98');
console.log(balances);
```
