[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [pathfinder/src](../README.md) / replaceWrappedTokensWithAvatars

# Function: replaceWrappedTokensWithAvatars()

```ts
function replaceWrappedTokensWithAvatars(path, tokenInfoMap): PathfindingResult;
```

Defined in: [packages/pathfinder/src/path.ts:82](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/pathfinder/src/path.ts#L82)

Replace wrapped token addresses with avatar addresses in the path
This is used after unwrapping to reflect the actual tokens being transferred

## Parameters

### path

`PathfindingResult`

### tokenInfoMap

`Map`\<`string`, `TokenInfo`\>

## Returns

`PathfindingResult`
