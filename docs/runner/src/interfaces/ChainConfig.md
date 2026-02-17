[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / ChainConfig

# Interface: ChainConfig

Defined in: [packages/runner/src/chain-types.ts:8](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L8)

Flexible chain configuration interface.
Accepts both full viem Chain objects and minimal chain configs.
This allows the runner to work without requiring the exact viem Chain branded type.

## Properties

### id

```ts
id: number;
```

Defined in: [packages/runner/src/chain-types.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L9)

***

### name

```ts
name: string;
```

Defined in: [packages/runner/src/chain-types.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L10)

***

### nativeCurrency

```ts
nativeCurrency: object;
```

Defined in: [packages/runner/src/chain-types.ts:11](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L11)

#### name

```ts
name: string;
```

#### symbol

```ts
symbol: string;
```

#### decimals

```ts
decimals: number;
```

***

### rpcUrls

```ts
rpcUrls: object;
```

Defined in: [packages/runner/src/chain-types.ts:16](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L16)

#### default

```ts
default: object;
```

##### default.http

```ts
http: readonly string[];
```
