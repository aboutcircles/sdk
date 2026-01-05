[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / DemurrageCirclesContract

# Class: DemurrageCirclesContract

Defined in: [packages/core/src/contracts/demurrageCircles.ts:23](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/demurrageCircles.ts#L23)

DemurrageCircles Contract Wrapper
Provides type-safe methods for interacting with Circles DemurrageCircles (ERC20 wrapper) contracts

Demurrage circles apply a discount over time, reducing the balance gradually.
This wrapper includes demurrage-specific methods in addition to standard ERC20 functionality.

Note: DemurrageCircles contracts have multiple instances (not a singleton).
Create instances with specific contract addresses.

## Example

```typescript
const demurrageCircles = new DemurrageCirclesContract({
  address: '0x...', // specific DemurrageCircles instance address
  rpcUrl: 'https://rpc.gnosischain.com'
});
```

## Extends

- `BaseWrappedCirclesContract`\<*typeof* `demurrageCirclesAbi`\>

## Constructors

### Constructor

```ts
new DemurrageCirclesContract(config): DemurrageCirclesContract;
```

Defined in: [packages/core/src/contracts/demurrageCircles.ts:24](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/demurrageCircles.ts#L24)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`DemurrageCirclesContract`

#### Overrides

```ts
BaseWrappedCirclesContract<typeof demurrageCirclesAbi>.constructor
```

## Properties

### address

```ts
readonly address: `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:9](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L9)

#### Inherited from

```ts
BaseWrappedCirclesContract.address
```

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

Defined in: [packages/core/src/contracts/contract.ts:10](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L10)

#### Inherited from

```ts
BaseWrappedCirclesContract.abi
```

***

### rpcUrl

```ts
protected rpcUrl: string;
```

Defined in: [packages/core/src/contracts/contract.ts:11](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L11)

#### Inherited from

```ts
BaseWrappedCirclesContract.rpcUrl
```

## Methods

### DOMAIN\_SEPARATOR()

```ts
DOMAIN_SEPARATOR(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:16](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L16)

Get the EIP-712 domain separator

#### Returns

`Promise`\<`` `0x${string}` ``\>

#### Inherited from

```ts
BaseWrappedCirclesContract.DOMAIN_SEPARATOR
```

***

### avatar()

```ts
avatar(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:23](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L23)

Get the avatar address associated with this wrapper

#### Returns

`Promise`\<`` `0x${string}` ``\>

#### Inherited from

```ts
BaseWrappedCirclesContract.avatar
```

***

### circlesIdentifier()

```ts
circlesIdentifier(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:30](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L30)

Get the Circles identifier (token ID)

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.circlesIdentifier
```

***

### hub()

```ts
hub(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:37](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L37)

Get the Hub contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

#### Inherited from

```ts
BaseWrappedCirclesContract.hub
```

***

### nameRegistry()

```ts
nameRegistry(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:44](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L44)

Get the NameRegistry contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

#### Inherited from

```ts
BaseWrappedCirclesContract.nameRegistry
```

***

### inflationDayZero()

```ts
inflationDayZero(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:51](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L51)

Get the inflation day zero timestamp

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.inflationDayZero
```

***

### name()

```ts
name(): Promise<string>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:58](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L58)

Get the token name

#### Returns

`Promise`\<`string`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.name
```

***

### symbol()

```ts
symbol(): Promise<string>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:65](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L65)

Get the token symbol

#### Returns

`Promise`\<`string`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.symbol
```

***

### decimals()

```ts
decimals(): Promise<number>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:72](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L72)

Get the token decimals

#### Returns

`Promise`\<`number`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.decimals
```

***

### totalSupply()

```ts
totalSupply(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:79](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L79)

Get the total supply

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.totalSupply
```

***

### balanceOf()

```ts
balanceOf(account): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:86](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L86)

Get the balance of an account

#### Parameters

##### account

`` `0x${string}` ``

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.balanceOf
```

***

### allowance()

```ts
allowance(owner, spender): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:93](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L93)

Get the allowance of a spender for an owner

#### Parameters

##### owner

`` `0x${string}` ``

##### spender

`` `0x${string}` ``

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.allowance
```

***

### nonces()

```ts
nonces(owner): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:100](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L100)

Get the nonce for permit signatures

#### Parameters

##### owner

`` `0x${string}` ``

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.nonces
```

***

### day()

```ts
day(timestamp): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:107](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L107)

Calculate the current day from a timestamp

#### Parameters

##### timestamp

`bigint`

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.day
```

***

### convertDemurrageToInflationaryValue()

```ts
convertDemurrageToInflationaryValue(demurrageValue, dayUpdated): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:114](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L114)

Convert a demurraged value to inflationary value

#### Parameters

##### demurrageValue

`bigint`

##### dayUpdated

`bigint`

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.convertDemurrageToInflationaryValue
```

***

### convertInflationaryToDemurrageValue()

```ts
convertInflationaryToDemurrageValue(inflationaryValue, day): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:121](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L121)

Convert an inflationary value to demurraged value

#### Parameters

##### inflationaryValue

`bigint`

##### day

`bigint`

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.convertInflationaryToDemurrageValue
```

***

### convertBatchDemurrageToInflationaryValues()

```ts
convertBatchDemurrageToInflationaryValues(demurrageValues, dayUpdated): Promise<readonly bigint[]>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:128](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L128)

Convert batch of demurraged values to inflationary values

#### Parameters

##### demurrageValues

readonly `bigint`[]

##### dayUpdated

`bigint`

#### Returns

`Promise`\<readonly `bigint`[]\>

#### Inherited from

```ts
BaseWrappedCirclesContract.convertBatchDemurrageToInflationaryValues
```

***

### convertBatchInflationaryToDemurrageValues()

```ts
convertBatchInflationaryToDemurrageValues(inflationaryValues, day): Promise<readonly bigint[]>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:135](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L135)

Convert batch of inflationary values to demurraged values

#### Parameters

##### inflationaryValues

readonly `bigint`[]

##### day

`bigint`

#### Returns

`Promise`\<readonly `bigint`[]\>

#### Inherited from

```ts
BaseWrappedCirclesContract.convertBatchInflationaryToDemurrageValues
```

***

### toTokenId()

```ts
toTokenId(avatar): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:142](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L142)

Convert avatar address to token ID

#### Parameters

##### avatar

`` `0x${string}` ``

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.toTokenId
```

***

### eip712Domain()

```ts
eip712Domain(): Promise<readonly [`0x${string}`, string, string, bigint, `0x${string}`, `0x${string}`, readonly bigint[]]>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:149](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L149)

Get EIP-712 domain information

#### Returns

`Promise`\<readonly \[`` `0x${string}` ``, `string`, `string`, `bigint`, `` `0x${string}` ``, `` `0x${string}` ``, readonly `bigint`[]\]\>

#### Inherited from

```ts
BaseWrappedCirclesContract.eip712Domain
```

***

### supportsInterface()

```ts
supportsInterface(interfaceId): Promise<boolean>;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:156](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L156)

