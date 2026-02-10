/* ---------- Inventory Sub-Types ---------- */
import type { InventoryItem } from "./InventoryItem";

export interface InventoryInfo {
  stockNumber: number;
  lowStockThreshold: number;
  expiryDate?: string | null;
}

export interface PricingInfo {
  costPrice: number;
  sellingPrice: number;
}

/* ---------- Discount ---------- */

/*export type DiscountType = "percentage" | "fixed" | null;



export interface InventoryItem {
  _id?: string;
  productId?: number;

  productName: string;
  sku: string;
  category: string;
  subcategory?: string;
  brandName?: string;
  manufacturer?: string;
  unitOfMeasure?: string;

  inventory: InventoryInfo;
  pricing: PricingInfo;

  discountType?: DiscountType;
  discount?: number;

  isLiked?: boolean;
  totalLikes?: number;

  averageRating?: number;
  totalReviews?: number;

  productImage?: string | null;

  createdAt?: string;
  updatedAt?: string;
}*/

/* ---------- API Payloads ---------- */

export type CreateInventoryPayload = InventoryItem;

export type UpdateInventoryPayload = Partial<InventoryItem>;

/* ---------- API Responses ---------- */

export interface CreateInventoryResponse {
  message: string;
  product: InventoryItem;
}

export interface UpdateInventoryResponse {
  message: string;
  product: InventoryItem;
}

export interface DeleteInventoryResponse {
  message: string;
}
