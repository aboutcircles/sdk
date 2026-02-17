[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / AdvancedTransferOptions

# Interface: AdvancedTransferOptions

Defined in: [packages/types/src/pathfinding.ts:96](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L96)

Advanced transfer options
Extends FindPathParams to add transfer-specific options

## Extends

- `Omit`\<[`FindPathParams`](FindPathParams.md), `"from"` \| `"to"` \| `"targetFlow"`\>

## Properties

### useWrappedBalances?

```ts
optional useWrappedBalances: boolean;
```

Defined in: [packages/types/src/pathfinding.ts:33](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L33)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`useWrappedBalances`](FindPathParams.md#usewrappedbalances)

***

### fromTokens?

```ts
optional fromTokens: `0x${string}`[];
```

Defined in: [packages/types/src/pathfinding.ts:34](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L34)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`fromTokens`](FindPathParams.md#fromtokens)

***

### toTokens?

```ts
optional toTokens: `0x${string}`[];
```

Defined in: [packages/types/src/pathfinding.ts:35](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L35)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`toTokens`](FindPathParams.md#totokens)

***

### excludeFromTokens?

```ts
optional excludeFromTokens: `0x${string}`[];
```

Defined in: [packages/types/src/pathfinding.ts:36](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L36)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`excludeFromTokens`](FindPathParams.md#excludefromtokens)

***

### excludeToTokens?

```ts
optional excludeToTokens: `0x${string}`[];
```

Defined in: [packages/types/src/pathfinding.ts:37](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L37)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`excludeToTokens`](FindPathParams.md#excludetotokens)

***

### simulatedBalances?

```ts
optional simulatedBalances: SimulatedBalance[];
```

Defined in: [packages/types/src/pathfinding.ts:38](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L38)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`simulatedBalances`](FindPathParams.md#simulatedbalances)

***

### simulatedTrusts?

```ts
optional simulatedTrusts: SimulatedTrust[];
```

Defined in: [packages/types/src/pathfinding.ts:39](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L39)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`simulatedTrusts`](FindPathParams.md#simulatedtrusts)

***

### maxTransfers?

```ts
optional maxTransfers: number;
```

Defined in: [packages/types/src/pathfinding.ts:40](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L40)

#### Inherited from

[`FindPathParams`](FindPathParams.md).[`maxTransfers`](FindPathParams.md#maxtransfers)

***

### txData?

```ts
optional txData: Uint8Array<ArrayBufferLike>;
```

Defined in: [packages/types/src/pathfinding.ts:100](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/pathfinding.ts#L100)

Custom data to attach to the transfer (optional)
