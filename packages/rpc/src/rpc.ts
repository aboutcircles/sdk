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
} from './methods';

/**
 * Main RPC class for Circles protocol RPC interactions
 *
 * Uses lazy initialization - method modules are only created when first accessed.
 * This reduces initial memory footprint and instantiation overhead.
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
 * ```
 */
export class CirclesRpc {
  public readonly client: RpcClient;

  private _pathfinder?: PathfinderMethods;
  private _query?: QueryMethods;
  private _trust?: TrustMethods;
  private _balance?: BalanceMethods;
  private _avatar?: AvatarMethods;
  private _profile?: ProfileMethods;
  private _token?: TokenMethods;
  private _invitation?: InvitationMethods;
  private _transaction?: TransactionMethods;
  private _group?: GroupMethods;

  /**
   * Create a new CirclesRpc instance
   *
   * @param rpcUrl RPC URL to use (defaults to https://rpc.circlesubi.network/)
   */
  constructor(rpcUrl: string = 'https://rpc.circlesubi.network/') {
    this.client = new RpcClient(rpcUrl);
  }

  get pathfinder(): PathfinderMethods {
    if (!this._pathfinder) {
      this._pathfinder = new PathfinderMethods(this.client);
    }
    return this._pathfinder;
  }

  get query(): QueryMethods {
    if (!this._query) {
      this._query = new QueryMethods(this.client);
    }
    return this._query;
  }

  get trust(): TrustMethods {
    if (!this._trust) {
      this._trust = new TrustMethods(this.client);
    }
    return this._trust;
  }

  get balance(): BalanceMethods {
    if (!this._balance) {
      this._balance = new BalanceMethods(this.client);
    }
    return this._balance;
  }

  get avatar(): AvatarMethods {
    if (!this._avatar) {
      this._avatar = new AvatarMethods(this.client);
    }
    return this._avatar;
  }

  get profile(): ProfileMethods {
    if (!this._profile) {
      this._profile = new ProfileMethods(this.client);
    }
    return this._profile;
  }

  get token(): TokenMethods {
    if (!this._token) {
      this._token = new TokenMethods(this.client);
    }
    return this._token;
  }

  get invitation(): InvitationMethods {
    if (!this._invitation) {
      this._invitation = new InvitationMethods(this.client);
    }
    return this._invitation;
  }

  get transaction(): TransactionMethods {
    if (!this._transaction) {
      this._transaction = new TransactionMethods(this.client);
    }
    return this._transaction;
  }

  get group(): GroupMethods {
    if (!this._group) {
      this._group = new GroupMethods(this.client);
    }
    return this._group;
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
