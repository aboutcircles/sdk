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

export function isOrderId(s: string): s is OrderId {
  return /^ord_[0-9A-F]{32}$/.test(s);
}
