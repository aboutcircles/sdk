[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / baseGroupFactoryAbi

# Variable: baseGroupFactoryAbi

```ts
const baseGroupFactoryAbi: (
  | {
  type: string;
  name: string;
  inputs: object[];
  outputs: object[];
  stateMutability: string;
  anonymous?: undefined;
}
  | {
  outputs?: undefined;
  stateMutability?: undefined;
  type: string;
  name: string;
  inputs: object[];
  anonymous: boolean;
}
  | {
  outputs?: undefined;
  stateMutability?: undefined;
  anonymous?: undefined;
  type: string;
  name: string;
  inputs: never[];
})[];
```

Defined in: [packages/abis/src/baseGroupFactory.ts:4](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/abis/src/baseGroupFactory.ts#L4)

BaseGroupFactory Contract ABI
