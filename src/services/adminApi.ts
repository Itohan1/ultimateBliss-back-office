import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ================= TYPES ================= */

export interface Admin {
  _id: string;
  adminId: string;
  firstname: string;
  lastname: string;
  email: string;
  isSuperAdmin: boolean;
  isActive: boolean; // ✅ ADD THIS
  lastLogin?: string;
}

interface CreateAdminPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isSuperAdmin?: boolean;
}

interface UpdateCurrentAdminPayload {
  firstname: string;
  lastname: string;
  email: string;
}

interface ChangeAdminPasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SendOtpPayload {
  email?: string;
  phone?: string;
  channel?: "email" | "whatsapp";
}

interface VerifyOtpPayload {
  email?: string;
  phone?: string;
  channel?: "email" | "whatsapp";
  otp: string;
}

/* ================= API ================= */

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Admin"],

  endpoints: (builder) => ({
    /* -------- GET ALL ADMINS -------- */
    getAdmins: builder.query<Admin[], void>({
      query: () => "/admins",
      providesTags: ["Admin"],
    }),

    /* -------- CREATE ADMIN -------- */
    createAdmin: builder.mutation<Admin, CreateAdminPayload>({
      query: (body) => ({
        url: "/admins",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),

    /* -------- DELETE ADMIN -------- */
    deleteAdmin: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admins/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),
    /* -------- GET CURRENT ADMIN -------- */
    getCurrentAdmin: builder.query<Admin, void>({
      query: () => "/admins/me",
      providesTags: ["Admin"],
    }),

    updateCurrentAdmin: builder.mutation<
      { message: string; admin: Admin },
      UpdateCurrentAdminPayload
    >({
      query: (body) => ({
        url: "/admins/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),

    changeCurrentAdminPassword: builder.mutation<
      { message: string },
      ChangeAdminPasswordPayload
    >({
      query: (body) => ({
        url: "/admins/me/password",
        method: "PATCH",
        body,
      }),
    }),

    /* -------- SEND OTP -------- */
    sendOtp: builder.mutation<{ message: string }, SendOtpPayload>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    /* -------- VERIFY OTP -------- */
    verifyOtp: builder.mutation<{ message: string }, VerifyOtpPayload>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
  }),
});

/* ================= EXPORT HOOKS ================= */

export const {
  useGetCurrentAdminQuery,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useUpdateCurrentAdminMutation,
  useChangeCurrentAdminPasswordMutation,
} = adminApi;
