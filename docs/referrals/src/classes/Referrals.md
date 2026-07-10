[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [referrals/src](../README.md) / Referrals

# Class: Referrals

Defined in: [packages/referrals/src/referrals.ts:11](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/referrals.ts#L11)

Referrals service client for storing and retrieving referral links

The referrals backend enables Circles SDK users to invite others via referral links.
- Store: Save a referral private key with on-chain validation
- Retrieve: Get referral info by private key (public)
- List: Get all referrals created by authenticated user

## Constructors

### Constructor

```ts
new Referrals(baseUrl, getToken?): Referrals;
```

Defined in: [packages/referrals/src/referrals.ts:18](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/referrals.ts#L18)

Create a new Referrals client

#### Parameters

##### baseUrl

`string`

The referrals service base URL (e.g., "https://referrals.circles.example")

##### getToken?

() => `Promise`\<`string`\>

Optional function to get auth token for authenticated endpoints

#### Returns

`Referrals`

## Methods

### store()

```ts
store(privateKey, inviter): Promise<void>;
```

Defined in: [packages/referrals/src/referrals.ts:52](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/referrals.ts#L52)

Store a referral private key

The private key is validated on-chain via ReferralsModule.accounts() to ensure
the account exists and has not been claimed. The inviter address is self-declared
for dashboard visibility only - the on-chain indexer captures the true inviter.

#### Parameters

##### privateKey

`string`

The referral private key (0x-prefixed, 64 hex chars)

##### inviter

`string`

Self-declared inviter address for dashboard visibility

#### Returns

`Promise`\<`void`\>

#### Throws

Error if validation fails or key already exists

***

### retrieve()

```ts
retrieve(privateKey): Promise<ReferralInfo>;
```

Defined in: [packages/referrals/src/referrals.ts:75](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/referrals.ts#L75)

Retrieve referral info by private key

This is a public endpoint - no authentication required.
Used by invitees to look up who invited them.

#### Parameters

##### privateKey

`string`

The referral private key

#### Returns

`Promise`\<[`ReferralInfo`](../interfaces/ReferralInfo.md)\>

Referral info including inviter and status

#### Throws

Error if referral not found or expired

***

### listMine()

```ts
listMine(): Promise<ReferralList>;
```

Defined in: [packages/referrals/src/referrals.ts:96](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/referrals.ts#L96)

List all referrals created by the authenticated user

Requires authentication - the user's address is extracted from the JWT token.

#### Returns

`Promise`\<[`ReferralList`](../interfaces/ReferralList.md)\>

List of referrals with their status and metadata

#### Throws

Error if not authenticated or request fails
