import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { InventoryItem } from "../types/InventoryItem";

type TargetType = "all" | "selected" | "category";
type DiscountType = "percentage" | "flat" | "free";

export interface DiscountTargetPayload {
  target: TargetType;
  productIds?: number[];
  category?: string;
  subcategory?: string;
}

export interface ApplyDiscountPayload extends DiscountTargetPayload {
  discountType: DiscountType;
  discount?: number;
  freeOffer?: {
    minQuantityOfPurchase?: number;
    freeItemQuantity?: number;
    freeItemDescription?: string;
  };
}

export const discountApi = createApi({
  reducerPath: "discountApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Discount"],
  endpoints: (builder) => ({
    getDiscountedItems: builder.query<InventoryItem[], void>({
      query: () => "/discounts/items",
      providesTags: ["Discount"],
    }),
    applyDiscount: builder.mutation<
      { message: string; matchedCount: number; modifiedCount: number },
      ApplyDiscountPayload
    >({
      query: (body) => ({
        url: "/discounts/apply",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Discount"],
    }),
    removeDiscount: builder.mutation<
      { message: string; matchedCount: number; modifiedCount: number },
      DiscountTargetPayload
    >({
      query: (body) => ({
        url: "/discounts/remove",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Discount"],
    }),
  }),
});

export const {
  useGetDiscountedItemsQuery,
  useApplyDiscountMutation,
  useRemoveDiscountMutation,
} = discountApi;
