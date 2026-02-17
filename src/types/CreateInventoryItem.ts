export type DiscountType = "none" | "percentage" | "flat" | "free";

export interface CreateInventoryItem {
  productName: string;
  sku: string;
  category: string;
  subcategory?: string;
  description?: string;
  brandName?: string;
  manufacturer?: string;
  unitOfMeasure?: string;

  inventory: {
    stockNumber: number;
    lowStockThreshold: number;
    expiryDate: string;
  };

  pricing: {
    costPrice: number;
    sellingPrice: number;
    discount?: number;
    discountType?: DiscountType;

    // 🔥 NEW
    freeOffer?: {
      minQuantityOfPurchase: number;
      freeItemQuantity: number;
      freeItemDescription: string;
    };
  };

  productImage?: string | null;
}
