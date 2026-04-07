import type { HttpTransport } from './http.js';
import type { AuthContext } from './authContext.js';
import type {
  Basket,
  BasketItemInput,
  PostalAddressInput,
  ContactPointInput,
  PersonMinimalInput,
  ValidationResult,
} from '@aboutcircles/sdk-types';

export function basketToItemInputs(basket: Basket): BasketItemInput[] {
  const items = Array.isArray((basket as any).items) ? (basket as any).items : [];
  return items
    .map((it: any) => {
      const seller = typeof it?.seller === 'string' ? it.seller : '';
      const sku = typeof it?.orderedItem?.sku === 'string' ? it.orderedItem.sku : '';
      const quantity = typeof it?.orderQuantity === 'number' ? it.orderQuantity : 0;
      const imageUrl = typeof it?.imageUrl === 'string' ? it.imageUrl : undefined;
      if (!seller || !sku || quantity <= 0) return null;
      return { seller, sku, quantity, imageUrl } as BasketItemInput;
    })
    .filter((x: any): x is BasketItemInput => x !== null);
}

export interface CartClient {
  createBasket(opts: { buyer: string; operator: string; chainId?: number }): Promise<{ basketId: string }>;
  setItems(opts: { basketId: string; items: BasketItemInput[] }): Promise<Basket>;
  setCheckoutDetails(opts: {
    basketId: string;
    shippingAddress?: PostalAddressInput;
    billingAddress?: PostalAddressInput;
    contactPoint?: ContactPointInput;
    ageProof?: PersonMinimalInput;
  }): Promise<Basket>;
  validateBasket(basketId: string): Promise<ValidationResult>;
  previewOrder(basketId: string): Promise<any>;
  checkoutBasket(opts: { basketId: string; buyer?: string }): Promise<{ orderId: string; paymentReference: string; basketId: string }>;
}

export class CartClientImpl implements CartClient {
  constructor(
    private readonly marketApiBase: string,
    private readonly http: HttpTransport,
    private readonly authContext: AuthContext,
  ) {}

  private maybeAuthHeaders(): Record<string, string> {
    const token = this.authContext.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createBasket(opts: { buyer: string; operator: string; chainId?: number }): Promise<{ basketId: string }> {
    return await this.http.request<{ basketId: string }>({
      method: 'POST',
      url: `${this.marketApiBase}/api/cart/v1/baskets`,
      headers: { ...this.maybeAuthHeaders() },
      body: { buyer: opts.buyer, operator: opts.operator, chainId: opts.chainId ?? 100 },
    });
  }

  async setItems(opts: { basketId: string; items: BasketItemInput[] }): Promise<Basket> {
    const items = opts.items.map((i) => ({
      seller: i.seller,
      orderedItem: { '@type': 'Product', sku: i.sku },
      orderQuantity: i.quantity,
      imageUrl: i.imageUrl,
    }));
    return await this.http.request<Basket>({
      method: 'PATCH',
      url: `${this.marketApiBase}/api/cart/v1/baskets/${encodeURIComponent(opts.basketId)}`,
      headers: { ...this.maybeAuthHeaders() },
      body: { items },
    });
  }

  async setCheckoutDetails(opts: {
    basketId: string;
    shippingAddress?: PostalAddressInput;
    billingAddress?: PostalAddressInput;
    contactPoint?: ContactPointInput;
    ageProof?: PersonMinimalInput;
  }): Promise<Basket> {
    const body: any = {};
    if (opts.shippingAddress) body.shippingAddress = { '@type': 'PostalAddress', ...opts.shippingAddress };
    if (opts.billingAddress) body.billingAddress = { '@type': 'PostalAddress', ...opts.billingAddress };
    if (opts.contactPoint) body.contactPoint = { '@type': 'ContactPoint', ...opts.contactPoint };
    if (opts.ageProof) body.ageProof = { '@type': 'Person', ...opts.ageProof };

    return await this.http.request<Basket>({
      method: 'PATCH',
      url: `${this.marketApiBase}/api/cart/v1/baskets/${encodeURIComponent(opts.basketId)}`,
      headers: { ...this.maybeAuthHeaders() },
      body,
    });
  }

  async validateBasket(basketId: string): Promise<ValidationResult> {
    return await this.http.request<ValidationResult>({
      method: 'POST',
      url: `${this.marketApiBase}/api/cart/v1/baskets/${encodeURIComponent(basketId)}/validate`,
      headers: { ...this.maybeAuthHeaders() },
    });
  }

  async previewOrder(basketId: string): Promise<any> {
    return await this.http.request<any>({
      method: 'POST',
      url: `${this.marketApiBase}/api/cart/v1/baskets/${encodeURIComponent(basketId)}/preview`,
      headers: { ...this.maybeAuthHeaders() },
    });
  }

  async checkoutBasket(opts: { basketId: string; buyer?: string }): Promise<{ orderId: string; paymentReference: string; basketId: string }> {
    const qp = new URLSearchParams();
    if (typeof opts.buyer === 'string' && opts.buyer.length > 0) qp.set('buyer', opts.buyer);
    const qs = qp.toString();
    const url = qs
      ? `${this.marketApiBase}/api/cart/v1/baskets/${encodeURIComponent(opts.basketId)}/checkout?${qs}`
      : `${this.marketApiBase}/api/cart/v1/baskets/${encodeURIComponent(opts.basketId)}/checkout`;

    return await this.http.request<{ orderId: string; paymentReference: string; basketId: string }>({
      method: 'POST',
      url,
      headers: { ...this.maybeAuthHeaders() },
    });
  }
}
