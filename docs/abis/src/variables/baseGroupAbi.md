[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / baseGroupAbi

# Variable: baseGroupAbi

```ts
const baseGroupAbi: [{
  type: "constructor";
  inputs: [{
     name: "_owner";
     type: "address";
   }, {
     name: "_service";
     type: "address";
   }, {
     name: "_feeCollection";
     type: "address";
   }, {
     name: "_initialConditions";
     type: "address[]";
   }, {
     name: "_name";
     type: "string";
   }, {
     name: "_symbol";
     type: "string";
   }, {
     name: "_metadataDigest";
     type: "bytes32";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "BASE_MINT_HANDLER";
  inputs: [];
  outputs: [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "BASE_MINT_POLICY";
  inputs: [];
  outputs: [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}];
```

Defined in: [packages/abis/src/baseGroup.ts:6](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/abis/src/baseGroup.ts#L6)

BaseGroup Contract ABI
