[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / nameRegistryAbi

# Variable: nameRegistryAbi

```ts
const nameRegistryAbi: readonly [{
  type: "constructor";
  inputs: readonly [{
     name: "_hub";
     type: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "DEFAULT_CIRCLES_NAME_PREFIX";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "DEFAULT_CIRCLES_SYMBOL";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "MAX_SHORT_NAME";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint72";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "avatarToMetaDataDigest";
  inputs: readonly [{
     name: "";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bytes32";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "calculateShortNameWithNonce";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
   }, {
     name: "_nonce";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "shortName_";
     type: "uint72";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "customNames";
  inputs: readonly [{
     name: "";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "customSymbols";
  inputs: readonly [{
     name: "";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "getMetadataDigest";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bytes32";
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
  name: "isValidName";
  inputs: readonly [{
     name: "_name";
     type: "string";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "isValidSymbol";
  inputs: readonly [{
     name: "_symbol";
     type: "string";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "name";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "registerCustomName";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
   }, {
     name: "_name";
     type: "string";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "registerCustomSymbol";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
   }, {
     name: "_symbol";
     type: "string";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "registerShortName";
  inputs: readonly [];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "registerShortNameWithNonce";
  inputs: readonly [{
     name: "_nonce";
     type: "uint256";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "searchShortName";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
  }];
  outputs: readonly [{
     name: "shortName_";
     type: "uint72";
   }, {
     name: "nonce_";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "setMetadataDigest";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
   }, {
     name: "_metadataDigest";
     type: "bytes32";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "shortNameToAvatar";
  inputs: readonly [{
     name: "";
     type: "uint72";
  }];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "shortNames";
  inputs: readonly [{
     name: "";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint72";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "symbol";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "updateMetadataDigest";
  inputs: readonly [{
     name: "_metadataDigest";
     type: "bytes32";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "event";
  name: "RegisterShortName";
  inputs: readonly [{
     name: "avatar";
     type: "address";
     indexed: true;
   }, {
     name: "shortName";
     type: "uint72";
     indexed: false;
   }, {
     name: "nonce";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "UpdateMetadataDigest";
  inputs: readonly [{
     name: "avatar";
     type: "address";
     indexed: true;
   }, {
     name: "metadataDigest";
     type: "bytes32";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "error";
  name: "CirclesAmountOverflow";
  inputs: readonly [{
     name: "amount";
     type: "uint256";
   }, {
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesErrorAddressUintArgs";
  inputs: readonly [{
     name: "";
     type: "address";
   }, {
     name: "";
     type: "uint256";
   }, {
     name: "";
     type: "uint8";
  }];
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
  name: "CirclesIdMustBeDerivedFromAddress";
  inputs: readonly [{
     name: "providedId";
     type: "uint256";
   }, {
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesInvalidCirclesId";
  inputs: readonly [{
     name: "id";
     type: "uint256";
   }, {
     name: "code";
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
}, {
  type: "error";
  name: "CirclesNamesAvatarAlreadyHasCustomNameOrSymbol";
  inputs: readonly [{
     name: "avatar";
     type: "address";
   }, {
     name: "nameOrSymbol";
     type: "string";
   }, {
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesNamesInvalidName";
  inputs: readonly [{
     name: "avatar";
     type: "address";
   }, {
     name: "name";
     type: "string";
   }, {
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesNamesOrganizationHasNoSymbol";
  inputs: readonly [{
     name: "organization";
     type: "address";
   }, {
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesNamesShortNameAlreadyAssigned";
  inputs: readonly [{
     name: "avatar";
     type: "address";
   }, {
     name: "shortName";
     type: "uint72";
   }, {
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesNamesShortNameWithNonceTaken";
  inputs: readonly [{
     name: "avatar";
     type: "address";
   }, {
     name: "nonce";
     type: "uint256";
   }, {
     name: "shortName";
     type: "uint72";
   }, {
     name: "takenByAvatar";
     type: "address";
  }];
}, {
  type: "error";
  name: "CirclesNamesShortNameZero";
  inputs: readonly [{
     name: "avatar";
     type: "address";
   }, {
     name: "nonce";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "CirclesProxyAlreadyInitialized";
  inputs: readonly [];
}, {
  type: "error";
  name: "CirclesReentrancyGuard";
  inputs: readonly [{
     name: "code";
     type: "uint8";
  }];
}];
```

Defined in: [packages/abis/src/nameRegistry.ts:1](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/abis/src/nameRegistry.ts#L1)
