import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface Learn {
  _id: string;
  title: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export const learnApi = createApi({
  reducerPath: "learnApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Learn"],
  endpoints: (builder) => ({
    getAllLearn: builder.query<Learn[], void>({
      query: () => "/learn",
      providesTags: ["Learn"],
    }),

    getLearnById: builder.query<Learn, string>({
      query: (id) => `/learn/${id}`,
    }),

    createLearn: builder.mutation<Learn, FormData>({
      query: (body) => ({
        url: "/learn",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Learn"],
    }),

    updateLearn: builder.mutation<Learn, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/learn/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Learn"],
    }),

    deleteLearn: builder.mutation<void, string>({
      query: (id) => ({
        url: `/learn/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Learn"],
    }),
  }),
});

export const {
  useGetAllLearnQuery,
  useGetLearnByIdQuery,
  useUpdateLearnMutation,
  useCreateLearnMutation,
  useDeleteLearnMutation,
} = learnApi;
