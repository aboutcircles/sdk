[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / TokenMethods

# Class: TokenMethods

Defined in: [packages/rpc/src/methods/token.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/token.ts#L9)

Token information RPC methods

## Constructors

### Constructor

```ts
new TokenMethods(client): TokenMethods;
```

Defined in: [packages/rpc/src/methods/token.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/token.ts#L10)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`TokenMethods`

## Methods

### getTokenInfo()

```ts
getTokenInfo(address): Promise<TokenInfo | undefined>;
```

Defined in: [packages/rpc/src/methods/token.ts:24](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/token.ts#L24)

Get token information for a specific token address

#### Parameters

##### address

`` `0x${string}` ``

The token address to query

#### Returns

`Promise`\<`TokenInfo` \| `undefined`\>

Token information or undefined if not found

#### Example

```typescript
const tokenInfo = await rpc.token.getTokenInfo('0x0d8c4901dd270fe101b8014a5dbecc4e4432eb1e');
console.log(tokenInfo);
```

***

### getTokenInfoBatch()

```ts
getTokenInfoBatch(addresses): Promise<TokenInfo[]>;
```

Defined in: [packages/rpc/src/methods/token.ts:43](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/token.ts#L43)

Get token information for multiple token addresses in batch

#### Parameters

##### addresses

`` `0x${string}` ``[]

Array of token addresses to query

#### Returns

`Promise`\<`TokenInfo`[]\>

Array of token information objects

#### Example

```typescript
const tokenInfos = await rpc.token.getTokenInfoBatch([
  '0x0d8c4901dd270fe101b8014a5dbecc4e4432eb1e',
  '0x86533d1ada8ffbe7b6f7244f9a1b707f7f3e239b'
]);
```

***

### getTokenHolders()

```ts
getTokenHolders(
   tokenAddress, 
   limit, 
cursor?): Promise<PagedResponse<TokenHolderRow>>;
```

Defined in: [packages/rpc/src/methods/token.ts:74](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/token.ts#L74)

Get token holders for a specific token address with pagination

#### Parameters

##### tokenAddress

`` `0x${string}` ``

The token address to query holders for

##### limit

`number` = `100`

Maximum number of results to return (default: 100, max: 1000)

##### cursor?

`string` | `null`

#### Returns

`Promise`\<`PagedResponse`\<`TokenHolderRow`\>\>

Array of token holders with their balances

#### Example

```typescript
const holders = await rpc.token.getTokenHolders('0x42cedde51198d1773590311e2a340dc06b24cb37', 100);
console.log(`Found ${holders.length} holders`);
holders.forEach(holder => {
  console.log(`${holder.account}: ${holder.balance}`);
});
```
