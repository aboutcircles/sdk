[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / NetworkError

# Class: NetworkError

Defined in: [packages/core/src/errors.ts:110](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/errors.ts#L110)

Network-related errors

## Extends

- `CirclesError`\<[`CoreErrorSource`](../type-aliases/CoreErrorSource.md)\>

## Constructors

### Constructor

```ts
new NetworkError(message, options?): NetworkError;
```

Defined in: [packages/core/src/errors.ts:111](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/errors.ts#L111)

#### Parameters

##### message

`string`

##### options?

###### code?

`string` \| `number`

###### cause?

`unknown`

###### context?

`Record`\<`string`, `any`\>

#### Returns

`NetworkError`

#### Overrides

```ts
CirclesError<CoreErrorSource>.constructor
```

## Methods

### wrongNetwork()

```ts
static wrongNetwork(expectedChainId, actualChainId): NetworkError;
```

Defined in: [packages/core/src/errors.ts:125](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/errors.ts#L125)

Create error for wrong network

#### Parameters

##### expectedChainId

`number`

##### actualChainId

`number`

#### Returns

`NetworkError`

***

### connectionFailed()

```ts
static connectionFailed(reason, cause?): NetworkError;
```

Defined in: [packages/core/src/errors.ts:138](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/errors.ts#L138)

Create error for network connection issues

#### Parameters

##### reason

`string`

##### cause?

`unknown`

#### Returns

`NetworkError`

***

### unsupportedNetwork()

```ts
static unsupportedNetwork(chainId): NetworkError;
```

Defined in: [packages/core/src/errors.ts:149](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/errors.ts#L149)

Create error for unsupported network

#### Parameters

##### chainId

`number`

#### Returns

`NetworkError`
