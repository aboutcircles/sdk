[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / GroupMethods

# Class: GroupMethods

Defined in: [packages/rpc/src/methods/group.ts:10](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/group.ts#L10)

Group query RPC methods

## Constructors

### Constructor

```ts
new GroupMethods(client): GroupMethods;
```

Defined in: [packages/rpc/src/methods/group.ts:11](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/group.ts#L11)

#### Parameters

##### client

[`RpcClient`](RpcClient.md)

#### Returns

`GroupMethods`

## Methods

### findGroups()

```ts
findGroups(limit, params?): Promise<GroupRow[]>;
```

Defined in: [packages/rpc/src/methods/group.ts:44](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/group.ts#L44)

Find groups with optional filters

This is a convenience method that fetches all pages using cursor-based pagination
and returns the combined results up to the specified limit.

#### Parameters

##### limit

`number` = `50`

Maximum number of groups to return (default: 50)

##### params?

`GroupQueryParams`

Optional query parameters to filter groups

#### Returns

`Promise`\<`GroupRow`[]\>

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
sortOrder): PagedQuery<GroupMembershipRow>;
```

Defined in: [packages/rpc/src/methods/group.ts:89](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/group.ts#L89)

Get group memberships for an avatar using cursor-based pagination

#### Parameters

##### avatar

`` `0x${string}` ``

Avatar address to query group memberships for

##### limit

`number` = `50`

Number of memberships per page (default: 50)

##### sortOrder

Sort order for results (default: 'DESC')

`"ASC"` | `"DESC"`

#### Returns

[`PagedQuery`](PagedQuery.md)\<`GroupMembershipRow`\>

PagedQuery instance for iterating through memberships

#### Example

```typescript
const query = rpc.group.getGroupMemberships(
  '0xde374ece6fa50e781e81aac78e811b33d16912c7',
  50
);
await query.queryNextPage();
console.log(query.currentPage.results);
```

***

### getGroupHolders()

```ts
getGroupHolders(groupAddress, limit): PagedQuery<GroupTokenHolderRow>;
```

Defined in: [packages/rpc/src/methods/group.ts:154](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/group.ts#L154)

Get holders of a group token using cursor-based pagination

Returns a PagedQuery instance that can be used to fetch holders page by page.
Results are ordered by totalBalance DESC (highest first), with holder address as tie-breaker.

Note: Pagination uses holder address as cursor because totalBalance (BigInt) values
cannot be reliably passed through JSON-RPC filters. This means pagination boundaries
are based on holder addresses, not balances.

#### Parameters

##### groupAddress

`` `0x${string}` ``

The address of the group token

##### limit

`number` = `100`

Number of holders per page (default: 100)

#### Returns

[`PagedQuery`](PagedQuery.md)\<[`GroupTokenHolderRow`](../interfaces/GroupTokenHolderRow.md)\>

PagedQuery instance for iterating through group token holders

#### Example

```typescript
const query = rpc.group.getGroupHolders('0xGroupAddress...', 50);

// Get first page (ordered by totalBalance DESC)
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
getGroupMembers(
   groupAddress, 
   limit, 
sortOrder): PagedQuery<GroupMembershipRow>;
```

Defined in: [packages/rpc/src/methods/group.ts:222](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/group.ts#L222)

Get members of a group using cursor-based pagination

Returns a PagedQuery instance that can be used to fetch members page by page
using cursor-based pagination.

#### Parameters

##### groupAddress

`` `0x${string}` ``

The address of the group to query members for

##### limit

`number` = `100`

Number of members per page (default: 100)

##### sortOrder

Sort order for results (default: 'DESC')

`"ASC"` | `"DESC"`

#### Returns

[`PagedQuery`](PagedQuery.md)\<`GroupMembershipRow`\>

PagedQuery instance for iterating through group members

#### Example

```typescript
const query = rpc.group.getGroupMembers('0xGroupAddress...', 100);

// Get first page
await query.queryNextPage();
console.log(query.currentPage.results);

// Get next page if available
if (query.currentPage.hasMore) {
  await query.queryNextPage();
  console.log(query.currentPage.results);
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

Defined in: [packages/rpc/src/methods/group.ts:284](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/methods/group.ts#L284)

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
