[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / referralsModuleAbi

# Variable: referralsModuleAbi

```ts
const referralsModuleAbi: readonly [{
  type: "constructor";
  inputs: readonly [{
     name: "invitationModule";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "AFFILIATE_GROUP_REGISTRY";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "DOMAIN_SEPARATOR";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "bytes32";
     internalType: "bytes32";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "GENERIC_CALL_PROXY";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "HUB";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "INVITATION_MODULE";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "NAME_REGISTRY";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "SAFE_4337_MODULE";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "SAFE_MODULE_SETUP";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "SAFE_PROXY_FACTORY";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "contract ISafeProxyFactory";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "SAFE_SINGLETON";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "SAFE_WEB_AUTHN_SHARED_SIGNER";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "WELCOME_BONUS";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint256";
     internalType: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "accounts";
  inputs: readonly [{
     name: "signer";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [{
     name: "account";
     type: "address";
     internalType: "address";
   }, {
     name: "claimed";
     type: "bool";
     internalType: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "claimAccount";
  inputs: readonly [{
     name: "x";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "y";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "verifier";
     type: "address";
     internalType: "address";
   }, {
     name: "signature";
     type: "bytes";
     internalType: "bytes";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "claimAccount";
  inputs: readonly [{
     name: "x";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "y";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "verifier";
     type: "address";
     internalType: "address";
   }, {
     name: "signature";
     type: "bytes";
     internalType: "bytes";
   }, {
     name: "metadataDigest";
     type: "bytes32";
     internalType: "bytes32";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "claimAccount";
  inputs: readonly [{
     name: "x";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "y";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "verifier";
     type: "address";
     internalType: "address";
   }, {
     name: "signature";
     type: "bytes";
     internalType: "bytes";
   }, {
     name: "affiliateGroup";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "claimAccount";
  inputs: readonly [{
     name: "x";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "y";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "verifier";
     type: "address";
     internalType: "address";
   }, {
     name: "signature";
     type: "bytes";
     internalType: "bytes";
   }, {
     name: "metadataDigest";
     type: "bytes32";
     internalType: "bytes32";
   }, {
     name: "affiliateGroup";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "computeAddress";
  inputs: readonly [{
     name: "signer";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [{
     name: "predictedAddress";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "createAccount";
  inputs: readonly [{
     name: "signer";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [{
     name: "account";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "createAccounts";
  inputs: readonly [{
     name: "signers";
     type: "address[]";
     internalType: "address[]";
  }];
  outputs: readonly [{
     name: "_accounts";
     type: "address[]";
     internalType: "address[]";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "encodePasskeyData";
  inputs: readonly [{
     name: "x";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "y";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "verifier";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bytes";
     internalType: "bytes";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "getPasskeyHash";
  inputs: readonly [{
     name: "x";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "y";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "verifier";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bytes32";
     internalType: "bytes32";
  }];
  stateMutability: "view";
}, {
  type: "event";
  name: "AccountClaimed";
  inputs: readonly [{
     name: "account";
     type: "address";
     indexed: true;
     internalType: "address";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "AccountCreated";
  inputs: readonly [{
     name: "account";
     type: "address";
     indexed: true;
     internalType: "address";
  }];
  anonymous: false;
}, {
  type: "error";
  name: "AccountAlreadyClaimed";
  inputs: readonly [];
}, {
  type: "error";
  name: "InvalidSignature";
  inputs: readonly [];
}, {
  type: "error";
  name: "OnlyGenericCallProxy";
  inputs: readonly [];
}, {
  type: "error";
  name: "SignerAlreadyUsed";
  inputs: readonly [];
}];
```

Defined in: [packages/abis/src/referralsModule.ts:1](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/abis/src/referralsModule.ts#L1)
