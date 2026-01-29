import type { CirclesConfig } from '@aboutcircles/sdk-types';

/**
 * Default Circles configurations by chain ID
 *
 * Chain IDs:
 * - 100: Gnosis Chain (mainnet)
 */
export const circlesConfig: { [chainId: number]: CirclesConfig } = {
  100: {
    circlesRpcUrl: "https://rpc.aboutcircles.com/",
    pathfinderUrl: "https://pathfinder.aboutcircles.com",
    profileServiceUrl: "https://rpc.aboutcircles.com/profiles/",
    referralsServiceUrl: "https://staging.circlesubi.network/referrals",
    v1HubAddress: "0x29b9a7fbb8995b2423a71cc17cf9810798f6c543",
    v2HubAddress: "0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8",
    nameRegistryAddress: "0xA27566fD89162cC3D40Cb59c87AAaA49B85F3474",
    baseGroupMintPolicy: "0xcCa27c26CF7BAC2a9928f42201d48220F0e3a549",
    standardTreasury: "0x08F90aB73A515308f03A718257ff9887ED330C6e",
    coreMembersGroupDeployer: "0xFEca40Eb02FB1f4F5F795fC7a03c1A27819B1Ded",
    baseGroupFactoryAddress: "0xD0B5Bd9962197BEaC4cbA24244ec3587f19Bd06d",
    liftERC20Address: "0x5F99a795dD2743C36D63511f0D4bc667e6d3cDB5",
    invitationFarmAddress: "0x0000000000000000000000000000000000000000",
    referralsModuleAddress: "0x12105a9B291aF2ABb0591001155A75949b062CE5",
    invitationModuleAddress: "0x00738aca013B7B2e6cfE1690F0021C3182Fa40B5"
  }
};
