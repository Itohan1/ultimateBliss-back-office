import { useState, useEffect, useRef } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { EllipsisVertical, Trash2, Edit3, Plus } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useChangePaymentMethodStatusMutation,
} from "../services/paymentMethodApi";
import LoginPopup from "../components/LoginPopup.tsx";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import toast from "react-hot-toast";

export default function PaymentMethods() {
  const token = useSelector((state: RootState) => state.adminAuth.token);

  const { data: methods = [], isLoading } = useGetPaymentMethodsQuery(
    undefined,
    {
      skip: !token,
    }
  );

  const [createPaymentMethod] = useCreatePaymentMethodMutation();
  const [updatePaymentMethod] = useUpdatePaymentMethodMutation();
  const [deletePaymentMethod] = useDeletePaymentMethodMutation();
  const [changeStatus] = useChangePaymentMethodStatusMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [newMethod, setNewMethod] = useState({ name: "", details: "" });
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  if (isLoading) return <p className="p-6">Loading payment methods...</p>;

  const handleCreate = async () => {
    try {
      await createPaymentMethod(newMethod).unwrap();
      setNewMethod({ name: "", details: "" });
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  const handleUpdate = async (
    id: string,
    updatedData: { name: string; details: string }
  ) => {
    try {
      await updatePaymentMethod({ id, ...updatedData }).unwrap();
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePaymentMethod(id).unwrap();
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      await changeStatus({ id, isActive: !isActive }).unwrap();
      toast.success("Payment method status has been updated successfully");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  if (isLoading) return <p className="p-6">Loading payment methods...</p>;
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

        <section className="mt-16 md:ml-64 flex-1 p-6">
          <h1 className="text-2xl font-semibold text-pink-700 mb-4">
            Payment Methods
          </h1>

          {/* Add Payment Method */}
          {/* Add Payment Method */}
          <div className="bg-white p-4 rounded-2xl shadow mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Add Payment Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank Transfer"
                  value={newMethod.name}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, name: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Details
                </label>
                <textarea
                  placeholder="Account number, instructions, etc."
                  value={newMethod.details}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, details: e.target.value })
                  }
                  rows={3}
                  className="border rounded-lg px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-pink-700 px-5 py-2 rounded-lg text-white font-semibold hover:bg-pink-600 transition"
              >
                <Plus size={16} />
                Add Method
              </button>
            </div>
          </div>
          <div className="bg-white overflow-x-auto p-4 rounded-2xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {methods.map((method, idx) => (
                  <tr key={method._id}>
                    <td className="px-6 py-4">{method.name}</td>
                    <td className="px-6 py-4">{method.details}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-white ${
                          method.isActive ? "bg-green-500" : "bg-gray-400"
                        } cursor-pointer`}
                        onClick={() =>
                          toggleStatus(method._id, method.isActive)
                        }
                      >
                        {method.isActive ? "Active" : "Inactive"}
                      </span>
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
                          <button
                            onClick={() =>
                              handleUpdate(method._id, {
                                name: method.name,
                                details: method.details,
                              })
                            }
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                          >
                            <Edit3 size={16} /> Update
                          </button>
                          <button
                            onClick={() => handleDelete(method._id)}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
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
        </section>
      </main>

      {/* Login Popup */}
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
