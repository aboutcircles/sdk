import { HubV2Contract, BaseGroupFactoryContract, NameRegistryContract, LiftERC20Contract, InvitationEscrowContract, InvitationFarmContract, ReferralsModuleContract } from './contracts';
import type { CirclesConfig } from '@aboutcircles/sdk-types';
import { circlesConfig } from './config';

/**
 * Core SDK class for managing Circles protocol contract interactions
 *
 * @example
 * ```typescript
 * // Use default Gnosis Chain config
 * const core = new Core();
 *
 * // Use default config with custom RPC
 * const core = new Core(circlesConfig[100], 'https://custom-rpc.com');
 *
 * // Use custom config
 * const customConfig = { ...circlesConfig[100], v2HubAddress: '0x...' };
 * const core = new Core(customConfig);
 *
 * // Use HubV2 contract
 * const groupMintTx = core.hubV2.groupMint(
 *   '0xGroupAddress',
 *   ['0xAvatar1', '0xAvatar2'],
 *   [BigInt(100), BigInt(200)],
 *   '0x'
 * );
 *
 * // Create a new BaseGroup
 * const createGroupTx = core.baseGroupFactory.createBaseGroup(
 *   '0xOwner',
 *   '0xService',
 *   '0xFeeCollection',
 *   [],
 *   'MyGroup',
 *   'MYG',
 *   '0x0000000000000000000000000000000000000000000000000000000000000000'
 * );
 * ```
 */
export class Core {
  public readonly config: CirclesConfig;
  public readonly rpcUrl: string;
  public readonly hubV2: HubV2Contract;
  public readonly baseGroupFactory: BaseGroupFactoryContract;
  public readonly nameRegistry: NameRegistryContract;
  public readonly liftERC20: LiftERC20Contract;
  public readonly invitationEscrow: InvitationEscrowContract;
  public readonly invitationFarm: InvitationFarmContract;
  public readonly referralsModule: ReferralsModuleContract;

  /**
   * Create a new Core SDK instance
   *
   * @param config Circles configuration (defaults to Gnosis Chain mainnet)
   */
  constructor(
    config: CirclesConfig = circlesConfig[100]
  ) {
    this.config = config;
    this.rpcUrl = config.circlesRpcUrl;

    this.hubV2 = new HubV2Contract({
      address: config.v2HubAddress,
      rpcUrl: this.rpcUrl,
    });

    this.baseGroupFactory = new BaseGroupFactoryContract({
      address: config.baseGroupFactoryAddress,
      rpcUrl: this.rpcUrl,
    });

    this.nameRegistry = new NameRegistryContract({
      address: config.nameRegistryAddress,
      rpcUrl: this.rpcUrl,
    });

    this.liftERC20 = new LiftERC20Contract({
      address: config.liftERC20Address,
      rpcUrl: this.rpcUrl,
    });

    this.invitationEscrow = new InvitationEscrowContract({
      address: config.invitationEscrowAddress,
      rpcUrl: this.rpcUrl,
    });

    this.invitationFarm = new InvitationFarmContract({
      address: config.invitationFarmAddress,
      rpcUrl: this.rpcUrl,
    });

    this.referralsModule = new ReferralsModuleContract({
      address: config.referralsModuleAddress,
      rpcUrl: this.rpcUrl,
    });
  }
}
