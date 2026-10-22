**Circles SDK**

***

# Circles SDK v2

A comprehensive TypeScript SDK for the Circles protocol.

## 📚 API Documentation

**[View Complete API Documentation →](_media/modules.md)**

Detailed API reference with types, classes, and interfaces for all packages.

## 🚀 Quick Start

### Installation

```bash
bun install
bun run build
```

### Basic Usage

**Core SDK - Contract Interaction**

```typescript
import { Core } from '@aboutcircles/sdk-core';

const core = new Core();

const tx = core.hubV2.groupMint(
  '0x1234567890123456789012345678901234567890',
  ['0xRecipient1', '0xRecipient2'],
  [BigInt(100), BigInt(200)],
  '0x'
);
```

**RPC SDK - Data Queries**

```typescript
import { CirclesRpc } from '@aboutcircles/sdk-rpc';

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Get balance
const balance = await rpc.circlesV2.getTotalBalance('0xYourAddress');

// Find transfer path
const path = await rpc.circlesV2.findPath({
  from: '0xSenderAddress',
  to: '0xRecipientAddress',
  targetFlow: BigInt(100)
});
```

## 📦 Packages

- **[@aboutcircles/sdk](_media/sdk)** - Main SDK package
- **[@aboutcircles/sdk-core](_media/core)** - Contract wrappers for direct blockchain interaction
- **[@aboutcircles/sdk-rpc](_media/rpc)** - RPC client for querying Circles data and pathfinding
- **[@aboutcircles/sdk-types](_media/types)** - Shared TypeScript types
- **[@aboutcircles/sdk-abis](_media/abis)** - Contract ABIs
- **[@aboutcircles/sdk-utils](_media/utils)** - Utility functions
- **[@aboutcircles/sdk-profiles](_media/profiles)** - Profile management
- **[@aboutcircles/sdk-pathfinder](_media/pathfinder)** - Transfer pathfinding algorithms
- **[@aboutcircles/sdk-transfers](_media/transfers)** - Transfer operations
- **[@aboutcircles/sdk-runner](_media/runner)** - Transaction execution

## 💡 Examples

Explore comprehensive examples in the [`examples/`](_media/examples) directory:

**Core SDK:**
- [Basic Usage ](_media/01-basic-usage.ts) - Core initialization
- [HubV2 Operations](_media/02-hubv2-examples.ts) - Contract operations
- [BaseGroup Management](_media/03-basegroup-examples.ts) - Group creation

**RPC SDK:**
- [RPC Client](_media/01-basic-rpc.ts) - Client configuration
- [Balance & Pathfinding](_media/02-circlesv2-balance-and-pathfinding.ts)
- [Trust Relations](_media/04-trust-examples.ts)
- [Avatar Info](_media/06-avatar-examples.ts)
- [Profiles](_media/07-profile-examples.ts)

[View all examples →](./examples/README.md)

**Run examples:**
```bash
bun run examples                           # All examples
bun run examples/core/01-basic-usage.ts    # Specific example
```

## 🛠️ Development

```bash
# Build
bun run build              # All packages
bun run build:core         # Core package
bun run build:rpc          # RPC package

# Development (watch mode)
bun run dev               # All packages
bun run dev:core          # Core package

# Documentation
bun run docs              # Generate API docs

# Publishing
bun run publish           # Build and publish all packages

# Clean
bun run clean             # Remove build artifacts
```

## 📄 License

MIT
