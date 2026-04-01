import { RpcClient } from './client';
import {
  PathfinderMethods,
  QueryMethods,
  TrustMethods,
  BalanceMethods,
  AvatarMethods,
  ProfileMethods,
  TokenMethods,
  InvitationMethods,
  TransactionMethods,
  GroupMethods,
  SdkMethods,
} from './methods';

/**
 * Main RPC class for Circles protocol RPC interactions
 *
 * @example
 * ```typescript
 * // Use default RPC endpoint
 * const rpc = new CirclesRpc();
 *
 * // Use custom RPC endpoint
 * const rpc = new CirclesRpc('https://rpc.circlesubi.network/');
 *
 * // Find a path
 * const path = await rpc.pathfinder.findPath({
 *   Source: '0x749c930256b47049cb65adcd7c25e72d5de44b3b',
 *   Sink: '0xde374ece6fa50e781e81aac78e811b33d16912c7',
 *   TargetFlow: '99999999999999999999999999999999999'
 * });
 *
 * // Query trust relations
 * const trustRelations = await rpc.query.query({
 *   Namespace: 'V_CrcV2',
 *   Table: 'TrustRelations',
 *   Columns: [],
 *   Filter: [],
 *   Order: []
 * });
 *
 * // Get profile
 * const profile = await rpc.profile.getProfileByAddress('0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7');
 * 
 * // Get consolidated profile view (Phase 3 SDK enablement)
 * const profileView = await rpc.sdk.getProfileView('0xde374ece6fa50e781e81aac78e811b33d16912c7');
 * ```
 */
export class CirclesRpc {
  public readonly client: RpcClient;
  public readonly pathfinder: PathfinderMethods;
  public readonly query: QueryMethods;
  public readonly trust: TrustMethods;
  public readonly balance: BalanceMethods;
  public readonly avatar: AvatarMethods;
  public readonly profile: ProfileMethods;
  public readonly token: TokenMethods;
  public readonly invitation: InvitationMethods;
  public readonly transaction: TransactionMethods;
  public readonly group: GroupMethods;
  public readonly sdk: SdkMethods;

  /**
   * Create a new CirclesRpc instance
   *
   * @param rpcUrl RPC URL to use (defaults to https://rpc.circlesubi.network/)
   */
  constructor(rpcUrl: string = 'https://rpc.circlesubi.network/') {
    this.client = new RpcClient(rpcUrl);

    this.pathfinder = new PathfinderMethods(this.client);
    this.query = new QueryMethods(this.client);
    this.trust = new TrustMethods(this.client);
    this.balance = new BalanceMethods(this.client);
    this.avatar = new AvatarMethods(this.client);
    this.profile = new ProfileMethods(this.client);
    this.token = new TokenMethods(this.client);
    this.invitation = new InvitationMethods(this.client);
    this.transaction = new TransactionMethods(this.client);
    this.group = new GroupMethods(this.client);
    this.sdk = new SdkMethods(this.client);
  }

  /**
   * Update the RPC URL
   */
  setRpcUrl(rpcUrl: string): void {
    this.client.setRpcUrl(rpcUrl);
  }

  /**
   * Get the current RPC URL
   */
  getRpcUrl(): string {
    return this.client.getRpcUrl();
  }
}
