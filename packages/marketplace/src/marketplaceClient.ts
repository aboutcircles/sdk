import { FetchHttpTransport, type HttpTransport } from './http.js';
import { InMemoryAuthContext, type AuthContext } from './authContext.js';
import { AuthClientImpl, type AuthClient } from './auth.js';
import { SignersClientImpl, type SignersClient } from './signers.js';
import { OrdersClientImpl, type OrdersClient } from './orders.js';
import { CartClientImpl, type CartClient } from './cart.js';
import { OffersClientImpl, type OffersClient } from './offers.js';
import { CatalogClientImpl, type CatalogClient } from './catalog.js';
import { SalesClient, type SalesClientApi } from './sales.js';
import type { ProfilesBindings } from './namespaces.js';

export interface MarketplaceClientOptions {
  /** Base URL of the Circles Market API, e.g. https://market.aboutcircles.com */
  marketApiBase: string;
  /** Optional custom HTTP transport (defaults to FetchHttpTransport). */
  http?: HttpTransport;
  /** Optional custom AuthContext (defaults to in-memory implementation). */
  authContext?: AuthContext;
  /** Optional bindings for Profiles/IPFS to enable offers publishing. */
  profilesBindings?: ProfilesBindings;
}

/** Top-level entry point to the Circles Market SDK. */
export class MarketplaceClient {
  readonly marketApiBase: string;
  readonly http: HttpTransport;
  readonly authContext: AuthContext;

  readonly signers: SignersClient;
  readonly auth: AuthClient;
  readonly orders: OrdersClient;
  readonly cart: CartClient;
  readonly offers?: OffersClient;
  readonly catalog: CatalogClient;
  readonly sales: SalesClientApi;

  constructor(opts: MarketplaceClientOptions) {
    this.marketApiBase = opts.marketApiBase.replace(/\/$/, '');
    this.http = opts.http ?? new FetchHttpTransport();
    this.authContext = opts.authContext ?? new InMemoryAuthContext();

    this.signers = new SignersClientImpl();
    this.auth = new AuthClientImpl(this.marketApiBase, this.http, this.authContext, this.signers);
    this.orders = new OrdersClientImpl(this.marketApiBase, this.http, this.authContext);
    this.cart = new CartClientImpl(this.marketApiBase, this.http, this.authContext);
    this.offers = opts.profilesBindings ? new OffersClientImpl(opts.profilesBindings) : undefined;
    this.catalog = new CatalogClientImpl(this.marketApiBase);
    this.sales = new SalesClient(this.marketApiBase, this.http, this.authContext);
  }
}
