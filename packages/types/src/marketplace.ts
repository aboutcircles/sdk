import type { Address } from './base.js';

// ─── Cart ────────────────────────────────────────────────────────────────────

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


// ─── Offers ──────────────────────────────────────────────────────────────────

export interface MinimalProductInput {
  sku: string;
  name: string;
  description?: string;
  image?: string | string[];
  url?: string;
  brand?: string;
  mpn?: string;
  gtin13?: string;
  category?: string;
}

export interface MinimalOfferInput {
  price: number;
  priceCurrency: string;
  url?: string;
  availabilityFeed?: string;
  inventoryFeed?: string;
  availableDeliveryMethod?: string;
  requiredSlots?: string[];
  fulfillmentEndpoint?: string;
  fulfillmentTrigger?: 'confirmed' | 'finalized';
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderOutboxItem {
  id?: number;
  source?: string | null;
  type?: string;
  payload: unknown;
  createdAt?: string;
}

export interface OrderSnapshot {
  orderNumber: string;
  orderStatus?: string;
  orderDate?: string;
  paymentReference?: string;
  outbox?: OrderOutboxItem[];
  [k: string]: unknown;
}

export interface OrderStatusEventPayload {
  orderId: string;
  oldStatus: string | null;
  newStatus: string;
  changedAt: string;
}

export interface OrderStatusHistoryEvent {
  oldStatus: string | null;
  newStatus: string;
  changedAt: string;
}

export interface OrderStatusHistory {
  events: OrderStatusHistoryEvent[];
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export type SellerOrderDto = {
  '@context': 'https://schema.org/';
  '@type': 'Order';
  orderNumber: string;
  orderStatus: string;
  orderDate: string;
  paymentReference: string | null;
  broker: any;
  acceptedOffer: any[];
  orderedItem: any[];
  totalPaymentDue: any | null;
  outbox?: any[];
  [k: string]: unknown;
};

export type SellerOrdersPage = { items: SellerOrderDto[] };

export type OrderId = string & { readonly __brand: 'OrderId' };

// ─── Catalog ─────────────────────────────────────────────────────────────────

export type SchemaOrgThingRef = { '@id': string };

export type SchemaOrgPropertyValue = {
  '@type': 'PropertyValue';
  propertyID: string;
  value: string;
  name?: string;
};

export type SchemaOrgPayAction = {
  '@type': 'PayAction';
  price?: number;
  priceCurrency?: string;
  recipient?: SchemaOrgThingRef;
  instrument?: SchemaOrgPropertyValue;
};

export type SchemaOrgOfferLite = {
  '@type': 'Offer';
  price?: number;
  priceCurrency?: string;
  availabilityFeed?: string;
  inventoryFeed?: string;
  inventoryLevel?: { '@type': 'QuantitativeValue'; value: number; unitCode?: string };
  url?: string;
  availableDeliveryMethod?: string;
  availability?: string;
  checkout?: string;
  potentialAction?: SchemaOrgPayAction | SchemaOrgPayAction[];
};

export type SchemaOrgProductLite = {
  '@context': (string | object)[];
  '@type': 'Product';
  sku: string;
  name: string;
  description?: string;
  image?: unknown;
  url?: string;
  brand?: string;
  mpn?: string;
  gtin13?: string;
  category?: string;
  offers: SchemaOrgOfferLite[];
};

export type AggregatedCatalogItem = {
  seller: Address;
  productCid: string;
  publishedAt: number;
  linkKeccak: string;
  indexInChunk: number;
  product: SchemaOrgProductLite;
};

export type AggregatedCatalog = {
  '@context': unknown;
  '@type': string;
  operator: Address;
  chainId: number;
  window: { start: number; end: number };
  avatarsScanned: Address[];
  products: AggregatedCatalogItem[];
  errors: unknown[];
};