Check if interface is supported

#### Parameters

##### interfaceId

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

```ts
BaseWrappedCirclesContract.supportsInterface
```

***

### transfer()

```ts
transfer(to, amount): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:163](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L163)

Transfer tokens to another address

#### Parameters

##### to

`` `0x${string}` ``

##### amount

`bigint`

#### Returns

`TransactionRequest`

#### Inherited from

```ts
BaseWrappedCirclesContract.transfer
```

***

### transferFrom()

```ts
transferFrom(
   from, 
   to, 
   amount): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:174](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L174)

Transfer tokens from one address to another

#### Parameters

##### from

`` `0x${string}` ``

##### to

`` `0x${string}` ``

##### amount

`bigint`

#### Returns

`TransactionRequest`

#### Inherited from

```ts
BaseWrappedCirclesContract.transferFrom
```

***

### approve()

```ts
approve(spender, amount): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:185](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L185)

Approve a spender to spend tokens

#### Parameters

##### spender

`` `0x${string}` ``

##### amount

`bigint`

#### Returns

`TransactionRequest`

#### Inherited from

```ts
BaseWrappedCirclesContract.approve
```

***

### increaseAllowance()

```ts
increaseAllowance(spender, addedValue): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:196](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L196)

Increase the allowance of a spender

#### Parameters

