// src/types/order.ts

export interface OrderItem {
  productId: number;
  name: string;
  image: string;
  price?: number;
  sellingPrice?: number;
  discountedPrice?: number;
  quantity: number;
  totalPrice: number;
  discount?: number;
  freeQuantity?: number;
  freeItemDescription?: string;
  minPurchaseQuantity?: number;
  discountType: "free" | "percentage" | "flat" | "promotion" | "none";
}

export interface BillingInfo {
  firstname: string;
  lastname: string;
  company?: string;
  streetAddress: string;
  apartment?: string;
  country: string;
  state: string;
  city: string;
  postcode?: string;
}

/* ================= STATUS TYPES ================= */

export type TransactionStatus = "pending" | "success" | "failed";

export type OrderStatus =
  | "pending"
  | "packaging"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

/* ================= DELIVERY ================= */

export interface DeliveryInfo {
  description?: string;
  estimatedDelivery?: string; // ISO date
}

/* ================= ORDER ================= */

export interface Order {
  _id: string;
  orderId: number;
  userId: string;
  transactionId: string;

  items: OrderItem[];
  subTotal: number;
  totalDiscount: number;
  grandTotal: number;

  billing: BillingInfo;
  paymentMethodId: string;

  transactionStatus: TransactionStatus;
  orderStatus: OrderStatus;

  /* ===== DELIVERY ===== */
  delivery?: DeliveryInfo;

  /* ===== DISPUTE SYSTEM ===== */
  isDisputed?: boolean;

  disputeWindowExpiresAt?: string; // ISO date (24h countdown)

  completedAt?: string;
  hasBeenDisputed?: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ================= API PAYLOADS ================= */

export interface CreateOrderPayload {
  cartId: number;
  billing: BillingInfo;
  paymentMethodId: string;
}

export interface UpdateOrderStatusPayload {
  orderId: number;
  orderStatus?: OrderStatus;
  transactionStatus?: TransactionStatus;
}

export interface UpdateShippingDetailsPayload {
  description?: string;
  estimatedDelivery?: string;
}
