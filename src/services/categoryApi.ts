// src/services/categoryApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { Category, Subcategory } from "../types/category";

// Types for requests
interface AddCategoryRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  subcategories?: Subcategory[];
}

interface UpdateCategoryRequest {
  id: string;
  data: Partial<AddCategoryRequest>;
}

interface AddSubcategoryRequest {
  categoryId: string;
  data: Subcategory;
}

interface UpdateSubcategoryRequest {
  categoryId: string;
  subcategoryId: string | number; // allow numeric IDs
  data: Partial<Subcategory>;
}

interface DeleteSubcategoryRequest {
  categoryId: string;
  subcategoryId: string | number;
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).adminAuth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    /* ---------------- Categories ---------------- */
    getCategories: builder.query<Category[], { includeInactive?: boolean } | void>({
      query: (params) => {
        if (params?.includeInactive) {
          return "/categories?includeInactive=true";
        }
        return "/categories";
      },
      providesTags: ["Category"],
    }),
    getCategory: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: ["Category"],
    }),
    addCategory: builder.mutation<Category, AddCategoryRequest>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<Category, UpdateCategoryRequest>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    /* ---------------- Subcategories ---------------- */
    addSubcategory: builder.mutation<Category, AddSubcategoryRequest>({
      query: ({ categoryId, data }) => ({
        url: `/categories/${categoryId}/subcategories`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateSubcategory: builder.mutation<Category, UpdateSubcategoryRequest>({
      query: ({ categoryId, subcategoryId, data }) => ({
        url: `/categories/${categoryId}/subcategories/${subcategoryId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteSubcategory: builder.mutation<Category, DeleteSubcategoryRequest>({
      query: ({ categoryId, subcategoryId }) => ({
        url: `/categories/${categoryId}/subcategories/${subcategoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

/* ---------------- Exports ---------------- */
export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = categoryApi;
