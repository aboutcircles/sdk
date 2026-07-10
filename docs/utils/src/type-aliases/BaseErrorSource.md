[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / BaseErrorSource

# Type Alias: BaseErrorSource

```ts
type BaseErrorSource = 
  | "UTILS"
  | "RPC"
  | "SDK"
  | "CORE"
  | "RUNNER"
  | "PROFILES"
  | "TRANSFERS"
  | "EVENTS"
  | "PATHFINDER"
  | "UNKNOWN";
```

Defined in: [packages/utils/src/errors.ts:10](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/utils/src/errors.ts#L10)

Base error source type
Each package exports its own specific ErrorSource
