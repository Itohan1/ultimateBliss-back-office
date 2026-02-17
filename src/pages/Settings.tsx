import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { getErrorMessage } from "../getErrorMessage";
import {
  useChangeCurrentAdminPasswordMutation,
  useGetCurrentAdminQuery,
  useUpdateCurrentAdminMutation,
} from "../services/adminApi";

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const adminToken = localStorage.getItem("adminToken");

  const { data: admin } = useGetCurrentAdminQuery(undefined, {
    skip: !adminToken,
  });

  const [updateCurrentAdmin, { isLoading: isUpdatingProfile }] =
    useUpdateCurrentAdminMutation();
  const [changeCurrentAdminPassword, { isLoading: isChangingPassword }] =
    useChangeCurrentAdminPasswordMutation();

  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!admin) return;
    setProfileForm({
      firstname: admin.firstname ?? "",
      lastname: admin.lastname ?? "",
      email: admin.email ?? "",
    });
  }, [admin]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !profileForm.firstname.trim() ||
      !profileForm.lastname.trim() ||
      !profileForm.email.trim()
    ) {
      toast.error("Firstname, lastname and email are required");
      return;
    }

    try {
      const response = await updateCurrentAdmin({
        firstname: profileForm.firstname.trim(),
        lastname: profileForm.lastname.trim(),
        email: profileForm.email.trim(),
      }).unwrap();
      toast.success(response.message || "Profile updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    try {
      const response = await changeCurrentAdminPassword(passwordForm).unwrap();
      toast.success(response.message || "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to change password"));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col w-full overflow-y-auto">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <section className="mt-16 md:ml-64 flex-1 p-3 md:p-6">
          <h1 className="mb-5 text-2xl font-semibold text-pink-700">Settings</h1>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <form
              onSubmit={handleProfileSubmit}
              className="rounded-2xl bg-white p-5 shadow"
            >
              <h2 className="mb-4 text-lg font-semibold">Profile Details</h2>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={profileForm.firstname}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      firstname: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={profileForm.lastname}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      lastname: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="mt-4 rounded-lg bg-pink-700 px-4 py-2 font-semibold text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>

            <form
              onSubmit={handlePasswordSubmit}
              className="rounded-2xl bg-white p-5 shadow"
            >
              <h2 className="mb-4 text-lg font-semibold">Change Password</h2>

              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="mt-4 rounded-lg bg-pink-700 px-4 py-2 font-semibold text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChangingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
