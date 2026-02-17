[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [transfers/src](../README.md) / TransferBuilder

# Class: TransferBuilder

Defined in: [packages/transfers/src/TransferBuilder.ts:18](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/transfers/src/TransferBuilder.ts#L18)

TransferBuilder constructs transfer transactions without executing them
Handles pathfinding, wrapped token unwrapping/wrapping, and flow matrix construction

## Constructors

### Constructor

```ts
new TransferBuilder(core): TransferBuilder;
```

Defined in: [packages/transfers/src/TransferBuilder.ts:22](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/transfers/src/TransferBuilder.ts#L22)

#### Parameters

##### core

`Core`

#### Returns

`TransferBuilder`

## Methods

### constructAdvancedTransfer()

```ts
constructAdvancedTransfer(
   from, 
   to, 
   amount, 
options?): Promise<object[]>;
```

Defined in: [packages/transfers/src/TransferBuilder.ts:37](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/transfers/src/TransferBuilder.ts#L37)

Construct an advanced transfer transaction
Returns the list of transactions to execute without executing them

#### Parameters

##### from

`` `0x${string}` ``

Sender address

##### to

`` `0x${string}` ``

Recipient address

##### amount

Amount to transfer (in atto-circles)

`number` | `bigint`

##### options?

`AdvancedTransferOptions`

Advanced transfer options

#### Returns

`Promise`\<`object`[]\>

Array of transactions to execute in order

***

### constructReplenish()

```ts
constructReplenish(avatarAddress, options?): Promise<object[]>;
```

Defined in: [packages/transfers/src/TransferBuilder.ts:227](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/transfers/src/TransferBuilder.ts#L227)

Construct a replenish transaction to convert wrapped/other tokens into unwrapped personal CRC
This uses pathfinder to find the best way to convert available tokens (including wrapped tokens)
into the sender's own unwrapped ERC1155 personal CRC tokens

#### Parameters

##### avatarAddress

`` `0x${string}` ``

The avatar address to replenish (convert tokens to their personal CRC)

##### options?

`Omit`\<`AdvancedTransferOptions`, `"txData"`\>

Optional pathfinding options

#### Returns

`Promise`\<`object`[]\>

Array of transactions to execute in order to perform the replenish
