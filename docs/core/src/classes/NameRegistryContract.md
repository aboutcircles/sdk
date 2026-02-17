[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / NameRegistryContract

# Class: NameRegistryContract

Defined in: [packages/core/src/contracts/nameRegistry.ts:11](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L11)

NameRegistry Contract Wrapper
Provides type-safe methods for interacting with Circles NameRegistry contract

This is a singleton contract deployed at a fixed address.

## Extends

- [`Contract`](Contract.md)\<*typeof* `nameRegistryAbi`\>

## Constructors

### Constructor

```ts
new NameRegistryContract(config): NameRegistryContract;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:12](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L12)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`NameRegistryContract`

#### Overrides

[`Contract`](Contract.md).[`constructor`](Contract.md#constructor)

## Properties

### address

```ts
readonly address: `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:9](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L9)

#### Inherited from

[`Contract`](Contract.md).[`address`](Contract.md#address)

***

### abi

```ts
readonly abi: readonly [{
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}];
```

Defined in: [packages/core/src/contracts/contract.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L10)

#### Inherited from

[`Contract`](Contract.md).[`abi`](Contract.md#abi)

***

### rpcUrl

```ts
protected rpcUrl: string;
```

Defined in: [packages/core/src/contracts/contract.ts:11](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L11)

#### Inherited from

[`Contract`](Contract.md).[`rpcUrl`](Contract.md#rpcurl)

## Methods

### read()

```ts
read(
   functionName, 
   args?, 
options?): Promise<unknown>;
```

Defined in: [packages/core/src/contracts/contract.ts:29](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L29)

Read from contract (view/pure functions) using direct JSON-RPC call

#### Parameters

##### functionName

`string`

The contract function to call

##### args?

readonly `unknown`[]

Function arguments

##### options?

Optional call options

###### from?

`` `0x${string}` ``

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[`Contract`](Contract.md).[`read`](Contract.md#read)

***

### encodeWrite()

```ts
encodeWrite(functionName, args?): `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:81](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/contract.ts#L81)

Encode transaction data for write functions

#### Parameters

##### functionName

`string`

##### args?

readonly `unknown`[]

#### Returns

`` `0x${string}` ``

#### Inherited from

[`Contract`](Contract.md).[`encodeWrite`](Contract.md#encodewrite)

***

### DEFAULT\_CIRCLES\_NAME\_PREFIX()

```ts
DEFAULT_CIRCLES_NAME_PREFIX(): Promise<string>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:23](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L23)

Get the default Circles name prefix constant

#### Returns

`Promise`\<`string`\>

***

### DEFAULT\_CIRCLES\_SYMBOL()

```ts
DEFAULT_CIRCLES_SYMBOL(): Promise<string>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:30](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L30)

Get the default Circles symbol constant

#### Returns

`Promise`\<`string`\>

***

### MAX\_SHORT\_NAME()

```ts
MAX_SHORT_NAME(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:37](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L37)

Get the maximum short name value constant

#### Returns

`Promise`\<`bigint`\>

***

### hub()

```ts
hub(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:44](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L44)

Get the Hub contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### name()

```ts
name(avatar): Promise<string>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:51](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L51)

Get the name for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`string`\>

***

### symbol()

```ts
symbol(avatar): Promise<string>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:58](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L58)

Get the symbol for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`string`\>

***

### customNames()

```ts
customNames(avatar): Promise<string>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:65](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L65)

Get the custom name for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`string`\>

***

### customSymbols()

```ts
customSymbols(avatar): Promise<string>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:72](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L72)

Get the custom symbol for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`string`\>

***

### getMetadataDigest()

```ts
getMetadataDigest(avatar): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:79](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L79)

Get the metadata digest for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### avatarToMetaDataDigest()

```ts
avatarToMetaDataDigest(avatar): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:86](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L86)

Get the metadata digest for an avatar (mapping access)

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### shortNames()

```ts
shortNames(avatar): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:93](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L93)

Get the short name for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`bigint`\>

***

### shortNameToAvatar()

```ts
shortNameToAvatar(shortName): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:100](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L100)

Get the avatar address for a short name

#### Parameters

##### shortName

`bigint`

#### Returns

`Promise`\<`` `0x${string}` ``\>

***

### searchShortName()

```ts
searchShortName(avatar): Promise<readonly [bigint, bigint]>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:108](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L108)

Search for a valid short name for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<readonly \[`bigint`, `bigint`\]\>

[shortName, nonce]

***

### calculateShortNameWithNonce()

```ts
calculateShortNameWithNonce(avatar, nonce): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:115](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L115)

Calculate what short name would be generated for an avatar with a specific nonce

#### Parameters

##### avatar

`` `0x${string}` ``

##### nonce

`bigint`

#### Returns

`Promise`\<`bigint`\>

***

### isValidName()

```ts
isValidName(name): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:122](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L122)

Check if a name is valid according to Circles naming rules

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`boolean`\>

***

### isValidSymbol()

```ts
isValidSymbol(symbol): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:129](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L129)

Check if a symbol is valid according to Circles naming rules

#### Parameters

##### symbol

`string`

#### Returns

`Promise`\<`boolean`\>

***

### registerCustomName()

```ts
registerCustomName(avatar, name): TransactionRequest;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:136](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L136)

Register a custom name for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

##### name

`string`

#### Returns

`TransactionRequest`

***

### registerCustomSymbol()

```ts
registerCustomSymbol(avatar, symbol): TransactionRequest;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:147](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L147)

Register a custom symbol for an avatar

#### Parameters

##### avatar

`` `0x${string}` ``

##### symbol

`string`

#### Returns

`TransactionRequest`

***

### registerShortName()

```ts
registerShortName(value): TransactionRequest;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:158](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L158)

Register a short name for the caller (searches for available nonce)

#### Parameters

##### value

`bigint` = `...`

#### Returns

`TransactionRequest`

***

### registerShortNameWithNonce()

```ts
registerShortNameWithNonce(nonce): TransactionRequest;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:169](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L169)

Register a short name with a specific nonce

#### Parameters

##### nonce

`bigint`

#### Returns

`TransactionRequest`

***

### setMetadataDigest()

```ts
setMetadataDigest(avatar, metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:180](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L180)

Set metadata digest for an avatar (admin function)

#### Parameters

##### avatar

`` `0x${string}` ``

##### metadataDigest

`` `0x${string}` ``

#### Returns

`TransactionRequest`

***

### updateMetadataDigest()

```ts
updateMetadataDigest(metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/nameRegistry.ts:191](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/nameRegistry.ts#L191)

Update metadata digest for the caller

#### Parameters

##### metadataDigest

`` `0x${string}` ``

#### Returns

`TransactionRequest`
