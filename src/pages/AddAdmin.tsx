import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumbs";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useCreateAdminMutation,
} from "../services/adminApi.ts";

export default function AddAdmin() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    isSuperAdmin: false,
    otp: "",
  });

  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [createAdmin] = useCreateAdminMutation();

  async function handleSendOtp() {
    await sendOtp({
      channel: "email",
      email: form.email,
    }).unwrap();
    setStep("otp");
  }

  async function handleVerifyAndCreate() {
    await verifyOtp({
      channel: "email",
      email: form.email,
      otp: form.otp,
    }).unwrap();
    await createAdmin({
      firstname: form.firstname,
      lastname: form.lastname,
      email: form.email,
      password: form.password,
      isSuperAdmin: form.isSuperAdmin,
    }).unwrap();
    toast.success("Admin created successfully");
    navigate("/admin-accounts");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <section className="mt-16 md:ml-64 p-6 max-w-xl">
          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Add New Admin
          </h1>
          <Breadcrumb
            items={[
              { label: "Admin Accounts", onClick: () => navigate("/admin-accounts") },
              { label: "Add Admin" },
            ]}
          />

          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            {step === "form" && (
              <>
                <input
                  placeholder="First name"
                  className="border p-3 rounded-lg w-full"
                  onChange={(e) =>
                    setForm({ ...form, firstname: e.target.value })
                  }
                />
                <input
                  placeholder="Last name"
                  className="border p-3 rounded-lg w-full"
                  onChange={(e) =>
                    setForm({ ...form, lastname: e.target.value })
                  }
                />
                <input
                  placeholder="Email"
                  className="border p-3 rounded-lg w-full"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <div className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-sm text-pink-700">
                  Verification is via email OTP only.
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="border p-3 rounded-lg w-full"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                <button
                  onClick={handleSendOtp}
                  className="bg-pink-700 w-full py-3 rounded-lg text-white font-semibold hover:bg-pink-600"
                >
                  Send OTP
                </button>
              </>
            )}

            {step === "otp" && (
              <>
                <input
                  placeholder="Enter OTP"
                  className="border p-3 rounded-lg w-full"
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                />
                <button
                  onClick={handleVerifyAndCreate}
                  className="bg-pink-700 w-full py-3 rounded-lg text-white font-semibold hover:bg-pink-600"
                >
                  Verify & Create Admin
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
