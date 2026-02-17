export type DiscountType = "percentage" | "flat" | "free" | "none";

export interface CartItem {
  orderItemId: number;
  productId: number;
  name: string;
  image: string;
  discount?: number;

  sellingPrice: number;
  discountedPrice: number;

  discountType: DiscountType;
  freeItemDescription?: string;
  minPurchaseQuantity?: number;
  freeQuantity?: number;

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

export interface AddToCartPayload {
  userId?: string;
  product: {
    productId: number;
    name: string;
    image: string;
    sellingPrice: number;
    discountedPrice: number;
    discount?: number;
    discountType?: DiscountType;
    minPurchaseQuantity?: number;
    freeQuantity?: number;
    freeItemDescription?: string;
    isDiscounted?: boolean;
  };
}

export interface UpdateQtyPayload {
  cartId: number;
  orderItemId: number;
}
