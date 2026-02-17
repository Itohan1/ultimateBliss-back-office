import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface ConsultationPlan {
  consultationPlanId: number;
  name: string;
  description: string;
  amount: number;
}

export interface ConsultationBooking {
  _id: string;
  consultationPlanId: number;
  timeSlotId: number;
  date: string;

  status: "pending" | "confirmed" | "cancelled" | "completed";
  transactionStatus: "pending" | "successful" | "failed";

  transactionId?: string;
  paymentMethod?: string;
  paymentExpiresAt: string;

  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  timeSlotId: number;
  label: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CreateBookingPayload {
  consultationPlanId: number;
  timeSlotId: number;
  date: string;
}

export interface UserBooking {
  _id: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  transactionStatus: "pending" | "successful" | "failed";
  paymentMethod?: string;
  paymentExpiresAt: string;

  consultationPlanId: {
    name: string;
    amount: number;
  };
  timeSlotId: {
    label: string;
  };
}

export interface AdminBooking {
  _id: string;
  userId: string;
  date: string;

  status: "pending" | "confirmed" | "cancelled" | "completed";
  transactionStatus: "pending" | "successful" | "failed";

  transactionId?: string;
  paymentMethod?: string;
  paymentExpiresAt: string;

  consultationPlanId: {
    consultationPlanId: number;
    name: string;
    amount: number;
  } | null;

  timeSlotId: {
    timeSlotId: number;
    label: string;
    startTime: string;
    endTime: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) headers.set("x-session-id", sessionId);

      return headers;
    },
  }),
  tagTypes: ["Booking", "TimeSlot"],
  endpoints: (builder) => ({
    getConsultationPlans: builder.query<ConsultationPlan[], void>({
      query: () => "/consultation-plans",
    }),

    getAvailableTimeSlots: builder.query<TimeSlot[], string>({
      query: (date) => `/consultation-times?date=${date}`,
    }),

    getAllBookings: builder.query<AdminBooking[], void>({
      query: () => "/consultation-bookings/all",
      providesTags: ["Booking"],
    }),

    createBooking: builder.mutation<ConsultationBooking, CreateBookingPayload>({
      query: (body) => ({
        url: "/consultation-bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking", "TimeSlot"],
    }),

    getUserBookings: builder.query<UserBooking[], void>({
      query: () => "/consultation-bookings",

      providesTags: ["Booking"],
    }),

    cancelBooking: builder.mutation<void, string>({
      query: (bookingId) => ({
        url: `/consultation-bookings/${bookingId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Booking", "TimeSlot"],
    }),
    confirmPayment: builder.mutation<
      void,
      {
        bookingId: string;
        transactionId: string;
        paymentMethodId: string;
      }
    >({
      query: ({ bookingId, ...body }) => ({
        url: `/consultation-bookings/${bookingId}/confirm-payment`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Booking", "TimeSlot"],
    }),
    getBookingById: builder.query<AdminBooking, string>({
      query: (id) => `/consultation-bookings/${id}`,
      providesTags: ["Booking"],
    }),

    updateBookingStatus: builder.mutation<
      void,
      { bookingId: string; status: AdminBooking["status"] }
    >({
      query: ({ bookingId, status }) => ({
        url: `/consultation-bookings/${bookingId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Booking"],
    }),

    updateTransactionStatus: builder.mutation<
      void,
      {
        bookingId: string;
        transactionStatus: AdminBooking["transactionStatus"];
      }
    >({
      query: ({ bookingId, transactionStatus }) => ({
        url: `/consultation-bookings/${bookingId}/transaction-status`,
        method: "PATCH",
        body: { transactionStatus },
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useUpdateTransactionStatusMutation,
  useGetConsultationPlansQuery,
  useGetAvailableTimeSlotsQuery,
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useCancelBookingMutation,
  useGetAllBookingsQuery,
  useConfirmPaymentMutation,
} = bookingApi;
