export interface BasketItemInput {
  seller: string;
  sku: string;
  quantity: number;
  imageUrl?: string;
}

export interface OrderedItemRef {
  '@type'?: string;
  sku?: string;
  [k: string]: unknown;
}

export interface BasketItem {
  '@type'?: string;
  orderQuantity?: number;
  orderedItem?: OrderedItemRef;
  seller?: string;
  imageUrl?: string;
  productCid?: string;
  offerSnapshot?: unknown;
  [k: string]: unknown;
}

export interface PostalAddressInput {
  streetAddress?: string;
  addressLocality?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface ContactPointInput {
  email?: string;
  telephone?: string;
}

export interface PersonMinimalInput {
  birthDate?: string;
}

export interface Basket {
  basketId: string;
  buyer?: string;
  operator?: string;
  chainId: number;
  items: BasketItem[];
  status: string;
  [k: string]: unknown;
}

export interface ValidationResult {
  valid: boolean;
  requirements: any[];
  missing: any[];
  ruleTrace: any[];
}

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
