import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import toast from "react-hot-toast";
import {
  useGetConsultationTimeSlotsQuery,
  useUpdateConsultationTimeSlotMutation,
  useDeleteConsultationTimeSlotMutation,
} from "../services/consultationTimeSlotApi";
import ConfirmModal from "../components/ConfirmModal.tsx";

const to12Hour = (time24: string) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

const buildLabel = (startTime: string, endTime: string) =>
  startTime && endTime ? `${to12Hour(startTime)} - ${to12Hour(endTime)}` : "";

const toMinutes = (time24: string) => {
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
};

export function TimeSlotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data: slots = [] } = useGetConsultationTimeSlotsQuery();
  const slot = slots.find((s) => s.timeSlotId === Number(id));

  const [form, setForm] = useState({
    startTime: slot?.startTime || "",
    endTime: slot?.endTime || "",
  });

  const [updateSlot] = useUpdateConsultationTimeSlotMutation();
  const [deleteSlot, { isLoading: isDeleting }] =
    useDeleteConsultationTimeSlotMutation();

  useEffect(() => {
    if (slot) {
      setForm({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }
  }, [slot]);

  if (!slot) return <p className="p-6">Time slot not found</p>;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (toMinutes(form.endTime) <= toMinutes(form.startTime)) {
      toast.error("End time must be later than start time");
      return;
    }

    const payload = {
      ...form,
      label: buildLabel(form.startTime, form.endTime),
    };

    await updateSlot({ timeSlotId: slot.timeSlotId, data: payload });
    toast.success("Time slot updated!");
  };

  const handleDelete = async () => {
    await deleteSlot(slot.timeSlotId);
    setIsConfirmOpen(false);
    navigate("/consultation");
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
          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Time Slot Detail
          </h1>
          <Breadcrumb
            items={[
              {
                label: "Consultation",
                onClick: () => navigate("/consultation"),
              },
              { label: "Time Slot Detail" },
            ]}
          />
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded-2xl shadow max-w-lg"
          >
            <input
              type="time"
              className="p-3 border rounded-lg w-full mb-4 focus:border-pink-700"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
            <input
              type="time"
              className="p-3 border rounded-lg w-full mb-4 focus:border-pink-700"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
            <input
              className="p-3 border rounded-lg w-full mb-4 bg-gray-50 text-gray-600"
              value={buildLabel(form.startTime, form.endTime)}
              placeholder="Auto-generated label"
              readOnly
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
        title="Delete Time Slot"
        message="Are you sure you want to delete this time slot? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
