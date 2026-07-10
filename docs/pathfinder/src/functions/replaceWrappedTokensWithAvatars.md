[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [pathfinder/src](../README.md) / replaceWrappedTokensWithAvatars

# Function: replaceWrappedTokensWithAvatars()

```ts
function replaceWrappedTokensWithAvatars(path, tokenInfoMap): PathfindingResult;
```

Defined in: [packages/pathfinder/src/path.ts:82](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/pathfinder/src/path.ts#L82)

Replace wrapped token addresses with avatar addresses in the path
This is used after unwrapping to reflect the actual tokens being transferred

## Parameters

### path

`PathfindingResult`

### tokenInfoMap

`Map`\<`string`, `TokenInfo`\>

## Returns

`PathfindingResult`
