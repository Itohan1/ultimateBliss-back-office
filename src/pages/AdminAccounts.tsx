import { useEffect, useRef, useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal.tsx";
import LoginPopup from "../components/LoginPopup.tsx";
import { EllipsisVertical, Trash2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../getErrorMessage";
import {
  useGetAdminsQuery,
  useDeleteAdminMutation,
} from "../services/adminApi.ts";

interface Admin {
  _id: string;
  adminId: string;
  firstname: string;
  lastname: string;
  email: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  lastLogin?: string;
}

export default function AdminAccounts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isConfirmStatusChange, setIsConfirmStatusChange] = useState(false);
  const { data: admins = [], isLoading, refetch } = useGetAdminsQuery();
  const [statusTarget, setStatusTarget] = useState<Admin | null>(null);

  const [deleteAdmin] = useDeleteAdminMutation();

  const handleConfirmStatusChange = async () => {
    try {
      console.log("This is the statusTarget", statusTarget);
      if (!statusTarget) return;

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/admins/${statusTarget._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ isActive: !statusTarget.isActive }),
        },
      );

      setIsConfirmStatusChange(false);
      setStatusTarget(null);
      refetch();
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;

      if ("status" in error && error.status === 401) {
        setShowLogin(true);
      } else {
        toast.error(getErrorMessage(err, "Failed to update transaction"));
      }
    }
  };

  /*const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };*/

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    await deleteAdmin(selectedId).unwrap;
    refetch();
    setOpenDropdown(null);
    setIsConfirmStatusChange(false);
    setSelectedId(null);
  };

  const filteredAdmins = admins.filter((a: Admin) => {
    const matchesSearch =
      a.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? a.isActive
          : !a.isActive;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <p className="p-6">Loading admins...</p>;

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

        <section className="mt-16 md:ml-64 flex-1 p-2 sm:p-6">
          <h1 className="text-2xl font-semibold text-pink-700 mb-4">
            Admin Accounts
          </h1>

          <button
            onClick={() => navigate("/admins/add")}
            className="bg-pink-700 rounded-lg px-4 py-3 font-semibold hover:bg-pink-600 text-white mb-6"
          >
            + Add Admin
          </button>

          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-lg w-1/3 outline-none"
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="border px-3 py-2 rounded-lg"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Deactivated</option>
              </select>
            </div>

            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Login
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredAdmins.map((admin: Admin, idx: number) => (
                    <tr key={admin._id}>
                      <td className="px-6 py-4">
                        {admin.firstname} {admin.lastname}
                      </td>
                      <td className="px-6 py-4">{admin.email}</td>
                      <td className="px-6 py-4">
                        {admin.isSuperAdmin ? (
                          <span className="flex items-center gap-1 text-pink-700 font-semibold">
                            <Shield size={14} /> Super Admin
                          </span>
                        ) : (
                          "Admin"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            admin.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleDateString()
                          : "--"}
                      </td>

                      <td className="px-6 py-4 text-right relative">
                        <div
                          className="cursor-pointer text-gray-500 hover:text-pink-600 inline-block"
                          onClick={() =>
                            setOpenDropdown(openDropdown === idx ? null : idx)
                          }
                        >
                          <EllipsisVertical />
                        </div>

                        {openDropdown === idx && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-10 top-8 w-40 bg-white border rounded-xl shadow-lg z-10"
                          >
                            {/*<button
                            onClick={() => navigate(`/admins/${admin._id}`)}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                          >
                            <Eye size={16} /> View
                          </button>*/}
                            <button
                              onClick={() => {
                                setStatusTarget(admin);
                                setIsConfirmStatusChange(true);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            >
                              {admin.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              disabled
                              className="flex items-center gap-2 w-full px-4 py-2 text-red-600 opacity-50 cursor-not-allowed"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredAdmins.map((admin: Admin) => (
                <div
                  key={admin._id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <p className="font-semibold">
                    {admin.firstname} {admin.lastname}
                  </p>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Role: {admin.isSuperAdmin ? "Super Admin" : "Admin"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {admin.isActive ? "Active" : "Deactivated"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last Login:{" "}
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleDateString()
                      : "--"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setStatusTarget(admin);
                        setIsConfirmStatusChange(true);
                      }}
                      className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white"
                    >
                      {admin.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      disabled
                      className="rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-600 opacity-50 cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <ConfirmModal
          isOpen={isConfirmStatusChange}
          title={`${statusTarget?.isActive ? "Deactivate" : "Activate"} Admin`}
          message={`Are you sure you want to ${
            statusTarget?.isActive ? "deactivate" : "activate"
          } this admin?`}
          confirmText={statusTarget?.isActive ? "Deactivate" : "Activate"}
          onCancel={() => setIsConfirmStatusChange(false)}
          onConfirm={handleConfirmStatusChange}
        />
        <ConfirmModal
          isOpen={isConfirmOpen}
          title="Delete Learn Content"
          message="Are you sure you want to delete this content? This action cannot be undone."
          confirmText="Delete"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
        />
        {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      </main>
    </div>
  );
}
