[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [transfers/src](../README.md) / TransferError

# Class: TransferError

Defined in: [packages/transfers/src/errors.ts:12](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L12)

Base error for transfers package

## Extends

- `CirclesError`\<[`TransfersErrorSource`](../type-aliases/TransfersErrorSource.md)\>

## Constructors

### Constructor

```ts
new TransferError(message, options?): TransferError;
```

Defined in: [packages/transfers/src/errors.ts:13](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L13)

#### Parameters

##### message

`string`

##### options?

###### code?

`string` \| `number`

###### source?

[`TransfersErrorSource`](../type-aliases/TransfersErrorSource.md)

###### cause?

`unknown`

###### context?

`Record`\<`string`, `any`\>

#### Returns

`TransferError`

#### Overrides

```ts
CirclesError<TransfersErrorSource>.constructor
```

## Methods

### noPathFound()

```ts
static noPathFound(
   from, 
   to, 
   reason?): TransferError;
```

Defined in: [packages/transfers/src/errors.ts:28](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L28)

Error when no valid transfer path is found

#### Parameters

##### from

`` `0x${string}` ``

##### to

`` `0x${string}` ``

##### reason?

`string`

#### Returns

`TransferError`

***

### insufficientBalance()

```ts
static insufficientBalance(
   requested, 
   available, 
   from, 
   to): TransferError;
```

Defined in: [packages/transfers/src/errors.ts:42](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L42)

Error when balance is insufficient for the requested transfer

#### Parameters

##### requested

`bigint`

##### available

`bigint`

##### from

`` `0x${string}` ``

##### to

`` `0x${string}` ``

#### Returns

`TransferError`

***

### wrappedTokensRequired()

```ts
static wrappedTokensRequired(): TransferError;
```

Defined in: [packages/transfers/src/errors.ts:66](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L66)

Error when wrapped tokens are needed but not enabled

#### Returns

`TransferError`

***

### unregisteredAvatars()

```ts
static unregisteredAvatars(addresses): TransferError;
```

Defined in: [packages/transfers/src/errors.ts:79](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L79)

Error when flow matrix contains unregistered avatars

#### Parameters

##### addresses

`` `0x${string}` ``[]

#### Returns

`TransferError`

***

### flowMatrixMismatch()

```ts
static flowMatrixMismatch(terminalSum, expected): TransferError;
```

Defined in: [packages/transfers/src/errors.ts:96](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L96)

Error when flow matrix terminal sum doesn't match expected amount

#### Parameters

##### terminalSum

`bigint`

##### expected

`bigint`

#### Returns

`TransferError`

***

### emptyPath()

```ts
static emptyPath(from, to): TransferError;
```

Defined in: [packages/transfers/src/errors.ts:113](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/transfers/src/errors.ts#L113)

Error when transfer path is empty

#### Parameters

##### from

`` `0x${string}` ``

##### to

`` `0x${string}` ``

#### Returns

`TransferError`
