[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / invitationEscrowAbi

# Variable: invitationEscrowAbi

```ts
const invitationEscrowAbi: readonly [{
  type: "function";
  name: "redeemInvitation";
  inputs: readonly [{
     name: "inviter";
     type: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "revokeInvitation";
  inputs: readonly [{
     name: "invitee";
     type: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "revokeAllInvitations";
  inputs: readonly [];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "onERC1155Received";
  inputs: readonly [{
     name: "operator";
     type: "address";
   }, {
     name: "from";
     type: "address";
   }, {
     name: "id";
     type: "uint256";
   }, {
     name: "value";
     type: "uint256";
   }, {
     name: "data";
     type: "bytes";
  }];
  outputs: readonly [{
     name: "";
     type: "bytes4";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "getInviters";
  inputs: readonly [{
     name: "invitee";
     type: "address";
  }];
  outputs: readonly [{
     name: "inviters";
     type: "address[]";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "getInvitees";
  inputs: readonly [{
     name: "inviter";
     type: "address";
  }];
  outputs: readonly [{
     name: "invitees";
     type: "address[]";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "getEscrowedAmountAndDays";
  inputs: readonly [{
     name: "inviter";
     type: "address";
   }, {
     name: "invitee";
     type: "address";
  }];
  outputs: readonly [{
     name: "escrowedAmount";
     type: "uint256";
   }, {
     name: "days_";
     type: "uint64";
  }];
  stateMutability: "view";
}, {
  type: "event";
  name: "InvitationEscrowed";
  inputs: readonly [{
     name: "inviter";
     type: "address";
     indexed: true;
   }, {
     name: "invitee";
     type: "address";
     indexed: true;
   }, {
     name: "amount";
     type: "uint256";
     indexed: true;
  }];
}, {
  type: "event";
  name: "InvitationRedeemed";
  inputs: readonly [{
     name: "inviter";
     type: "address";
     indexed: true;
   }, {
     name: "invitee";
     type: "address";
     indexed: true;
   }, {
     name: "amount";
     type: "uint256";
     indexed: true;
  }];
}, {
  type: "event";
  name: "InvitationRefunded";
  inputs: readonly [{
     name: "inviter";
     type: "address";
     indexed: true;
   }, {
     name: "invitee";
     type: "address";
     indexed: true;
   }, {
     name: "amount";
     type: "uint256";
     indexed: true;
  }];
}, {
  type: "event";
  name: "InvitationRevoked";
  inputs: readonly [{
     name: "inviter";
     type: "address";
     indexed: true;
   }, {
     name: "invitee";
     type: "address";
     indexed: true;
   }, {
     name: "amount";
     type: "uint256";
     indexed: true;
  }];
}, {
  type: "error";
  name: "OnlyHub";
  inputs: readonly [];
}, {
  type: "error";
  name: "OnlyHumanAvatarsAreInviters";
  inputs: readonly [];
}, {
  type: "error";
  name: "OnlyInviter";
  inputs: readonly [];
}, {
  type: "error";
  name: "EscrowedCRCAmountOutOfRange";
  inputs: readonly [{
     name: "received";
     type: "uint256";
  }];
}, {
  type: "error";
  name: "InvalidEncoding";
  inputs: readonly [];
}, {
  type: "error";
  name: "InviteeAlreadyRegistered";
  inputs: readonly [];
}, {
  type: "error";
  name: "InvalidInvitee";
  inputs: readonly [];
}, {
  type: "error";
  name: "InviteAlreadyEscrowed";
  inputs: readonly [];
}, {
  type: "error";
  name: "InvalidEscrow";
  inputs: readonly [];
}, {
  type: "error";
  name: "MissingOrExpiredTrust";
  inputs: readonly [];
}];
```

Defined in: [packages/abis/src/invitationEscrow.ts:4](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/abis/src/invitationEscrow.ts#L4)

InvitationEscrow Contract ABI