##### spender

`` `0x${string}` ``

##### addedValue

`bigint`

#### Returns

`TransactionRequest`

#### Inherited from

```ts
BaseWrappedCirclesContract.increaseAllowance
```

***

### decreaseAllowance()

```ts
decreaseAllowance(spender, subtractedValue): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:207](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L207)

Decrease the allowance of a spender

#### Parameters

##### spender

`` `0x${string}` ``

##### subtractedValue

`bigint`

#### Returns

`TransactionRequest`

#### Inherited from

```ts
BaseWrappedCirclesContract.decreaseAllowance
```

***

### unwrap()

```ts
unwrap(amount): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:218](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L218)

Unwrap Circles back to ERC1155

#### Parameters

##### amount

`bigint`

#### Returns

`TransactionRequest`

#### Inherited from

```ts
BaseWrappedCirclesContract.unwrap
```

***

### permit()

```ts
permit(
   owner, 
   spender, 
   permitValue, 
   deadline, 
   v, 
   r, 
   s): TransactionRequest;
```

Defined in: [packages/core/src/contracts/baseWrappedCircles.ts:229](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/baseWrappedCircles.ts#L229)

Permit approval via signature (EIP-2612)

#### Parameters

##### owner

`` `0x${string}` ``

##### spender

`` `0x${string}` ``

##### permitValue

`bigint`

##### deadline

`bigint`

##### v

`number`

##### r

`` `0x${string}` ``

##### s

`` `0x${string}` ``

#### Returns

`TransactionRequest`

#### Inherited from

```ts
BaseWrappedCirclesContract.permit
```

***

### read()

```ts
read(
   functionName, 
   args?, 
options?): Promise<unknown>;
```

Defined in: [packages/core/src/contracts/contract.ts:29](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L29)

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

```ts
BaseWrappedCirclesContract.read
```

***

### encodeWrite()

```ts
encodeWrite(functionName, args?): `0x${string}`;
```

Defined in: [packages/core/src/contracts/contract.ts:81](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/contract.ts#L81)

Encode transaction data for write functions

#### Parameters

##### functionName

`string`

##### args?

readonly `unknown`[]

#### Returns

`` `0x${string}` ``

#### Inherited from

```ts
BaseWrappedCirclesContract.encodeWrite
```

***

### balanceOfOnDay()

```ts
balanceOfOnDay(account, day): Promise<readonly [bigint, bigint]>;
```

Defined in: [packages/core/src/contracts/demurrageCircles.ts:46](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/demurrageCircles.ts#L46)

Get the balance of an account on a specific day
This is a demurrage-specific feature that calculates historical balance
accounting for the demurrage discount applied over time.

#### Parameters

##### account

`` `0x${string}` ``

The account address to check

##### day

`bigint`

The day number to check the balance for

#### Returns

`Promise`\<readonly \[`bigint`, `bigint`\]\>

[balanceOnDay, discountCost] - The balance on that day and the discount cost

***

### discountedBalances()

```ts
discountedBalances(account): Promise<readonly [bigint, bigint]>;
```

Defined in: [packages/core/src/contracts/demurrageCircles.ts:57](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/core/src/contracts/demurrageCircles.ts#L57)

Get the discounted balance information for an account
Returns the current discounted balance and when it was last updated.

#### Parameters

##### account

`` `0x${string}` ``

The account address to check

#### Returns

`Promise`\<readonly \[`bigint`, `bigint`\]\>

[balance, lastUpdatedDay] - Current discounted balance and the day it was last updated
