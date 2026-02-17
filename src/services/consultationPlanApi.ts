import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store"; // 👈 adjust path if needed

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Type for a consultation plan
export interface ConsultationPlan {
  consultationPlanId: number;
  name: string;
  description: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export const consultationPlanApi = createApi({
  reducerPath: "consultationPlanApi",
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
  tagTypes: ["ConsultationPlan"],
  endpoints: (builder) => ({
    getConsultationPlans: builder.query<ConsultationPlan[], void>({
      query: () => "/consultation-plans",
      providesTags: ["ConsultationPlan"],
    }),

    addConsultationPlan: builder.mutation<
      ConsultationPlan,
      Partial<Omit<ConsultationPlan, "consultationplanId">>
    >({
      query: (body) => ({
        url: "/consultation-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ConsultationPlan"],
    }),

    updateConsultationPlan: builder.mutation<
      ConsultationPlan,
      {
        consultationplanId: number;
        data: Partial<Omit<ConsultationPlan, "consultationplanId">>;
      }
    >({
      query: ({ consultationplanId, data }) => ({
        url: `/consultation-plans/${consultationplanId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ConsultationPlan"],
    }),

    deleteConsultationPlan: builder.mutation<ConsultationPlan, number>({
      query: (consultationplanId) => ({
        url: `/consultation-plans/${consultationplanId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ConsultationPlan"],
    }),
  }),
});

export const {
  useGetConsultationPlansQuery,
  useAddConsultationPlanMutation,
  useDeleteConsultationPlanMutation,
  useUpdateConsultationPlanMutation,
} = consultationPlanApi;
