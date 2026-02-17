[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / GroupMethods

# Class: GroupMethods

Defined in: [packages/rpc/src/methods/group.ts:17](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/group.ts#L17)

Group query RPC methods

## Constructors

### Constructor

```ts
new GroupMethods(client): GroupMethods;
```

Defined in: [packages/rpc/src/methods/group.ts:18](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/group.ts#L18)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`GroupMethods`

## Methods

### findGroups()

```ts
findGroups(
   limit, 
   params?, 
cursor?): Promise<PagedResponse<GroupRow>>;
```

Defined in: [packages/rpc/src/methods/group.ts:51](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/group.ts#L51)

Find groups with optional filters

Uses the native RPC method for efficient server-side filtering and pagination.
Fetches all results using cursor-based pagination up to the specified limit.

#### Parameters

##### limit

`number` = `50`

Maximum number of groups to return (default: 50)

##### params?

`GroupQueryParams`

Optional query parameters to filter groups

##### cursor?

`string` | `null`

#### Returns

`Promise`\<`PagedResponse`\<`GroupRow`\>\>

Array of group rows

#### Example

```typescript
// Find all groups
const allGroups = await rpc.group.findGroups(50);

// Find groups by name prefix
const groups = await rpc.group.findGroups(50, {
  nameStartsWith: 'Community'
});

// Find groups by owner (single)
const myGroups = await rpc.group.findGroups(50, {
  ownerIn: ['0xde374ece6fa50e781e81aac78e811b33d16912c7']
});

// Find groups by multiple owners (OR query)
const multiOwnerGroups = await rpc.group.findGroups(50, {
  ownerIn: ['0xOwner1...', '0xOwner2...']
});
```

***

### getGroupMemberships()

```ts
getGroupMemberships(
   avatar, 
   limit, 
cursor?): Promise<PagedResponse<GroupMembershipRow>>;
```

Defined in: [packages/rpc/src/methods/group.ts:103](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/group.ts#L103)

Get group memberships for an avatar

Uses the native RPC method for efficient server-side queries.
Fetches all results using cursor-based pagination up to the specified limit.

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query group memberships for

##### limit

`number` = `50`

Maximum number of memberships to return (default: 50)

##### cursor?

`string` | `null`

#### Returns

`Promise`\<`PagedResponse`\<`GroupMembershipRow`\>\>

Array of group membership rows

#### Example

```typescript
const memberships = await rpc.group.getGroupMemberships(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  50
);
console.log(memberships);
```

***

### getGroupMembers()

```ts
getGroupMembers(
   groupAddress, 
   limit, 
cursor?): Promise<PagedResponse<GroupMembershipRow>>;
```

Defined in: [packages/rpc/src/methods/group.ts:136](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/group.ts#L136)

Get members of a group

Uses the native RPC method for efficient server-side queries.
Fetches all results using cursor-based pagination up to the specified limit.

#### Parameters

##### groupAddress

`` `0x${string}` ``

Group address to query members for

##### limit

`number` = `100`

Maximum number of members to return (default: 100)

##### cursor?

`string` | `null`

#### Returns

`Promise`\<`PagedResponse`\<`GroupMembershipRow`\>\>

Array of group membership rows (members of the group)

#### Example

```typescript
const members = await rpc.group.getGroupMembers('0xGroupAddress...', 100);
console.log(`Group has ${members.length} members`);
```

***

### getGroups()

```ts
getGroups(
   limit, 
   params?, 
sortOrder?): PagedQuery<GroupRow>;
```

Defined in: [packages/rpc/src/methods/group.ts:178](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/group.ts#L178)

Get groups using cursor-based pagination

Returns a PagedQuery instance that can be used to fetch groups page by page
using cursor-based pagination.

#### Parameters

##### limit

`number` = `50`

Number of groups per page (default: 50)

##### params?

`GroupQueryParams`

Optional query parameters to filter groups

##### sortOrder?

Sort order for results (default: 'DESC')

`"ASC"` | `"DESC"`

#### Returns

[`PagedQuery`](PagedQuery.md)\<`GroupRow`\>

PagedQuery instance for iterating through groups

#### Example

```typescript
// Query all groups
const query = rpc.group.getGroups(50);

// Query groups by owner(s)
const myGroupsQuery = rpc.group.getGroups(50, {
  ownerIn: ['0xMyAddress...']
});

await myGroupsQuery.queryNextPage();
console.log(myGroupsQuery.currentPage.results);
```

***

### getGroupHolders()

```ts
getGroupHolders(groupAddress, limit): PagedQuery<GroupTokenHolderRow>;
```

Defined in: [packages/rpc/src/methods/group.ts:335](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/rpc/src/methods/group.ts#L335)

Get holders of a group token

#### Parameters

##### groupAddress

`` `0x${string}` ``

Group address (which is also the token address)

##### limit

`number` = `100`

Maximum number of holders to return (default: 100)

#### Returns

[`PagedQuery`](PagedQuery.md)\<[`GroupTokenHolderRow`](../interfaces/GroupTokenHolderRow.md)\>

PagedQuery instance for iterating through holders
