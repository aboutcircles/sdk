[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [referrals/src](../README.md) / Referral

# Interface: Referral

Defined in: [packages/referrals/src/types.ts:21](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L21)

Full referral record returned from my-referrals endpoint

## Properties

### id

```ts
id: string;
```

Defined in: [packages/referrals/src/types.ts:23](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L23)

Unique identifier

***

### privateKey

```ts
privateKey: string;
```

Defined in: [packages/referrals/src/types.ts:25](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L25)

The referral private key

***

### status

```ts
status: ReferralStatus;
```

Defined in: [packages/referrals/src/types.ts:27](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L27)

Current status

***

### accountAddress?

```ts
optional accountAddress: string;
```

Defined in: [packages/referrals/src/types.ts:29](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L29)

The Safe account address

***

### createdAt

```ts
createdAt: string;
```

Defined in: [packages/referrals/src/types.ts:31](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L31)

When the referral was created

***

### confirmedAt

```ts
confirmedAt: string | null;
```

Defined in: [packages/referrals/src/types.ts:33](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L33)

When the account was confirmed on-chain

***

### claimedAt

```ts
claimedAt: string | null;
```

Defined in: [packages/referrals/src/types.ts:35](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L35)

When the account was claimed
