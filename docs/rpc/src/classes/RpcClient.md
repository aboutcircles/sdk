[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / RpcClient

# Class: RpcClient

Defined in: [packages/rpc/src/client.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/client.ts#L10)

Base RPC client for making JSON-RPC calls to Circles RPC endpoints
Supports both HTTP requests and WebSocket subscriptions

## Constructors

### Constructor

```ts
new RpcClient(rpcUrl): RpcClient;
```

Defined in: [packages/rpc/src/client.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/client.ts#L27)

#### Parameters

##### rpcUrl

`string`

#### Returns

`RpcClient`

## Methods

### call()

```ts
call<TParams, TResult>(method, params): Promise<TResult>;
```

Defined in: [packages/rpc/src/client.ts:34](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/client.ts#L34)

Make a JSON-RPC call

#### Type Parameters

##### TParams

`TParams` = `unknown`[]

##### TResult

`TResult` = `unknown`

#### Parameters

##### method

`string`

##### params

`TParams`

#### Returns

`Promise`\<`TResult`\>

***

### setRpcUrl()

```ts
setRpcUrl(rpcUrl): void;
```

Defined in: [packages/rpc/src/client.ts:85](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/client.ts#L85)

Update the RPC URL

#### Parameters

##### rpcUrl

`string`

#### Returns

`void`

***

### getRpcUrl()

```ts
getRpcUrl(): string;
```

Defined in: [packages/rpc/src/client.ts:92](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/client.ts#L92)

Get the current RPC URL

#### Returns

`string`

***

### subscribe()

```ts
subscribe(address?): Promise<Observable<CirclesEvent>>;
```

Defined in: [packages/rpc/src/client.ts:218](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/client.ts#L218)

Subscribe to Circles events via WebSocket

#### Parameters

##### address?

`` `0x${string}` ``

Optional address to filter events for a specific avatar

#### Returns

`Promise`\<[`Observable`](Observable.md)\<`CirclesEvent`\>\>

Observable that emits CirclesEvent objects
