[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [runner/src](../README.md) / chains

# Variable: chains

```ts
const chains: object;
```

Defined in: [packages/runner/src/chain-types.ts:60](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/runner/src/chain-types.ts#L60)

Pre-configured chain configs for common networks.
Use these instead of importing from viem/chains to avoid type mismatches.

## Type Declaration

### gnosis

```ts
readonly gnosis: object;
```

#### gnosis.id

```ts
id: number = 100;
```

#### gnosis.name

```ts
name: string = 'Gnosis';
```

#### gnosis.nativeCurrency

```ts
nativeCurrency: object;
```

#### gnosis.nativeCurrency.name

```ts
name: string = 'xDAI';
```

#### gnosis.nativeCurrency.symbol

```ts
symbol: string = 'xDAI';
```

#### gnosis.nativeCurrency.decimals

```ts
decimals: number = 18;
```

#### gnosis.rpcUrls

```ts
rpcUrls: object;
```

#### gnosis.rpcUrls.default

```ts
default: object;
```

#### gnosis.rpcUrls.default.http

```ts
http: readonly ["https://rpc.gnosischain.com"];
```

### chiado

```ts
readonly chiado: object;
```

#### chiado.id

```ts
id: number = 10200;
```

#### chiado.name

```ts
name: string = 'Chiado';
```

#### chiado.nativeCurrency

```ts
nativeCurrency: object;
```

#### chiado.nativeCurrency.name

```ts
name: string = 'xDAI';
```

#### chiado.nativeCurrency.symbol

```ts
symbol: string = 'xDAI';
```

#### chiado.nativeCurrency.decimals

```ts
decimals: number = 18;
```

#### chiado.rpcUrls

```ts
rpcUrls: object;
```

#### chiado.rpcUrls.default

```ts
default: object;
```

#### chiado.rpcUrls.default.http

```ts
http: readonly ["https://rpc.chiadochain.net"];
```

### gnosisChiado

#### Get Signature

```ts
get gnosisChiado(): object;
```

Alias for chiado - common testnet naming convention

##### Returns

`object`

###### id

```ts
id: number = 10200;
```

###### name

```ts
name: string = 'Chiado';
```

###### nativeCurrency

```ts
nativeCurrency: object;
```

###### nativeCurrency.name

```ts
name: string = 'xDAI';
```

###### nativeCurrency.symbol

```ts
symbol: string = 'xDAI';
```

###### nativeCurrency.decimals

```ts
decimals: number = 18;
```

###### rpcUrls

```ts
rpcUrls: object;
```

###### rpcUrls.default

```ts
default: object;
```

###### rpcUrls.default.http

```ts
http: readonly ["https://rpc.chiadochain.net"];
```
