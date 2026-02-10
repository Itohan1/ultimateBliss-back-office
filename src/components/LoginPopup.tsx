import { useState } from "react";
import { useAdminLoginMutation } from "../services/adminLoginApi";
import { useDispatch } from "react-redux";
import { setAdminCredentials } from "../features/adminAuthSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../getErrorMessage";
export default function LoginPopup({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const handleLogin = async () => {
    try {
      const response = await adminLogin({ email, password }).unwrap();

      dispatch(
        setAdminCredentials({
          token: response.token,
          admin: response.admin,
        })
      );

      onClose();
      window.location.reload();
    } catch (err) {
      let errorMessage = "Invalid credentials";

      if ((err as FetchBaseQueryError)?.data) {
        const data = (err as FetchBaseQueryError).data as {
          message?: string;
        };

        errorMessage = data.message ?? errorMessage;
        toast.error(getErrorMessage(data.message, errorMessage));
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded-lg outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded-lg outline-none"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-pink-700 text-white hover:bg-pink-600 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
