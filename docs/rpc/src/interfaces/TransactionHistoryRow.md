[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / TransactionHistoryRow

# Interface: TransactionHistoryRow

Defined in: [packages/rpc/src/types.ts:12](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L12)

Transaction history row (base data from RPC)
Might include conversions between different circle representations

## Properties

### blockNumber

```ts
blockNumber: number;
```

Defined in: [packages/rpc/src/types.ts:13](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L13)

***

### timestamp

```ts
timestamp: number;
```

Defined in: [packages/rpc/src/types.ts:14](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L14)

***

### transactionIndex

```ts
transactionIndex: number;
```

Defined in: [packages/rpc/src/types.ts:15](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L15)

***

### logIndex

```ts
logIndex: number;
```

Defined in: [packages/rpc/src/types.ts:16](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L16)

***

### transactionHash

```ts
transactionHash: string;
```

Defined in: [packages/rpc/src/types.ts:17](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L17)

***

### version

```ts
version: number;
```

Defined in: [packages/rpc/src/types.ts:18](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L18)

***

### from

```ts
from: `0x${string}`;
```

Defined in: [packages/rpc/src/types.ts:19](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L19)

***

### to

```ts
to: `0x${string}`;
```

Defined in: [packages/rpc/src/types.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L20)

***

### id

```ts
id: string;
```

Defined in: [packages/rpc/src/types.ts:21](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L21)

***

### tokenAddress

```ts
tokenAddress: `0x${string}`;
```

Defined in: [packages/rpc/src/types.ts:22](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L22)

***

### value

```ts
value: string;
```

Defined in: [packages/rpc/src/types.ts:23](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L23)

***

### circles?

```ts
optional circles: number;
```

Defined in: [packages/rpc/src/types.ts:25](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L25)

Human-readable circle amount (demurraged)

***

### attoCircles?

```ts
optional attoCircles: bigint;
```

Defined in: [packages/rpc/src/types.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L27)

Atto-circles (demurraged, 18 decimals)

***

### staticCircles?

```ts
optional staticCircles: number;
```

Defined in: [packages/rpc/src/types.ts:29](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L29)

Static circles (inflationary, human-readable)

***

### staticAttoCircles?

```ts
optional staticAttoCircles: bigint;
```

Defined in: [packages/rpc/src/types.ts:31](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L31)

Atto-static circles (inflationary, 18 decimals)

***

### crc?

```ts
optional crc: number;
```

Defined in: [packages/rpc/src/types.ts:33](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L33)

Time Circles (CRC) human-readable

***

### attoCrc?

```ts
optional attoCrc: bigint;
```

Defined in: [packages/rpc/src/types.ts:35](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/types.ts#L35)

Atto-CRC (18 decimals)
