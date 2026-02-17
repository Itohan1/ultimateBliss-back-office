export type DiscountType =
  | "percentage"
  | "flat"
  | "free"
  | "none"
  | "promotion";

export interface InventoryItem {
  productId: number;
  productName: string;
  sku: string;
  category: string;
  subcategory?: string;
  brandName?: string;
  manufacturer?: string;
  unitOfMeasure?: string;

  inventory: {
    stockNumber: number;
    lowStockThreshold: number;
    expiryDate?: string | null;
  };

  pricing: {
    costPrice: number;
    sellingPrice: number;
    discount?: number;
    discountType?: DiscountType;
    discountedPrice?: number;
    isDiscounted?: boolean;
    freeOffer?: {
      minQuantityOfPurchase?: number;
      freeItemQuantity?: number;
      freeItemDescription?: string;
    };
  };

  discount?: number;
  discountType?: DiscountType;

  productImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
