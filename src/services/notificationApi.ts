import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "BOOKING" | "PAYMENT" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getAdminNotifications: builder.query<Notification[], void>({
      query: () => "/notifications/admin",
      providesTags: ["Notification"],
    }),

    markNotificationAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/admin/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetAdminNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
