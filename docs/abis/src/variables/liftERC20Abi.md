[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / liftERC20Abi

# Variable: liftERC20Abi

```ts
const liftERC20Abi: readonly [{
  type: "constructor";
  inputs: readonly [{
     name: "_hub";
     type: "address";
   }, {
     name: "_nameRegistry";
     type: "address";
   }, {
     name: "_masterCopyERC20Demurrage";
     type: "address";
   }, {
     name: "_masterCopyERC20Inflation";
     type: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "ERC20_WRAPPER_SETUP_CALLPREFIX";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "bytes4";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "hub";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "nameRegistry";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "masterCopyERC20Wrapper";
  inputs: readonly [{
     name: "";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "erc20Circles";
  inputs: readonly [{
     name: "";
     type: "uint8";
   }, {
     name: "";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "ensureERC20";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
   }, {
     name: "_circlesType";
     type: "uint8";
  }];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "event";
  name: "ERC20WrapperDeployed";
  inputs: readonly [{
     name: "avatar";
     type: "address";
     indexed: true;
   }, {
     name: "erc20Wrapper";
     type: "address";
     indexed: true;
   }, {
     name: "circlesType";
     type: "uint8";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "error";
  name: "CirclesErrorNoArgs";
  inputs: readonly [{
     name: "";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesErrorOneAddressArg";
  inputs: readonly [{
     name: "";
     type: "address";
   }, {
     name: "";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesInvalidParameter";
  inputs: readonly [{
     name: "parameter";
     type: "uint256";
   }, {
     name: "code";
     type: "uint8";
  }];
}];
```

Defined in: [packages/abis/src/liftERC20.ts:1](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/abis/src/liftERC20.ts#L1)
