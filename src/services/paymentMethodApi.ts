import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const paymentMethodApi = createApi({
  reducerPath: "paymentMethodApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1/payment-methods`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;

      console.log("TOKEN BEING SENT:", token);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["PaymentMethod"],
  endpoints: (builder) => ({
    // **No argument needed here, so we explicitly pass void**
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => "/", // void because no argument is expected
      providesTags: ["PaymentMethod"],
    }),
    createPaymentMethod: builder.mutation<
      PaymentMethod,
      { name: string; details: string }
    >({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PaymentMethod"],
    }),
    updatePaymentMethod: builder.mutation<
      PaymentMethod,
      { id: string; name: string; details: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PaymentMethod"],
    }),
    deletePaymentMethod: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentMethod"],
    }),
    changePaymentMethodStatus: builder.mutation<
      PaymentMethod,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["PaymentMethod"],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useChangePaymentMethodStatusMutation,
} = paymentMethodApi;

// **PaymentMethod type**
export interface PaymentMethod {
  _id: string;
  name: string;
  details: string;
  isActive: boolean;
}
