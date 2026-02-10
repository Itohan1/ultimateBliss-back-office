export type DiscountType = "free" | "promotion" | "none";

export interface InventoryItem {
  productId: number; // ✅ REQUIRED (CRITICAL)

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
  };

  // 🔥 discounts belong here, NOT in pricing
  discount?: number;
  discountType?: DiscountType;

  productImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
