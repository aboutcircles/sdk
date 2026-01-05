# @aboutcircles/sdk

Simplified Circles SDK for non-crypto users with a low entrance barrier. This package provides user-friendly abstractions over the Circles protocol, making it easier for developers to build applications without deep blockchain knowledge.

## Overview

The SDK package provides two main models:

1. **Sdk** - Main entry point for interacting with Circles
2. **Avatar** - Represents a Circles identity (human, organization, or group)

## Installation

```bash
npm install @aboutcircles/sdk
# or
bun add @aboutcircles/sdk
```

## Usage

### Basic Setup

```typescript
import { Sdk } from '@aboutcircles/sdk';

// Create SDK instance with default configuration (Gnosis Chain)
const sdk = new Sdk();

// Or with custom configuration
import { circlesConfig } from '@aboutcircles/sdk-core';
const sdk = new Sdk(circlesConfig[100], 'https://custom-rpc.com');
```

### Working with Avatars

```typescript
// Get an avatar
const avatar = await sdk.getAvatar('0xAvatarAddress');

// Access avatar properties
console.log(avatar.address);
console.log(avatar.avatarInfo);
```

### Registration (Not Yet Implemented)

```typescript
// Register as a human
const avatar = await sdk.register.asHuman('0xInviterAddress', {
  name: 'Alice',
  description: 'Developer'
});

// Register as an organization
const avatar = await sdk.register.asOrganization({
  name: 'My Organization',
  description: 'A great organization'
});

// Register as a group
const avatar = await sdk.register.asGroup('0xMintPolicyAddress', {
  name: 'My Group',
  symbol: 'MGP',
  description: 'A collaborative group'
});
```

### Avatar Methods

The Avatar class provides methods for common Circles operations:

#### Balance Methods

```typescript
// Get total balance
const total = await avatar.balances.getTotal();

// Get detailed token balances
const balances = await avatar.balances.getDetailed();

// Get gas token balance
const gasBalance = await avatar.balances.getGasToken();
```

#### Transfer Methods

```typescript
// Simple direct transfer
await avatar.transfer.direct('0xRecipient', 100);

// Advanced transfer with options
await avatar.transfer.advanced('0xRecipient', 100, {
  token: '0xTokenAddress',
  useWrappedBalances: true
});

// Get maximum transferable amount
const maxAmount = await avatar.transfer.getMaxAmount('0xRecipient');
```

#### Trust Methods

```typescript
// Add trust
await avatar.trust.add('0xTrustee');

// Remove trust
await avatar.trust.remove('0xTrustee');

// Check trust status
const isTrusting = await avatar.trust.isTrusting('0xOtherAvatar');
const isTrustedBy = await avatar.trust.isTrustedBy('0xOtherAvatar');

// Get all trust relations
const trustRelations = await avatar.trust.getAll();
```

#### Personal Token Methods

```typescript
// Get available minting amount
const available = await avatar.personalToken.getAvailableAmount();

// Mint personal tokens
await avatar.personalToken.mint();

// Stop minting (irreversible)
await avatar.personalToken.stop();
```

#### Profile Methods

```typescript
// Get profile
const profile = await avatar.profile.get();

// Update profile
const cid = await avatar.profile.update({
  name: 'Alice',
  description: 'Updated description'
});

// Update metadata (CID only)
await avatar.profile.updateMetadata('QmNewCID');

// Register short name
await avatar.profile.registerShortName(123);
```

#### Group Methods

```typescript
// Mint group tokens
await avatar.groupToken.mint(
  '0xGroupAddress',
  ['0xCollateral1', '0xCollateral2'],
  [BigInt(100), BigInt(200)],
  new Uint8Array()
);

// Redeem collateral
await avatar.groupToken.redeem(
  '0xGroupAddress',
  ['0xCollateral1'],
  [BigInt(100)]
);

// Get group properties
const owner = await avatar.group.properties.owner();
const mintHandler = await avatar.group.properties.mintHandler();

// Set group properties
await avatar.group.setProperties.owner('0xNewOwner');
```

#### Wrapping Methods

```typescript
// Wrap as demurraged ERC20
const tokenAddress = await avatar.wrap.asDemurraged('0xAvatarAddress', BigInt(100));

// Wrap as inflationary ERC20
const tokenAddress = await avatar.wrap.asInflationary('0xAvatarAddress', BigInt(100));

// Unwrap tokens
await avatar.wrap.unwrapDemurraged('0xTokenAddress', BigInt(100));
await avatar.wrap.unwrapInflationary('0xAvatarAddress', BigInt(100));
```

### Profile Management

```typescript
// Get profile by CID
const profile = await sdk.profiles.get('QmProfileCID');

// Create or update profile
await sdk.profiles.createOrUpdate({
  name: 'Alice',
  description: 'Developer'
});
```

## Implementation Status

✅ **Status**: This SDK is feature-complete and production-ready. All core functionality has been implemented.

### Implemented Features

- ✅ SDK initialization with configuration
- ✅ Avatar retrieval and type detection (getAvatar)
- ✅ Registration methods (asHuman, asOrganization, asGroup)
- ✅ Balance operations (total, detailed token balances)
- ✅ Transfer operations (direct transfers, pathfinding with advanced options)
- ✅ Trust operations (add, remove, check trust status)
- ✅ Personal token minting and management
- ✅ Profile management (get, update, metadata, short names)
- ✅ Group operations (members, holders, collateral, treasury)
- ✅ Token wrapping (demurraged and inflationary ERC20)
- ✅ Event subscriptions and streaming
- ✅ Transaction history
- ✅ Profile creation and management via IPFS

## Architecture

The SDK package wraps and simplifies the following packages:

- `@aboutcircles/sdk-core` - Core contract interactions
- `@aboutcircles/sdk-rpc` - RPC client for Circles-specific methods
- `@aboutcircles/sdk-profiles` - Profile management
- `@aboutcircles/sdk-types` - TypeScript type definitions
- `@aboutcircles/sdk-utils` - Utility functions

## Contributing

To extend or improve the SDK:

1. Update existing methods or add new features as needed
2. Leverage the underlying packages (core, rpc, profiles, transfers, etc.)
3. Add tests and update documentation
4. Ensure all changes maintain backward compatibility
5. Follow the established patterns and code style in the SDK

## License

MIT
