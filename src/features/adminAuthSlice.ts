import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { RootState } from "../store";

interface Admin {
  adminId: string;
  email: string;
  role: string;
}

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  token: localStorage.getItem("adminToken"),
};

export const fetchAdminProfile = createAsyncThunk<
  Admin, // ✅ return type
  void, // ✅ argument type
  {
    state: RootState; // ✅ getState type
    rejectValue: string;
  }
>("adminAuth/fetchProfile", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().adminAuth.token;

    if (!token) {
      return rejectWithValue("No auth token");
    }

    const res = await axios.get<Admin>(
      `${import.meta.env.VITE_API_URL}/api/v1/admins/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return res.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;

    return rejectWithValue(
      err.response?.data?.message ?? "Failed to fetch admin",
    );
  }
});

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAdminCredentials: (
      state,
      action: PayloadAction<{ admin: Admin; token: string }>,
    ) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      localStorage.setItem("adminToken", action.payload.token);
    },

    adminLogout: (state) => {
      state.admin = null;
      state.token = null;
      localStorage.removeItem("adminToken");
    },
  },
});

export const { setAdminCredentials, adminLogout } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
