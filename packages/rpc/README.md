# @aboutcircles/sdk-rpc

TypeScript wrapper for Circles RPC methods.

## Installation

```bash
bun install
```

## Usage

```typescript
import { CirclesRpc } from '@aboutcircles/sdk-rpc';

// Create RPC instance with default endpoint (https://rpc.circlesubi.network/)
const rpc = new CirclesRpc();

// Or use custom RPC endpoint
const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Note: All addresses are automatically normalized to lowercase
// since the Circles indexer stores addresses in lowercase

// Note: All numeric values (balances, amounts, timestamps) are returned as bigint
const balance = await rpc.circlesV2.getTotalBalance('0xcadd4ea3bcc361fc4af2387937d7417be8d7dfc2');
console.log(balance); // 1000000000000000000n

// Find a path between two addresses
const path = await rpc.circlesV2.findPath({
  from: '0x749c930256b47049cb65adcd7c25e72d5de44b3b',
  to: '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  targetFlow: 99999999999999999999999999999999999n
});

// Query trust relations
const trustRelations = await rpc.query.query({
  Namespace: 'V_CrcV2',
  Table: 'TrustRelations',
  Columns: [],
  Filter: [{
    Type: 'Conjunction',
    ConjunctionType: 'Or',
    Predicates: [
      {
        Type: 'FilterPredicate',
        FilterType: 'Equals',
        Column: 'truster',
        Value: '0xae3a29a9ff24d0e936a5579bae5c4179c4dff565'
      },
      {
        Type: 'FilterPredicate',
        FilterType: 'Equals',
        Column: 'trustee',
        Value: '0xae3a29a9ff24d0e936a5579bae5c4179c4dff565'
      }
    ]
  }],
  Order: []
});

// Get common trust
const commonTrust = await rpc.trust.getCommonTrust(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  '0xe8fc7a2d0573e5164597b05f14fa9a7fca7b215c'
);

// Get token balances
const balances = await rpc.balance.getTokenBalances('0x7cadf434b692ca029d950607a4b3f139c30d4e98');
// Each balance includes:
// - attoCircles, staticAttoCircles, attoCrc (as bigint)
// - circles, staticCircles, crc (as number)
// - token type flags (isErc20, isErc1155, isWrapped, etc.)

// Get avatar info
const avatarInfo = await rpc.avatar.getAvatarInfo('0xde374ece6fa50e781e81aac78e811b33d16912c7');

// Get network snapshot
const snapshot = await rpc.avatar.getNetworkSnapshot();

// Get profile by address
const profile = await rpc.profile.getProfileByAddress('0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7');

// Get profiles by address batch
const profiles = await rpc.profile.getProfileByAddressBatch([
  '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7',
  '0xf712d3b31de494b5c0ea51a6a407460ca66b12e8'
]);

// Search profiles
const results = await rpc.profile.searchProfiles('alice', 10, 0);

// Get available tables
const tables = await rpc.query.tables();

// Query events
const events = await rpc.query.events(
  38000000,
  null,
  ['CrcV1_Trust'],
  null,
  false
);
```

## API

**Note:** All balance and amount values are returned as `bigint` for safe handling of large numbers.

### CirclesV2 Methods

- `getTotalBalanceV1(address, asTimeCircles?): Promise<bigint>` - Get total v1 Circles balance
- `getTotalBalance(address, asTimeCircles?): Promise<bigint>` - Get total v2 Circles balance
- `findPath(params): Promise<PathResponse>` - Calculate transfer path between addresses
  - **params**: `{ from, to, targetFlow, useWrappedBalances?, fromTokens?, toTokens?, excludeFromTokens?, excludeToTokens?, simulatedBalances? }`
  - All amounts are `bigint`, addresses normalized to lowercase
  - Returns path with `flow` and `transfers` (all amounts as `bigint`)
- `findScoreGroupRedeemPath(params): Promise<PathfindingResult>` - Compute how much of a score group's gCRC a holder can redeem back into the backing collateral (self-redeem: source == sink == holder)
  - **params**: `{ group, holder, amount? }` — `amount` is an optional `bigint` cap (CRC wei); omit to redeem up to the holder's full gCRC balance
  - Same `MaxFlowResponse` shape as `findPath` (`{ maxFlow, transfers }`, amounts as `bigint`): one collateral leg (treasury → holder) per allocated collateral, clamped per collateral by `MIN(holder entitlement, treasury holding)`
  - **Note**: a forward-looking pre-flight — no on-chain redeem path is deployed yet, so the per-collateral selection order is a server-side placeholder; amounts/clamping are final

### Query Methods

- `query(params)` - Query tables with filters
- `tables()` - Get available namespaces and tables
- `events(fromBlock, toBlock, eventTypes, address, includeTransactionData)` - Query events

### Trust Methods

- `getCommonTrust(address1, address2)` - Get common trust relations

### Balance Methods

- `getTokenBalances(address): Promise<TokenBalance[]>` - Get token balance breakdown
  - Returns balances with raw amounts as `bigint` (attoCircles, staticAttoCircles, attoCrc)
  - And converted amounts as `number` (circles, staticCircles, crc)
  - Includes token type flags (isErc20, isErc1155, isWrapped, isInflationary, isGroup)

### Avatar Methods

- `getAvatarInfo(address): Promise<AvatarInfo | undefined>` - Get avatar information
- `getAvatarInfoBatch(addresses[]): Promise<AvatarInfo[]>` - Get multiple avatar infos in batch
- `getNetworkSnapshot(): Promise<NetworkSnapshot>` - Get full network snapshot

### Profile Methods

- `getProfileByCid(cid): Promise<Profile | null>` - Get profile by CID
- `getProfileByCidBatch(cids[]): Promise<(Profile | null)[]>` - Get multiple profiles by CID
- `getProfileByAddress(address): Promise<Profile | null>` - Get profile by address
- `getProfileByAddressBatch(addresses[]): Promise<(Profile | null)[]>` - Get multiple profiles by address
- `searchProfiles(query, limit?, offset?): Promise<Profile[]>` - Search profiles

### Token Methods

- `getTokenInfo(address): Promise<TokenInfo | undefined>` - Get token information
- `getTokenInfoBatch(addresses[]): Promise<TokenInfo[]>` - Get multiple token infos in batch

### Invitation Methods

- `getInvitedBy(address): Promise<Address | undefined>` - Get the avatar that invited a specific address

## Build

```bash
bun run build
```

## Development

```bash
bun run dev
```
