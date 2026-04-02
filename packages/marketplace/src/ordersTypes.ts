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
