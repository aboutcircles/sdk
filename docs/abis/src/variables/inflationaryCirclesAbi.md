[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / inflationaryCirclesAbi

# Variable: inflationaryCirclesAbi

```ts
const inflationaryCirclesAbi: readonly [{
  type: "constructor";
  inputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "DOMAIN_SEPARATOR";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "bytes32";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "allowance";
  inputs: readonly [{
     name: "_owner";
     type: "address";
   }, {
     name: "_spender";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "approve";
  inputs: readonly [{
     name: "_spender";
     type: "address";
   }, {
     name: "_amount";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "avatar";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "balanceOf";
  inputs: readonly [{
     name: "_account";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "circlesIdentifier";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "convertBatchDemurrageToInflationaryValues";
  inputs: readonly [{
     name: "_demurrageValues";
     type: "uint256[]";
   }, {
     name: "_dayUpdated";
     type: "uint64";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256[]";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "convertBatchInflationaryToDemurrageValues";
  inputs: readonly [{
     name: "_inflationaryValues";
     type: "uint256[]";
   }, {
     name: "_day";
     type: "uint64";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256[]";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "convertDemurrageToInflationaryValue";
  inputs: readonly [{
     name: "_demurrageValue";
     type: "uint256";
   }, {
     name: "_dayUpdated";
     type: "uint64";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "convertInflationaryToDemurrageValue";
  inputs: readonly [{
     name: "_inflationaryValue";
     type: "uint256";
   }, {
     name: "_day";
     type: "uint64";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "day";
  inputs: readonly [{
     name: "_timestamp";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "uint64";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "decimals";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint8";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "decreaseAllowance";
  inputs: readonly [{
     name: "_spender";
     type: "address";
   }, {
     name: "_subtractedValue";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "eip712Domain";
  inputs: readonly [];
  outputs: readonly [{
     name: "fields";
     type: "bytes1";
   }, {
     name: "name";
     type: "string";
   }, {
     name: "version";
     type: "string";
   }, {
     name: "chainId";
     type: "uint256";
   }, {
     name: "verifyingContract";
     type: "address";
   }, {
     name: "salt";
     type: "bytes32";
   }, {
     name: "extensions";
     type: "uint256[]";
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
  name: "increaseAllowance";
  inputs: readonly [{
     name: "_spender";
     type: "address";
   }, {
     name: "_addedValue";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "inflationDayZero";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "name";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "string";
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
  name: "nonces";
  inputs: readonly [{
     name: "_owner";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "onERC1155BatchReceived";
  inputs: readonly [{
     name: "";
     type: "address";
   }, {
     name: "";
     type: "address";
   }, {
     name: "";
     type: "uint256[]";
   }, {
     name: "";
     type: "uint256[]";
   }, {
     name: "";
     type: "bytes";
  }];
  outputs: readonly [{
     name: "";
     type: "bytes4";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "onERC1155Received";
  inputs: readonly [{
     name: "";
     type: "address";
   }, {
     name: "_from";
     type: "address";
   }, {
     name: "_id";
     type: "uint256";
   }, {
     name: "_amount";
     type: "uint256";
   }, {
     name: "";
     type: "bytes";
  }];
  outputs: readonly [{
     name: "";
     type: "bytes4";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "permit";
  inputs: readonly [{
     name: "_owner";
     type: "address";
   }, {
     name: "_spender";
     type: "address";
   }, {
     name: "_value";
     type: "uint256";
   }, {
     name: "_deadline";
     type: "uint256";
   }, {
     name: "_v";
     type: "uint8";
   }, {
     name: "_r";
     type: "bytes32";
   }, {
     name: "_s";
     type: "bytes32";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "setup";
  inputs: readonly [{
     name: "_hub";
     type: "address";
   }, {
     name: "_nameRegistry";
     type: "address";
   }, {
     name: "_avatar";
     type: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "supportsInterface";
  inputs: readonly [{
     name: "interfaceId";
     type: "bytes4";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "symbol";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "toTokenId";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "pure";
}, {
  type: "function";
  name: "totalSupply";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "transfer";
  inputs: readonly [{
     name: "_to";
     type: "address";
   }, {
     name: "_amount";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "transferFrom";
  inputs: readonly [{
     name: "_from";
     type: "address";
   }, {
     name: "_to";
     type: "address";
   }, {
     name: "_amount";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "unwrap";
  inputs: readonly [{
     name: "_amount";
     type: "uint256";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "event";
  name: "Approval";
  inputs: readonly [{
     name: "owner";
     type: "address";
     indexed: true;
   }, {
     name: "spender";
     type: "address";
     indexed: true;
   }, {
     name: "value";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "DepositInflationary";
  inputs: readonly [{
     name: "account";
     type: "address";
     indexed: true;
   }, {
     name: "amount";
     type: "uint256";
     indexed: false;
   }, {
     name: "demurragedAmount";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "EIP712DomainChanged";
  inputs: readonly [];
  anonymous: false;
}, {
  type: "event";
  name: "Transfer";
  inputs: readonly [{
     name: "from";
     type: "address";
     indexed: true;
   }, {
     name: "to";
     type: "address";
     indexed: true;
   }, {
     name: "value";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "WithdrawInflationary";
  inputs: readonly [{
     name: "account";
     type: "address";
     indexed: true;
   }, {
     name: "amount";
     type: "uint256";
     indexed: false;
   }, {
     name: "demurragedAmount";
     type: "uint256";
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
  name: "CirclesERC1155CannotReceiveBatch";
  inputs: readonly [{
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
  name: "CirclesProxyAlreadyInitialized";
  inputs: readonly [];
}, {
  type: "error";
  name: "CirclesReentrancyGuard";
  inputs: readonly [{
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "ECDSAInvalidSignature";
  inputs: readonly [];
}, {
  type: "error";
  name: "ECDSAInvalidSignatureLength";
  inputs: readonly [{
     name: "length";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "ECDSAInvalidSignatureS";
  inputs: readonly [{
     name: "s";
     type: "bytes32";
  }];
}, {
  type: "error";
  name: "ERC20InsufficientAllowance";
  inputs: readonly [{
     name: "spender";
     type: "address";
   }, {
     name: "allowance";
     type: "uint256";
   }, {
     name: "needed";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "ERC20InsufficientBalance";
  inputs: readonly [{
     name: "sender";
     type: "address";
   }, {
     name: "balance";
     type: "uint256";
   }, {
     name: "needed";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "ERC20InvalidApprover";
  inputs: readonly [{
     name: "approver";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC20InvalidReceiver";
  inputs: readonly [{
     name: "receiver";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC20InvalidSender";
  inputs: readonly [{
     name: "sender";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC20InvalidSpender";
  inputs: readonly [{
     name: "spender";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC2612ExpiredSignature";
  inputs: readonly [{
     name: "deadline";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "ERC2612InvalidSigner";
  inputs: readonly [{
     name: "signer";
     type: "address";
   }, {
     name: "owner";
     type: "address";
  }];
}, {
  type: "error";
  name: "InvalidAccountNonce";
  inputs: readonly [{
     name: "account";
     type: "address";
   }, {
     name: "currentNonce";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "InvalidShortString";
  inputs: readonly [];
}, {
  type: "error";
  name: "StringTooLong";
  inputs: readonly [{
     name: "str";
     type: "string";
  }];
}];
```

Defined in: [packages/abis/src/inflationaryCircles.ts:1](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/abis/src/inflationaryCircles.ts#L1)
