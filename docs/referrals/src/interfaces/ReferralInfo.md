[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [referrals/src](../README.md) / ReferralInfo

# Interface: ReferralInfo

Defined in: [packages/referrals/src/types.ts:9](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L9)

Referral info returned from retrieve endpoint

## Properties

### inviter

```ts
inviter: string;
```

Defined in: [packages/referrals/src/types.ts:11](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L11)

The inviter's Ethereum address

***

### status

```ts
status: ReferralStatus;
```

Defined in: [packages/referrals/src/types.ts:13](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L13)

Current status of the referral

***

### accountAddress?

```ts
optional accountAddress: string;
```

Defined in: [packages/referrals/src/types.ts:15](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/referrals/src/types.ts#L15)

The Safe account address (if available)
