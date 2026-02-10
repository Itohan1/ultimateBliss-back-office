import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { User } from "../types/user.ts";
import type {
  RegisterUserRequest,
  RegisterUserResponse,
} from "../types/auth.ts";
import type { UpdateUserRequest } from "../types/userUpdate.ts";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/auth",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.adminAuth.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // ✅ GET ALL USERS
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    // ✅ GET SINGLE USER
    getUser: builder.query<User, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: ["Users"],
    }),

    // ✅ REGISTER USER
    registerUser: builder.mutation<RegisterUserResponse, RegisterUserRequest>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    // ✅ EDIT USER
    editUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    // ✅ DELETE USER
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useRegisterUserMutation,
  useEditUserMutation,
  useDeleteUserMutation,
} = api;
