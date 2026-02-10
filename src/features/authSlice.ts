import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/user.ts";

interface AuthState {
  token: string | null;
  user: User | null;
}

/* --- hydrate from localStorage --- */
const storedAuth = localStorage.getItem("auth");

let parsedAuth: AuthState | null = null;

if (storedAuth) {
  try {
    parsedAuth = JSON.parse(storedAuth) as AuthState;
  } catch {
    parsedAuth = null;
  }
}

const initialState: AuthState = parsedAuth ?? {
  token: null,
  user: null,
};

/* --- slice --- */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      // persist
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: action.payload.token,
          user: action.payload.user,
        })
      );
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
