import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { InventoryItem } from "../types/InventoryItem";
import type {
  CreateInventoryResponse,
  UpdateInventoryPayload,
  UpdateInventoryResponse,
  DeleteInventoryResponse,
} from "../types/inventory";

import type { CreateInventoryItem } from "../types/CreateInventoryItem";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Inventory"],
  endpoints: (builder) => ({
    /* ---------- CREATE ---------- */
    addProduct: builder.mutation<CreateInventoryResponse, CreateInventoryItem>({
      query: (body) => ({
        url: "/inventory",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inventory"],
    }),

    /* ---------- GET ALL ---------- */
    getInventoryItems: builder.query<InventoryItem[], void>({
      query: () => "/inventory",
      providesTags: ["Inventory"],
    }),

    /* ---------- GET ONE ---------- */
    getInventoryItem: builder.query<InventoryItem, string>({
      query: (productId) => `/inventory/${productId}`,
      providesTags: (_result, _error, productId) => [
        { type: "Inventory", id: productId },
      ],
    }),

    /* ---------- UPDATE ---------- */
    updateInventoryItem: builder.mutation<
      UpdateInventoryResponse,
      { productId: string; data: UpdateInventoryPayload }
    >({
      query: ({ productId, data }) => ({
        url: `/inventory/${productId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Inventory"],
    }),

    /* ---------- DELETE ---------- */
    deleteInventoryItem: builder.mutation<DeleteInventoryResponse, number>({
      query: (productId) => ({
        url: `/inventory/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),
  }),
});

/* ---------- Hooks ---------- */
export const {
  useAddProductMutation,
  useGetInventoryItemsQuery,
  useGetInventoryItemQuery,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi;
