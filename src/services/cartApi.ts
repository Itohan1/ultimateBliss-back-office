import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Cart,
  AddToCartPayload,
  UpdateQtyPayload,
} from "../types/cart.ts";
import type { RootState } from "../store";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if exists
      const state = getState() as RootState;

      // Auth token (logged-in users)
      if (state.adminAuth.token) {
        headers.set("Authorization", `Bearer ${state.adminAuth.token}`);
      }

      // Guest session
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        headers.set("x-session-id", sessionId);
      }

      return headers;
    },

    // 2️⃣ Capture session AFTER response
    responseHandler: async (response) => {
      const sessionId =
        response.headers.get("X-Session-Id") ??
        response.headers.get("x-session-id");

      if (sessionId && !localStorage.getItem("sessionId")) {
        localStorage.setItem("sessionId", sessionId);
      }

      return response.json();
    },
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    /* GET CART */
    getCart: builder.query<Cart, void>({
      query: () => `/cart/admin/me`,
      providesTags: ["Cart"],
    }),

    /* ADD TO CART */
    addToCart: builder.mutation<Cart, AddToCartPayload>({
      query: (body) => ({
        url: "/cart/admin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    /* INCREASE QTY */
    increaseQty: builder.mutation<Cart, UpdateQtyPayload>({
      query: ({ cartId, orderItemId }) => ({
        url: `/cart/admin/${cartId}/increase/${orderItemId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Cart"],
    }),

    /* DECREASE QTY */
    decreaseQty: builder.mutation<Cart, UpdateQtyPayload>({
      query: ({ cartId, orderItemId }) => ({
        url: `/cart/admin/${cartId}/decrease/${orderItemId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Cart"],
    }),

    /* REMOVE ITEM */
    removeFromCart: builder.mutation<Cart, UpdateQtyPayload>({
      query: ({ cartId, orderItemId }) => ({
        url: `/cart/admin/${cartId}/remove/${orderItemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useIncreaseQtyMutation,
  useDecreaseQtyMutation,
  useRemoveFromCartMutation,
} = cartApi;
