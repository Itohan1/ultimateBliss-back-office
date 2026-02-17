import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Breadcrumb } from "../components/Breadcrumbs";
import {
  useGetConsultationPlansQuery,
  useUpdateConsultationPlanMutation,
  useDeleteConsultationPlanMutation,
} from "../services/consultationPlanApi";
import ConfirmModal from "../components/ConfirmModal.tsx";
import LoginPopup from "../components/LoginPopup.tsx";
import { getErrorMessage } from "../getErrorMessage.ts";

export function ConsultationPlanDetail() {
  const NAIRA = "\u20A6";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { data: plans = [], refetch } = useGetConsultationPlansQuery(
    undefined,
    { refetchOnMountOrArgChange: true },
  );
  const plan = plans.find((p) => p.consultationPlanId === Number(id));

  const [form, setForm] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    amount: plan?.amount || 0,
  });

  const [updatePlan] = useUpdateConsultationPlanMutation();
  const [deletePlan, { isLoading: isDeleting }] =
    useDeleteConsultationPlanMutation();

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
      });
    }
  }, [plan]);

  if (!plan) return <p className="p-6">Plan not found</p>;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePlan({
        consultationplanId: plan.consultationPlanId,
        data: form,
      }).unwrap();
      await refetch();
      toast.success("Plan updated!");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) {
        setShowLogin(true);
      } else {
        toast.error(getErrorMessage(err, "Failed to update plan"));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlan(plan.consultationPlanId).unwrap();
      setIsConfirmOpen(false);
      navigate("/consultation");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) {
        setShowLogin(true);
      } else {
        toast.error(getErrorMessage(err, "Failed to delete plan"));
      }
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
        <section className="mt-16 md:ml-64 flex-1 p-2 sm:p-6">
          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Consultation Plan Detail
          </h1>
          <Breadcrumb
            items={[
              {
                label: "Consultation",
                onClick: () => navigate("/consultation"),
              },
              { label: "Consultation Plan Detail" },
            ]}
          />
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded-2xl shadow max-w-lg"
          >
            <input
              className="p-3 border rounded-lg w-full mb-4 focus:border-pink-700"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Plan Name"
              required
            />
            <input
              className="p-3 border rounded-lg w-full mb-4 focus:border-pink-700"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              required
            />
            <input
              type="number"
              className="p-3 border rounded-lg w-full mb-4 focus:border-pink-700"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              placeholder={`Amount (${NAIRA})`}
              required
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-pink-700 text-white font-semibold py-2 px-4 rounded-xl hover:bg-pink-600"
              >
                Update
              </button>
              <button
                type="button"
                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-500"
                onClick={() => setIsConfirmOpen(true)}
              >
                Delete
              </button>
            </div>
          </form>
        </section>
      </main>
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Consultation Plan"
        message="Are you sure you want to delete this consultation plan? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
