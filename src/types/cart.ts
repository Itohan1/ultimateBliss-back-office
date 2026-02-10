export type DiscountType = "free" | "promotion" | "none";

export interface CartItem {
  orderItemId: number;
  productId: number;
  name: string;
  image: string;
  price: number;
  discount: number;
  discountType: DiscountType;
  quantity: number;
  totalPrice: number;
}

export interface Cart {
  cartId: number;
  userId?: string;
  orderId: number;
  items: CartItem[];
  subTotal: number;
  totalDiscount: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

/* REQUEST PAYLOADS */

export interface AddToCartPayload {
  userId?: string;
  product: {
    productId: number;
    name: string;
    image: string;
    price: number;
    discount?: number;
    discountType?: DiscountType;
  };
}

export interface UpdateQtyPayload {
  cartId: number;
  orderItemId: number;
}
