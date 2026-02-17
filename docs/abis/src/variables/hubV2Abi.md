[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / hubV2Abi

# Variable: hubV2Abi

```ts
const hubV2Abi: readonly [{
  type: "constructor";
  inputs: readonly [{
     name: "_hubV1";
     type: "address";
   }, {
     name: "_nameRegistry";
     type: "address";
   }, {
     name: "_migration";
     type: "address";
   }, {
     name: "_liftERC20";
     type: "address";
   }, {
     name: "_standardTreasury";
     type: "address";
   }, {
     name: "_inflationDayZero";
     type: "uint256";
   }, {
     name: "_bootstrapTime";
     type: "uint256";
   }, {
     name: "_gatewayUrl";
     type: "string";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "advancedUsageFlags";
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
  name: "avatars";
  inputs: readonly [{
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
  name: "balanceOf";
  inputs: readonly [{
     name: "_account";
     type: "address";
   }, {
     name: "_id";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "balanceOfBatch";
  inputs: readonly [{
     name: "_accounts";
     type: "address[]";
   }, {
     name: "_ids";
     type: "uint256[]";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256[]";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "balanceOfOnDay";
  inputs: readonly [{
     name: "_account";
     type: "address";
   }, {
     name: "_id";
     type: "uint256";
   }, {
     name: "_day";
     type: "uint64";
  }];
  outputs: readonly [{
     name: "balanceOnDay_";
     type: "uint256";
   }, {
     name: "discountCost_";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "burn";
  inputs: readonly [{
     name: "_id";
     type: "uint256";
   }, {
     name: "_amount";
     type: "uint256";
   }, {
     name: "_data";
     type: "bytes";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "calculateIssuance";
  inputs: readonly [{
     name: "_human";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
   }, {
     name: "";
     type: "uint256";
   }, {
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "calculateIssuanceWithCheck";
  inputs: readonly [{
     name: "_human";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
   }, {
     name: "";
     type: "uint256";
   }, {
     name: "";
     type: "uint256";
  }];
  stateMutability: "nonpayable";
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
  name: "groupMint";
  inputs: readonly [{
     name: "_group";
     type: "address";
   }, {
     name: "_collateralAvatars";
     type: "address[]";
   }, {
     name: "_amounts";
     type: "uint256[]";
   }, {
     name: "_data";
     type: "bytes";
  }];
  outputs: readonly [];
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
  name: "invitationOnlyTime";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "isApprovedForAll";
  inputs: readonly [{
     name: "_account";
     type: "address";
   }, {
     name: "_operator";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "isGroup";
  inputs: readonly [{
     name: "_group";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "isHuman";
  inputs: readonly [{
     name: "_human";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "isOrganization";
  inputs: readonly [{
     name: "_organization";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "isPermittedFlow";
  inputs: readonly [{
     name: "_from";
     type: "address";
   }, {
     name: "_to";
     type: "address";
   }, {
     name: "_circlesAvatar";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "isTrusted";
  inputs: readonly [{
     name: "_truster";
     type: "address";
   }, {
     name: "_trustee";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "migrate";
  inputs: readonly [{
     name: "_owner";
     type: "address";
   }, {
     name: "_avatars";
     type: "address[]";
   }, {
     name: "_amounts";
     type: "uint256[]";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "mintPolicies";
  inputs: readonly [{
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
  name: "operateFlowMatrix";
  inputs: readonly [{
     name: "_flowVertices";
     type: "address[]";
   }, {
     name: "_flow";
     type: "tuple[]";
     components: readonly [{
        name: "streamSinkId";
        type: "uint16";
      }, {
        name: "amount";
        type: "uint192";
     }];
   }, {
     name: "_streams";
     type: "tuple[]";
     components: readonly [{
        name: "sourceCoordinate";
        type: "uint16";
      }, {
        name: "flowEdgeIds";
        type: "uint16[]";
      }, {
        name: "data";
        type: "bytes";
     }];
   }, {
     name: "_packedCoordinates";
     type: "bytes";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "personalMint";
  inputs: readonly [];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "registerCustomGroup";
  inputs: readonly [{
     name: "_mint";
     type: "address";
   }, {
     name: "_treasury";
     type: "address";
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
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "registerGroup";
  inputs: readonly [{
     name: "_mint";
     type: "address";
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
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "registerHuman";
  inputs: readonly [{
     name: "_inviter";
     type: "address";
   }, {
     name: "_metadataDigest";
     type: "bytes32";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "registerOrganization";
  inputs: readonly [{
     name: "_name";
     type: "string";
   }, {
     name: "_metadataDigest";
     type: "bytes32";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "safeBatchTransferFrom";
  inputs: readonly [{
     name: "_from";
     type: "address";
   }, {
     name: "_to";
     type: "address";
   }, {
     name: "_ids";
     type: "uint256[]";
   }, {
     name: "_values";
     type: "uint256[]";
   }, {
     name: "_data";
     type: "bytes";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "safeTransferFrom";
  inputs: readonly [{
     name: "_from";
     type: "address";
   }, {
     name: "_to";
     type: "address";
   }, {
     name: "_id";
     type: "uint256";
   }, {
     name: "_value";
     type: "uint256";
   }, {
     name: "_data";
     type: "bytes";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "setAdvancedUsageFlag";
  inputs: readonly [{
     name: "_flag";
     type: "bytes32";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "setApprovalForAll";
  inputs: readonly [{
     name: "_operator";
     type: "address";
   }, {
     name: "_approved";
     type: "bool";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "stop";
  inputs: readonly [];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "stopped";
  inputs: readonly [{
     name: "_human";
     type: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "supportsInterface";
  inputs: readonly [{
     name: "_interfaceId";
     type: "bytes4";
  }];
  outputs: readonly [{
     name: "";
     type: "bool";
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
  inputs: readonly [{
     name: "_id";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "treasuries";
  inputs: readonly [{
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
  name: "trust";
  inputs: readonly [{
     name: "_trustReceiver";
     type: "address";
   }, {
     name: "_expiry";
     type: "uint96";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "trustMarkers";
  inputs: readonly [{
     name: "";
     type: "address";
   }, {
     name: "";
     type: "address";
  }];
  outputs: readonly [{
     name: "previous";
     type: "address";
   }, {
     name: "expiry";
     type: "uint96";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "uri";
  inputs: readonly [{
     name: "";
     type: "uint256";
  }];
  outputs: readonly [{
     name: "";
     type: "string";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "wrap";
  inputs: readonly [{
     name: "_avatar";
     type: "address";
   }, {
     name: "_amount";
     type: "uint256";
   }, {
     name: "_type";
     type: "uint8";
  }];
  outputs: readonly [{
     name: "";
     type: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "event";
  name: "ApprovalForAll";
  inputs: readonly [{
     name: "account";
     type: "address";
     indexed: true;
   }, {
     name: "operator";
     type: "address";
     indexed: true;
   }, {
     name: "approved";
     type: "bool";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "DiscountCost";
  inputs: readonly [{
     name: "account";
     type: "address";
     indexed: true;
   }, {
     name: "id";
     type: "uint256";
     indexed: true;
   }, {
     name: "discountCost";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "FlowEdgesScopeLastEnded";
  inputs: readonly [];
  anonymous: false;
}, {
  type: "event";
  name: "FlowEdgesScopeSingleStarted";
  inputs: readonly [{
     name: "flowEdgeId";
     type: "uint256";
     indexed: true;
   }, {
     name: "streamId";
     type: "uint16";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "GroupMint";
  inputs: readonly [{
     name: "sender";
     type: "address";
     indexed: true;
   }, {
     name: "receiver";
     type: "address";
     indexed: true;
   }, {
     name: "group";
     type: "address";
     indexed: true;
   }, {
     name: "collateral";
     type: "uint256[]";
     indexed: false;
   }, {
     name: "amounts";
     type: "uint256[]";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "PersonalMint";
  inputs: readonly [{
     name: "human";
     type: "address";
     indexed: true;
   }, {
     name: "amount";
     type: "uint256";
     indexed: false;
   }, {
     name: "startPeriod";
     type: "uint256";
     indexed: false;
   }, {
     name: "endPeriod";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "RegisterGroup";
  inputs: readonly [{
     name: "group";
     type: "address";
     indexed: true;
   }, {
     name: "mint";
     type: "address";
     indexed: true;
   }, {
     name: "treasury";
     type: "address";
     indexed: true;
   }, {
     name: "name";
     type: "string";
     indexed: false;
   }, {
     name: "symbol";
     type: "string";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "RegisterHuman";
  inputs: readonly [{
     name: "avatar";
     type: "address";
     indexed: true;
   }, {
     name: "inviter";
     type: "address";
     indexed: true;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "RegisterOrganization";
  inputs: readonly [{
     name: "organization";
     type: "address";
     indexed: true;
   }, {
     name: "name";
     type: "string";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "SetAdvancedUsageFlag";
  inputs: readonly [{
     name: "avatar";
     type: "address";
     indexed: true;
   }, {
     name: "flag";
     type: "bytes32";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "Stopped";
  inputs: readonly [{
     name: "avatar";
     type: "address";
     indexed: true;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "StreamCompleted";
  inputs: readonly [{
     name: "operator";
     type: "address";
     indexed: true;
   }, {
     name: "from";
     type: "address";
     indexed: true;
   }, {
     name: "to";
     type: "address";
     indexed: true;
   }, {
     name: "ids";
     type: "uint256[]";
     indexed: false;
   }, {
     name: "amounts";
     type: "uint256[]";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "TransferBatch";
  inputs: readonly [{
     name: "operator";
     type: "address";
     indexed: true;
   }, {
     name: "from";
     type: "address";
     indexed: true;
   }, {
     name: "to";
     type: "address";
     indexed: true;
   }, {
     name: "ids";
     type: "uint256[]";
     indexed: false;
   }, {
     name: "values";
     type: "uint256[]";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "TransferSingle";
  inputs: readonly [{
     name: "operator";
     type: "address";
     indexed: true;
   }, {
     name: "from";
     type: "address";
     indexed: true;
   }, {
     name: "to";
     type: "address";
     indexed: true;
   }, {
     name: "id";
     type: "uint256";
     indexed: false;
   }, {
     name: "value";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "Trust";
  inputs: readonly [{
     name: "truster";
     type: "address";
     indexed: true;
   }, {
     name: "trustee";
     type: "address";
     indexed: true;
   }, {
     name: "expiryTime";
     type: "uint256";
     indexed: false;
  }];
  anonymous: false;
}, {
  type: "event";
  name: "URI";
  inputs: readonly [{
     name: "value";
     type: "string";
     indexed: false;
   }, {
     name: "id";
     type: "uint256";
     indexed: true;
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
  name: "CirclesHubFlowEdgeStreamMismatch";
  inputs: readonly [{
     name: "flowEdgeId";
     type: "uint256";
   }, {
     name: "streamId";
     type: "uint256";
   }, {
     name: "code";
     type: "uint8";
  }];
}, {
  type: "error";
  name: "CirclesHubNettedFlowMismatch";
  inputs: readonly [{
     name: "vertexPosition";
     type: "uint256";
   }, {
     name: "matrixNettedFlow";
     type: "int256";
   }, {
     name: "streamNettedFlow";
     type: "int256";
  }];
}, {
  type: "error";
  name: "CirclesHubStreamMismatch";
  inputs: readonly [{
     name: "streamId";
     type: "uint256";
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
  name: "ERC1155InsufficientBalance";
  inputs: readonly [{
     name: "sender";
     type: "address";
   }, {
     name: "balance";
     type: "uint256";
   }, {
     name: "needed";
     type: "uint256";
   }, {
     name: "tokenId";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "ERC1155InvalidApprover";
  inputs: readonly [{
     name: "approver";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC1155InvalidArrayLength";
  inputs: readonly [{
     name: "idsLength";
     type: "uint256";
   }, {
     name: "valuesLength";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "ERC1155InvalidOperator";
  inputs: readonly [{
     name: "operator";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC1155InvalidReceiver";
  inputs: readonly [{
     name: "receiver";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC1155InvalidSender";
  inputs: readonly [{
     name: "sender";
     type: "address";
  }];
}, {
  type: "error";
  name: "ERC1155MissingApprovalForAll";
  inputs: readonly [{
     name: "operator";
     type: "address";
   }, {
     name: "owner";
     type: "address";
  }];
}];
```

Defined in: [packages/abis/src/hubV2.ts:4](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/abis/src/hubV2.ts#L4)

HubV2 Contract ABI
