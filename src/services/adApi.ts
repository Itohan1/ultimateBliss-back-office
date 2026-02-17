import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface TextAd {
  _id: string;
  text: string;
  createdBy: string;
}

export interface ImageAd {
  _id: string;
  url: string;
  filename: string;
  createdBy: string;
}

export const adApi = createApi({
  reducerPath: "adApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1/ads`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) headers.set("x-session-id", sessionId);

      return headers;
    },
  }),
  tagTypes: ["TextAd", "ImageAd"],
  endpoints: (builder) => ({
    // ---------------- TEXT ADS ----------------
    getTextAds: builder.query<TextAd[], void>({
      query: () => "/text",
      providesTags: ["TextAd"],
    }),
    createTextAd: builder.mutation<TextAd, { text: string }>({
      query: (body) => ({
        url: "/text",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TextAd"],
    }),
    deleteTextAd: builder.mutation<void, string>({
      query: (id) => ({
        url: `/text/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TextAd"],
    }),

    // ---------------- IMAGE ADS ----------------
    getImageAds: builder.query<ImageAd[], void>({
      query: () => "/image",
      providesTags: ["ImageAd"],
    }),
    createImageAd: builder.mutation<ImageAd, FormData>({
      query: (body) => ({
        url: "/image",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ImageAd"],
    }),
    deleteImageAd: builder.mutation<void, string>({
      query: (id) => ({
        url: `/image/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ImageAd"],
    }),
  }),
});

export const {
  useGetTextAdsQuery,
  useCreateTextAdMutation,
  useDeleteTextAdMutation,
  useGetImageAdsQuery,
  useCreateImageAdMutation,
  useDeleteImageAdMutation,
} = adApi;
