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

Defined in: [packages/utils/src/errors.ts:10](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L10)

Base error source type
Each package exports its own specific ErrorSource
