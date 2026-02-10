// src/services/orderApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
} from "../types/order.ts";

export const orderApi = createApi({
  reducerPath: "orderApi",
  tagTypes: ["Orders", "Cart"],

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
    /* ================= USER ================= */

    // POST /orders
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({
        url: "/orders/admin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "Cart"],
    }),

    // GET /orders/my-orders
    getMyOrders: builder.query<Order[], void>({
      query: () => "/orders/admin/my-orders",
      providesTags: ["Orders"],
    }),

    /* ================= ADMIN ================= */

    // GET /orders
    getAllOrders: builder.query<Order[], void>({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),

    // PATCH /orders/:orderId/status
    updateOrderStatus: builder.mutation<Order, UpdateOrderStatusPayload>({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),

    // GET single order
    getOrderById: builder.query<Order, number>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ["Orders"],
    }),

    // PATCH transaction status
    updateTransactionStatus: builder.mutation<
      Order,
      { orderId: number; transactionStatus: string }
    >({
      query: ({ orderId, transactionStatus }) => ({
        url: `/orders/${orderId}/transaction-status`,
        method: "PATCH",
        body: { transactionStatus },
      }),
      invalidatesTags: ["Orders"],
    }),

    // PATCH /orders/:orderId/shipping
    updateShippingDetails: builder.mutation<
      Order,
      { orderId: number; description?: string; estimatedDelivery?: string }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/shipping`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),
    disputeOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/dispute`,
        method: "PATCH",
      }),
      invalidatesTags: ["Orders"],
    }),

    settleDispute: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/settle-dispute`,
        method: "PATCH",
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useDisputeOrderMutation,
  useSettleDisputeMutation,
  useCreateOrderMutation,
  useUpdateShippingDetailsMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdateTransactionStatusMutation,
} = orderApi;
