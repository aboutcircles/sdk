[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / CursorColumn

# Interface: CursorColumn

Defined in: [packages/rpc/src/types.ts:70](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L70)

Configuration for a cursor column in pagination

## Properties

### name

```ts
name: string;
```

Defined in: [packages/rpc/src/types.ts:71](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L71)

***

### sortOrder

```ts
sortOrder: "ASC" | "DESC";
```

Defined in: [packages/rpc/src/types.ts:72](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L72)

***

### toValue()?

```ts
optional toValue: (value) => string | number | boolean;
```

Defined in: [packages/rpc/src/types.ts:73](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/types.ts#L73)

#### Parameters

##### value

`any`

#### Returns

`string` \| `number` \| `boolean`
