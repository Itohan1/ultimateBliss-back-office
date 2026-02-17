import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Type for a consultation time slot
export interface ConsultationTimeSlot {
  timeSlotId: number;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  label: string; // "9:00 AM - 10:00 AM"
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const consultationTimeSlotApi = createApi({
  reducerPath: "consultationTimeSlotApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["ConsultationTimeSlot"],
  endpoints: (builder) => ({
    getConsultationTimeSlots: builder.query<ConsultationTimeSlot[], void>({
      query: () => "/consultation-times/all",
      providesTags: ["ConsultationTimeSlot"],
    }),
    addConsultationTimeSlot: builder.mutation<
      ConsultationTimeSlot,
      Partial<Omit<ConsultationTimeSlot, "timeSlotId">>
    >({
      query: (body) => ({
        url: "/consultation-times",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ConsultationTimeSlot"],
    }),
    updateConsultationTimeSlot: builder.mutation<
      ConsultationTimeSlot,
      {
        timeSlotId: number;
        data: Partial<Omit<ConsultationTimeSlot, "timeSlotId">>;
      }
    >({
      query: ({ timeSlotId, data }) => ({
        url: `/consultation-times/${timeSlotId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ConsultationTimeSlot"],
    }),
    deleteConsultationTimeSlot: builder.mutation<ConsultationTimeSlot, number>({
      query: (timeSlotId) => ({
        url: `/consultation-times/${timeSlotId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ConsultationTimeSlot"],
    }),
  }),
});

export const {
  useGetConsultationTimeSlotsQuery,
  useAddConsultationTimeSlotMutation,
  useDeleteConsultationTimeSlotMutation,
  useUpdateConsultationTimeSlotMutation,
} = consultationTimeSlotApi;
