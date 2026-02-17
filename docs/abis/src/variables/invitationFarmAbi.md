[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [abis/src](../README.md) / invitationFarmAbi

# Variable: invitationFarmAbi

```ts
const invitationFarmAbi: readonly [{
  type: "constructor";
  inputs: readonly [{
     name: "_invitationModule";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "INVITATION_FEE";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint256";
     internalType: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "HUB";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "contract IHub";
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
  name: "admin";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "bots";
  inputs: readonly [{
     name: "bot";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [{
     name: "nextBot";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "claimInvite";
  inputs: readonly [];
  outputs: readonly [{
     name: "id";
     type: "uint256";
     internalType: "uint256";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "claimInvites";
  inputs: readonly [{
     name: "numberOfInvites";
     type: "uint256";
     internalType: "uint256";
  }];
  outputs: readonly [{
     name: "ids";
     type: "uint256[]";
     internalType: "uint256[]";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "createBot";
  inputs: readonly [];
  outputs: readonly [{
     name: "createdBot";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "createBots";
  inputs: readonly [{
     name: "numberOfBots";
     type: "uint256";
     internalType: "uint256";
  }];
  outputs: readonly [{
     name: "createdBots";
     type: "address[]";
     internalType: "address[]";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "growFarm";
  inputs: readonly [{
     name: "numberOfBots";
     type: "uint256";
     internalType: "uint256";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "invitationModule";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "inviterQuota";
  inputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [{
     name: "";
     type: "uint256";
     internalType: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "lastUsedBot";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "maintainBots";
  inputs: readonly [{
     name: "iterations";
     type: "uint256";
     internalType: "uint256";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "maintainer";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "seeder";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "setAdmin";
  inputs: readonly [{
     name: "newAdmin";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "setInviterQuota";
  inputs: readonly [{
     name: "inviter";
     type: "address";
     internalType: "address";
   }, {
     name: "quota";
     type: "uint256";
     internalType: "uint256";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "setMaintainer";
  inputs: readonly [{
     name: "newMaintainer";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "setSeeder";
  inputs: readonly [{
     name: "newSeeder";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "totalBots";
  inputs: readonly [];
  outputs: readonly [{
     name: "";
     type: "uint256";
     internalType: "uint256";
  }];
  stateMutability: "view";
}, {
  type: "function";
  name: "updateBotMetadataDigest";
  inputs: readonly [{
     name: "startBot";
     type: "address";
     internalType: "address";
   }, {
     name: "numberOfBots";
     type: "uint256";
     internalType: "uint256";
   }, {
     name: "metadataDigest";
     type: "bytes32";
     internalType: "bytes32";
  }];
  outputs: readonly [{
     name: "";
     type: "address";
     internalType: "address";
  }];
  stateMutability: "nonpayable";
}, {
  type: "function";
  name: "updateInvitationModule";
  inputs: readonly [{
     name: "newInvitationModule";
     type: "address";
     internalType: "address";
  }];
  outputs: readonly [];
  stateMutability: "nonpayable";
}, {
  type: "event";
  name: "AdminSet";
  inputs: readonly [{
     name: "newAdmin";
     type: "address";
     indexed: true;
     internalType: "address";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "BotCreated";
  inputs: readonly [{
     name: "createdBot";
     type: "address";
     indexed: true;
     internalType: "address";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "FarmGrown";
  inputs: readonly [{
     name: "maintainer";
     type: "address";
     indexed: true;
     internalType: "address";
   }, {
     name: "numberOfBots";
     type: "uint256";
     indexed: true;
     internalType: "uint256";
   }, {
     name: "totalNumberOfBots";
     type: "uint256";
     indexed: true;
     internalType: "uint256";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "InvitationModuleUpdated";
  inputs: readonly [{
     name: "module";
     type: "address";
     indexed: true;
     internalType: "address";
   }, {
     name: "genericCallProxy";
     type: "address";
     indexed: true;
     internalType: "address";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "InvitesClaimed";
  inputs: readonly [{
     name: "inviter";
     type: "address";
     indexed: true;
     internalType: "address";
   }, {
     name: "count";
     type: "uint256";
     indexed: true;
     internalType: "uint256";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "InviterQuotaUpdated";
  inputs: readonly [{
     name: "inviter";
     type: "address";
     indexed: true;
     internalType: "address";
   }, {
     name: "quota";
     type: "uint256";
     indexed: true;
     internalType: "uint256";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "MaintainerSet";
  inputs: readonly [{
     name: "maintainer";
     type: "address";
     indexed: true;
     internalType: "address";
  }];
  anonymous: false;
}, {
  type: "event";
  name: "SeederSet";
  inputs: readonly [{
     name: "seeder";
     type: "address";
     indexed: true;
     internalType: "address";
  }];
  anonymous: false;
}, {
  type: "error";
  name: "ExceedsInviteQuota";
  inputs: readonly [];
}, {
  type: "error";
  name: "FarmIsDrained";
  inputs: readonly [];
}, {
  type: "error";
  name: "OnlyAdmin";
  inputs: readonly [];
}, {
  type: "error";
  name: "OnlyGenericCallProxy";
  inputs: readonly [];
}, {
  type: "error";
  name: "OnlyHumanAvatarsAreInviters";
  inputs: readonly [{
     name: "avatar";
     type: "address";
     internalType: "address";
  }];
}, {
  type: "error";
  name: "OnlyMaintainer";
  inputs: readonly [];
}, {
  type: "error";
  name: "OnlySeederOrBot";
  inputs: readonly [];
}];
```

Defined in: [packages/abis/src/invitationFarm.ts:1](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/abis/src/invitationFarm.ts#L1)
