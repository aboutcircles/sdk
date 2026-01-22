import { HubV2Contract, BaseGroupFactoryContract, NameRegistryContract, LiftERC20Contract, InvitationEscrowContract, InvitationFarmContract, ReferralsModuleContract } from './contracts';
import type { CirclesConfig } from '@aboutcircles/sdk-types';
import { circlesConfig } from './config';

/**
 * Core SDK class for managing Circles protocol contract interactions
 *
 * Uses lazy initialization - contracts are only created when first accessed.
 * This reduces initial memory footprint and bundle size for tree-shaking.
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

  private _hubV2?: HubV2Contract;
  private _baseGroupFactory?: BaseGroupFactoryContract;
  private _nameRegistry?: NameRegistryContract;
  private _liftERC20?: LiftERC20Contract;
  private _invitationEscrow?: InvitationEscrowContract;
  private _invitationFarm?: InvitationFarmContract;
  private _referralsModule?: ReferralsModuleContract;

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
  }

  get hubV2(): HubV2Contract {
    if (!this._hubV2) {
      this._hubV2 = new HubV2Contract({
        address: this.config.v2HubAddress,
        rpcUrl: this.rpcUrl,
      });
    }
    return this._hubV2;
  }

  get baseGroupFactory(): BaseGroupFactoryContract {
    if (!this._baseGroupFactory) {
      this._baseGroupFactory = new BaseGroupFactoryContract({
        address: this.config.baseGroupFactoryAddress,
        rpcUrl: this.rpcUrl,
      });
    }
    return this._baseGroupFactory;
  }

  get nameRegistry(): NameRegistryContract {
    if (!this._nameRegistry) {
      this._nameRegistry = new NameRegistryContract({
        address: this.config.nameRegistryAddress,
        rpcUrl: this.rpcUrl,
      });
    }
    return this._nameRegistry;
  }

  get liftERC20(): LiftERC20Contract {
    if (!this._liftERC20) {
      this._liftERC20 = new LiftERC20Contract({
        address: this.config.liftERC20Address,
        rpcUrl: this.rpcUrl,
      });
    }
    return this._liftERC20;
  }

  get invitationEscrow(): InvitationEscrowContract {
    if (!this._invitationEscrow) {
      this._invitationEscrow = new InvitationEscrowContract({
        address: this.config.invitationEscrowAddress,
        rpcUrl: this.rpcUrl,
      });
    }
    return this._invitationEscrow;
  }

  get invitationFarm(): InvitationFarmContract {
    if (!this._invitationFarm) {
      this._invitationFarm = new InvitationFarmContract({
        address: this.config.invitationFarmAddress,
        rpcUrl: this.rpcUrl,
      });
    }
    return this._invitationFarm;
  }

  get referralsModule(): ReferralsModuleContract {
    if (!this._referralsModule) {
      this._referralsModule = new ReferralsModuleContract({
        address: this.config.referralsModuleAddress,
        rpcUrl: this.rpcUrl,
      });
    }
    return this._referralsModule;
  }
}
