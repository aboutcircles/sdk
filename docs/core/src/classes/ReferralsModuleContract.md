[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / ReferralsModuleContract

# Class: ReferralsModuleContract

Defined in: [packages/core/src/contracts/referralsModule.ts:13](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L13)

ReferralsModule Contract Wrapper
Provides type-safe methods for interacting with the ReferralsModule contract

This contract pre-deploys "pre-made" human CRC Safe accounts on behalf of origin inviters,
and lets invited humans claim those Safes using a device WebAuthn passkey plus an offchain
secret provided by the origin inviter.

## Extends

- [`Contract`](Contract.md)\<*typeof* `referralsModuleAbi`\>

## Constructors

### Constructor

```ts
new ReferralsModuleContract(config): ReferralsModuleContract;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:14](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L14)

#### Parameters

##### config

###### address

`` `0x${string}` ``

###### rpcUrl

`string`

#### Returns

`ReferralsModuleContract`

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

### createAccount()

```ts
createAccount(signer): TransactionRequest;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:30](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L30)

Pre-deploys a Safe for an origin inviter's offchain signer
Only callable by the Invitation Module Generic Call Proxy

#### Parameters

##### signer

`` `0x${string}` ``

The public address derived from the origin inviter's offchain secret key

#### Returns

`TransactionRequest`

Transaction request

***

### createAccounts()

```ts
createAccounts(signers): TransactionRequest;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:44](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L44)

Batch pre-deploys Safes for multiple signers
Only callable by the Invitation Module Generic Call Proxy

#### Parameters

##### signers

`` `0x${string}` ``[]

The list of public addresses derived from origin inviters' offchain secrets

#### Returns

`TransactionRequest`

Transaction request

***

### computeAddress()

```ts
computeAddress(signer): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:57](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L57)

Predicts the pre-made Safe address for a given signer without deploying it

#### Parameters

##### signer

`` `0x${string}` ``

The offchain public address chosen by the origin inviter

#### Returns

`Promise`\<`` `0x${string}` ``\>

The predicted Safe address

***

### claimAccount()

```ts
claimAccount(
   x, 
   y, 
   verifier, 
   signature): TransactionRequest;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:72](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L72)

Claims the pre-made Safe by proving knowledge of the offchain secret
and configuring the device WebAuthn passkey

#### Parameters

##### x

`bigint`

The X coordinate of the WebAuthn public key

##### y

`bigint`

The Y coordinate of the WebAuthn public key

##### verifier

`` `0x${string}` ``

The WebAuthn verifier/authenticator contract address

##### signature

`` `0x${string}` ``

The 65-byte ECDSA signature over the EIP-712 passkey digest

#### Returns

`TransactionRequest`

Transaction request

***

### claimAccountWithMetadata()

```ts
claimAccountWithMetadata(
   x, 
   y, 
   verifier, 
   signature, 
   metadataDigest): TransactionRequest;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:89](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L89)

Claims the pre-made Safe and sets Name Registry metadata in a single transaction

#### Parameters

##### x

`bigint`

The X coordinate of the passkey public key

##### y

`bigint`

The Y coordinate of the passkey public key

##### verifier

`` `0x${string}` ``

The verifier/authenticator contract address

##### signature

`` `0x${string}` ``

The 65-byte ECDSA signature over the EIP-712 passkey digest

##### metadataDigest

`` `0x${string}` ``

The metadata digest to set in the Name Registry

#### Returns

`TransactionRequest`

Transaction request

***

### claimAccountWithAffiliateGroup()

```ts
claimAccountWithAffiliateGroup(
   x, 
   y, 
   verifier, 
   signature, 
   affiliateGroup): TransactionRequest;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:112](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L112)

Claims the pre-made Safe and sets the affiliate group in a single transaction

#### Parameters

##### x

`bigint`

The X coordinate of the passkey public key

##### y

`bigint`

The Y coordinate of the passkey public key

##### verifier

`` `0x${string}` ``

The verifier/authenticator contract address

##### signature

`` `0x${string}` ``

The 65-byte ECDSA signature over the EIP-712 passkey digest

##### affiliateGroup

`` `0x${string}` ``

The affiliate group address to register

#### Returns

`TransactionRequest`

Transaction request

***

### claimAccountWithMetadataAndAffiliateGroup()

```ts
claimAccountWithMetadataAndAffiliateGroup(
   x, 
   y, 
   verifier, 
   signature, 
   metadataDigest, 
   affiliateGroup): TransactionRequest;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:136](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L136)

Claims the pre-made Safe, sets Name Registry metadata and affiliate group

#### Parameters

##### x

`bigint`

The X coordinate of the passkey public key

##### y

`bigint`

The Y coordinate of the passkey public key

##### verifier

`` `0x${string}` ``

The verifier/authenticator contract address

##### signature

`` `0x${string}` ``

The 65-byte ECDSA signature over the EIP-712 passkey digest

##### metadataDigest

`` `0x${string}` ``

The metadata digest to set in the Name Registry

##### affiliateGroup

`` `0x${string}` ``

The affiliate group address to register

#### Returns

`TransactionRequest`

Transaction request

***

### accounts()

```ts
accounts(signer): Promise<{
  account: `0x${string}`;
  claimed: boolean;
}>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:158](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L158)

Get the account record for a given signer

#### Parameters

##### signer

`` `0x${string}` ``

The offchain public address

#### Returns

`Promise`\<\{
  `account`: `` `0x${string}` ``;
  `claimed`: `boolean`;
\}\>

Object with account address and claimed status

***

### domainSeparator()

```ts
domainSeparator(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:167](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L167)

Get the EIP-712 domain separator

#### Returns

`Promise`\<`` `0x${string}` ``\>

The domain separator

***

### welcomeBonus()

```ts
welcomeBonus(): Promise<bigint>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:175](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L175)

Get the welcome bonus amount (target CRC balance after claim)

#### Returns

`Promise`\<`bigint`\>

The welcome bonus amount

***

### hub()

```ts
hub(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:183](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L183)

Get the Hub contract address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Hub address

***

### invitationModule()

```ts
invitationModule(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:191](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L191)

Get the Invitation Module address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Invitation Module address

***

### genericCallProxy()

```ts
genericCallProxy(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:199](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L199)

Get the Generic Call Proxy address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Generic Call Proxy address

***

### nameRegistry()

```ts
nameRegistry(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:207](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L207)

Get the Name Registry address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Name Registry address

***

### affiliateGroupRegistry()

```ts
affiliateGroupRegistry(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:215](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L215)

Get the Affiliate Group Registry address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Affiliate Group Registry address

***

### safeProxyFactory()

```ts
safeProxyFactory(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:223](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L223)

Get the Safe Proxy Factory address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Safe Proxy Factory address

***

### safeSingleton()

```ts
safeSingleton(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:231](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L231)

Get the Safe Singleton address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Safe Singleton address

***

### safe4337Module()

```ts
safe4337Module(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:239](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L239)

Get the Safe 4337 Module address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Safe 4337 Module address

***

### safeModuleSetup()

```ts
safeModuleSetup(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:247](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L247)

Get the Safe Module Setup address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Safe Module Setup address

***

### safeWebAuthnSharedSigner()

```ts
safeWebAuthnSharedSigner(): Promise<`0x${string}`>;
```

Defined in: [packages/core/src/contracts/referralsModule.ts:255](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/contracts/referralsModule.ts#L255)

Get the Safe WebAuthn Shared Signer address

#### Returns

`Promise`\<`` `0x${string}` ``\>

The Safe WebAuthn Shared Signer address
