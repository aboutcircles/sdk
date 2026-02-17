[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / JsonRpcResponse

# Interface: JsonRpcResponse\<TResult\>

Defined in: [packages/types/src/rpc.ts:18](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L18)

JSON-RPC response structure

## Type Parameters

### TResult

`TResult` = `unknown`

## Properties

### jsonrpc

```ts
jsonrpc: "2.0";
```

Defined in: [packages/types/src/rpc.ts:19](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L19)

***

### id

```ts
id: string | number;
```

Defined in: [packages/types/src/rpc.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L20)

***

### result?

```ts
optional result: TResult;
```

Defined in: [packages/types/src/rpc.ts:21](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L21)

***

### error?

```ts
optional error: object;
```

Defined in: [packages/types/src/rpc.ts:22](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/rpc.ts#L22)

#### code

```ts
code: number;
```

#### message

```ts
message: string;
```

#### data?

```ts
optional data: unknown;
```
