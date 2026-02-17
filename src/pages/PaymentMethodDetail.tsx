import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import LoginPopup from "../components/LoginPopup.tsx";
import ConfirmModal from "../components/ConfirmModal.tsx";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getErrorMessage } from "../getErrorMessage";
import {
  useGetPaymentMethodsQuery,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useChangePaymentMethodStatusMutation,
} from "../services/paymentMethodApi";

export default function PaymentMethodDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  const { data: methods = [], isLoading } = useGetPaymentMethodsQuery();
  const method = methods.find((item) => item._id === id);

  const [form, setForm] = useState({ name: "", details: "" });

  const [updatePaymentMethod, { isLoading: isUpdating }] =
    useUpdatePaymentMethodMutation();
  const [deletePaymentMethod, { isLoading: isDeleting }] =
    useDeletePaymentMethodMutation();
  const [changeStatus, { isLoading: isToggling }] =
    useChangePaymentMethodStatusMutation();

  useEffect(() => {
    if (method) {
      setForm({ name: method.name, details: method.details });
    }
  }, [method]);

  if (!id) return <div className="p-6">Payment method not found.</div>;
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!method) return <div className="p-6">Payment method not found.</div>;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePaymentMethod({
        id: method._id,
        name: form.name,
        details: form.details,
      }).unwrap();
      toast.success("Payment method updated.");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) {
        setShowLogin(true);
        return;
      }
      toast.error(getErrorMessage(err, "Failed to update payment method."));
    }
  };

  const handleDelete = async () => {
    try {
      await deletePaymentMethod(method._id).unwrap();
      toast.success("Payment method deleted.");
      navigate("/payment-methods");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) {
        setShowLogin(true);
        return;
      }
      toast.error(getErrorMessage(err, "Failed to delete payment method."));
    }
  };

  const handleToggleStatus = async () => {
    try {
      await changeStatus({ id: method._id, isActive: !method.isActive }).unwrap();
      toast.success("Payment method status updated.");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) {
        setShowLogin(true);
        return;
      }
      toast.error(getErrorMessage(err, "Failed to update status."));
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

        <section className="mt-16 md:ml-64 flex-1 p-6">
          <h1 className="text-2xl font-semibold text-pink-700 mb-4">
            Payment Method Details
          </h1>
          <Breadcrumb
            items={[
              { label: "Payment Methods", onClick: () => navigate("/payment-methods") },
              { label: method.name },
            ]}
          />

          <div className="bg-white p-6 rounded-2xl shadow max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <button
                  onClick={() => setIsStatusConfirmOpen(true)}
                  disabled={isToggling}
                  className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm text-white ${
                    method.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  {method.isActive ? "Active" : "Deactivated"}
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Details
                </label>
                <textarea
                  value={form.details}
                  onChange={(e) =>
                    setForm({ ...form, details: e.target.value })
                  }
                  rows={4}
                  className="border rounded-lg px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-pink-700 text-white font-semibold py-2 px-4 rounded-xl hover:bg-pink-600 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="bg-red-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      <ConfirmModal
        isOpen={isStatusConfirmOpen}
        title="Change Payment Method Status"
        message={`Are you sure you want to ${
          method.isActive ? "deactivate" : "activate"
        } this payment method?`}
        confirmText={method.isActive ? "Deactivate" : "Activate"}
        onCancel={() => setIsStatusConfirmOpen(false)}
        onConfirm={async () => {
          await handleToggleStatus();
          setIsStatusConfirmOpen(false);
        }}
        isLoading={isToggling}
      />
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
