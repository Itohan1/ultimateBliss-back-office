import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    role: string;
  };
}

export const adminLoginApi = createApi({
  reducerPath: "adminLoginApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1/admins`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    adminLogin: builder.mutation<AdminLoginResponse, AdminLoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useAdminLoginMutation } = adminLoginApi;
