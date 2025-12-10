[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / GroupMethods

# Class: GroupMethods

Defined in: [packages/rpc/src/methods/group.ts:10](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/group.ts#L10)

Group query RPC methods

## Constructors

### Constructor

```ts
new GroupMethods(client): GroupMethods;
```

Defined in: [packages/rpc/src/methods/group.ts:11](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/group.ts#L11)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`GroupMethods`

## Methods

### findGroups()

```ts
findGroups(limit, params?, cursor?): Promise<PagedResponse<GroupRow>>;
```

Defined in: [packages/rpc/src/methods/group.ts:44](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/group.ts#L44)

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

Cursor for pagination (null for first page)

#### Returns

`Promise`\<`PagedResponse`\<`GroupRow`\>\>

Paged response with groups and pagination info

#### Example

```typescript
// Find first page of all groups
const response = await rpc.group.findGroups(50);
console.log(response.results);
if (response.hasMore) {
  // Get next page
  const nextResponse = await rpc.group.findGroups(50, undefined, response.nextCursor);
}

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
getGroupMemberships(avatar, limit, cursor?): Promise<PagedResponse<GroupMembershipRow>>;
```

Defined in: [packages/rpc/src/methods/group.ts:89](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/group.ts#L89)

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

Cursor for pagination (null for first page)

#### Returns

`Promise`\<`PagedResponse`\<`GroupMembershipRow`\>\>

Paged response with group memberships and pagination info

#### Example

```typescript
// Get first page of memberships
const response = await rpc.group.getGroupMemberships(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  50
);
console.log(response.results);

// Get next page if available
if (response.hasMore) {
  const nextResponse = await rpc.group.getGroupMemberships(
    '0xde374ece6fa50e781e81aac78e811b33d16912c7',
    50,
    response.nextCursor
  );
}
```

***

### getGroupHolders()

```ts
getGroupHolders(groupAddress, limit): PagedQuery<GroupTokenHolderRow>;
```

Defined in: [packages/rpc/src/methods/group.ts:154](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/group.ts#L154)

Get holders of a group token

Returns a PagedQuery instance that can be used to fetch holders page by page.
Results are ordered by balance descending.

#### Parameters

##### groupAddress

`` `0x${string}` ``

Group address (which is also the token address)

##### limit

`number` = `100`

Maximum number of holders per page (default: 100)

#### Returns

[`PagedQuery`](PagedQuery.md)\<[`GroupTokenHolderRow`](../interfaces/GroupTokenHolderRow.md)\>

PagedQuery instance for iterating through holders

#### Example

```typescript
const query = rpc.group.getGroupHolders('0xGroupAddress...', 50);

// Get first page (ordered by balance DESC)
await query.queryNextPage();
console.log(query.currentPage.results[0]); // Holder with highest balance

// Get next page if available
if (query.currentPage.hasMore) {
  await query.queryNextPage();
}
```

***

### getGroupMembers()

```ts
getGroupMembers(groupAddress, limit, cursor?): Promise<PagedResponse<GroupMembershipRow>>;
```

Defined in: [packages/rpc/src/methods/group.ts:222](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/group.ts#L222)

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

Cursor for pagination (null for first page)

#### Returns

`Promise`\<`PagedResponse`\<`GroupMembershipRow`\>\>

Paged response with group members and pagination info

#### Example

```typescript
// Get first page of members
const response = await rpc.group.getGroupMembers('0xGroupAddress...', 100);
console.log(`Group has ${response.results.length} members`);

// Get next page if available
if (response.hasMore) {
  const nextResponse = await rpc.group.getGroupMembers(
    '0xGroupAddress...',
    100,
    response.nextCursor
  );
}
```

***

### getGroups()

```ts
getGroups(
   limit, 
   params?, 
sortOrder?): PagedQuery<GroupRow>;
```

Defined in: [packages/rpc/src/methods/group.ts:284](https://github.com/aboutcircles/sdk-v2/blob/aed3c8bf419f1e90d91722752d3f29c8257367c2/packages/rpc/src/methods/group.ts#L284)

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
