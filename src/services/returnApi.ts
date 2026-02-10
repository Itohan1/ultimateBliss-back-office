import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

/* ================= TYPES ================= */

// src/services/returnApi.ts

export interface ReturnItem {
  _id: string;

  type: "customer_return" | "supplier_return" | "damaged";

  // ✅ ADD THIS
  adjustInventory: boolean;

  contact: {
    name: string;
    phone: string;
    address: string;
  };

  product: {
    productId: number;
    productName: string;

    category: {
      categoryId: string;
      categoryName: string;
    };

    subcategory: {
      subcategoryId: number;
      subcategoryName: string;
    };

    quantity: number;
    details?: string;
  };

  reason: string;

  image?: string | null;

  // ✅ already correct
  inventoryAdjusted: boolean;

  createdAt: string;
}

export type CreateReturnItemPayload = FormData;

/* ================= API ================= */

export const returnApi = createApi({
  reducerPath: "returnApi",
  tagTypes: ["Returns", "Inventory"],

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      if (state.adminAuth.token) {
        headers.set("Authorization", `Bearer ${state.adminAuth.token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    /* ===== CREATE ===== */
    createReturnItem: builder.mutation<ReturnItem, CreateReturnItemPayload>({
      query: (body) => ({
        url: "/returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Returns", "Inventory"],
    }),

    /* ===== GET ALL ===== */
    getReturnItems: builder.query<ReturnItem[], void>({
      query: () => "/returns",
      providesTags: ["Returns"],
    }),

    /* ===== GET SINGLE ===== */
    getReturnItem: builder.query<ReturnItem, string>({
      query: (id) => `/returns/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Returns", id }],
    }),

    /* ===== DELETE ===== */
    deleteReturnItem: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/returns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Returns", "Inventory"],
    }),

    /* ===== UPDATE ===== */
    updateReturnItem: builder.mutation<
      ReturnItem,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/returns/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Returns", "Inventory"],
    }),
  }),
});

export const {
  useCreateReturnItemMutation,
  useGetReturnItemsQuery,
  useGetReturnItemQuery, // ✅ add this
  useDeleteReturnItemMutation,
  useUpdateReturnItemMutation,
} = returnApi;
