[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [core/src](../README.md) / Core

# Class: Core

Defined in: [packages/core/src/core.ts:40](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L40)

Core SDK class for managing Circles protocol contract interactions

## Example

```typescript
// Use default Gnosis Chain config
const core = new Core();

// Use default config with custom RPC
const core = new Core(circlesConfig[100], 'https://custom-rpc.com');

// Use custom config
const customConfig = { ...circlesConfig[100], v2HubAddress: '0x...' };
const core = new Core(customConfig);

// Use HubV2 contract
const groupMintTx = core.hubV2.groupMint(
  '0xGroupAddress',
  ['0xAvatar1', '0xAvatar2'],
  [BigInt(100), BigInt(200)],
  '0x'
);

// Create a new BaseGroup
const createGroupTx = core.baseGroupFactory.createBaseGroup(
  '0xOwner',
  '0xService',
  '0xFeeCollection',
  [],
  'MyGroup',
  'MYG',
  '0x0000000000000000000000000000000000000000000000000000000000000000'
);
```

## Constructors

### Constructor

```ts
new Core(config): Core;
```

Defined in: [packages/core/src/core.ts:56](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L56)

Create a new Core SDK instance

#### Parameters

##### config

`CirclesConfig` = `...`

Circles configuration (defaults to Gnosis Chain mainnet)

#### Returns

`Core`

## Properties

### config

```ts
readonly config: CirclesConfig;
```

Defined in: [packages/core/src/core.ts:41](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L41)

***

### rpcUrl

```ts
readonly rpcUrl: string;
```

Defined in: [packages/core/src/core.ts:42](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L42)

***

### hubV2

```ts
readonly hubV2: HubV2Contract;
```

Defined in: [packages/core/src/core.ts:43](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L43)

***

### baseGroupFactory

```ts
readonly baseGroupFactory: BaseGroupFactoryContract;
```

Defined in: [packages/core/src/core.ts:44](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L44)

***

### nameRegistry

```ts
readonly nameRegistry: NameRegistryContract;
```

Defined in: [packages/core/src/core.ts:45](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L45)

***

### liftERC20

```ts
readonly liftERC20: LiftERC20Contract;
```

Defined in: [packages/core/src/core.ts:46](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L46)

***

### invitationEscrow

```ts
readonly invitationEscrow: InvitationEscrowContract;
```

Defined in: [packages/core/src/core.ts:47](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L47)

***

### invitationFarm

```ts
readonly invitationFarm: InvitationFarmContract;
```

Defined in: [packages/core/src/core.ts:48](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L48)

***

### referralsModule

```ts
readonly referralsModule: ReferralsModuleContract;
```

Defined in: [packages/core/src/core.ts:49](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/core/src/core.ts#L49)
