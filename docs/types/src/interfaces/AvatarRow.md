[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [types/src](../README.md) / AvatarRow

# Interface: AvatarRow

Defined in: [packages/types/src/sdk.ts:20](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L20)

Avatar row data from RPC

## Properties

### avatar

```ts
avatar: `0x${string}`;
```

Defined in: [packages/types/src/sdk.ts:22](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L22)

The avatar's address (canonical field name from RPC)

***

### ~~address~~

```ts
address: `0x${string}`;
```

Defined in: [packages/types/src/sdk.ts:27](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L27)

The avatar's address (alias for backward compatibility)

#### Deprecated

Use `avatar` instead. This field will be removed in a future version.

***

### version

```ts
version: number;
```

Defined in: [packages/types/src/sdk.ts:29](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L29)

Circles version (1 or 2)

***

### type

```ts
type: AvatarType;
```

Defined in: [packages/types/src/sdk.ts:31](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L31)

Avatar type indicating how it was registered

***

### cidV0?

```ts
optional cidV0: string;
```

Defined in: [packages/types/src/sdk.ts:33](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L33)

Profile CID stored in the name registry

***

### name?

```ts
optional name: string;
```

Defined in: [packages/types/src/sdk.ts:35](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/types/src/sdk.ts#L35)

Name from the name registry
