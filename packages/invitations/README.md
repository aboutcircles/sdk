# @aboutcircles/sdk-invitations

Invitation package for Circles protocol. Create referrals for new users or invite existing Safe wallet users.

## Installation

```bash
npm install @aboutcircles/sdk-invitations
```

## Usage

```typescript
import { Invitations, Referrals } from '@aboutcircles/sdk-invitations';
import { circlesConfig } from '@aboutcircles/sdk-utils';

const invitations = new Invitations(circlesConfig[100]);
const referrals = new Referrals('https://referrals.circles.example');
```

---

## API Reference

### Invitations

#### `constructor(config: CirclesConfig)`

Initialize the Invitations client.

---

#### `generateReferral(inviter: Address)`

Generate a new referral for a user without a Safe wallet.

```typescript
Promise<{
  transactions: TransactionRequest[];
  privateKey: `0x${string}`;
}>
```

Creates a new private key, generates a Safe wallet via ReferralsModule, and saves to referrals service.

---

#### `generateInvite(inviter: Address, invitee: Address)`

Invite a user who has a Safe wallet but isn't registered in Circles Hub.

```typescript
Promise<TransactionRequest[]>
```

---

#### `getRealInviters(inviter: Address)`

Get addresses whose tokens can pay for invitations.

```typescript
Promise<ProxyInviter[]>

interface ProxyInviter {
  address: Address;
  possibleInvites: number;
}
```

---

#### `findInvitePath(inviter: Address, proxyInviterAddress?: Address)`

Find path from inviter to invitation module.

```typescript
Promise<PathfindingResult>
```

---

#### `generateInviteData(addresses: Address[], useSafeCreation: boolean)`

Generate encoded invitation data for transactions.

```typescript
Promise<`0x${string}`>
```

- `useSafeCreation = true`: Creates Safe via ReferralsModule
- `useSafeCreation = false`: Uses existing Safe addresses

---

#### `computeAddress(signer: Address)`

Predict Safe address for a signer using CREATE2.

```typescript
Address
```

---

### Referrals

#### `constructor(baseUrl: string, getToken?: () => Promise<string>)`

Initialize the Referrals service client.

---

#### `retrieve(privateKey: string)`

Get referral information by private key (public endpoint).

```typescript
Promise<ReferralInfo>

interface ReferralInfo {
  inviter: string;
  status: "pending" | "confirmed" | "claimed" | "expired";
  accountAddress?: string;
}
```

---

#### `listMine()`

List all referrals created by authenticated user.

```typescript
Promise<ReferralList>

interface ReferralList {
  referrals: Referral[];
  count: number;
}

interface Referral {
  id: string;
  privateKey: string;
  status: "pending" | "confirmed" | "claimed" | "expired";
  accountAddress?: string;
  createdAt: string;
  confirmedAt: string | null;
  claimedAt: string | null;
}
```

Requires authentication via `getToken` function.

---

## License

MIT
