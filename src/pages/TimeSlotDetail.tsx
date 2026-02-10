import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import toast from "react-hot-toast";
import {
  useGetConsultationTimeSlotsQuery,
  useUpdateConsultationTimeSlotMutation,
  useDeleteConsultationTimeSlotMutation,
} from "../services/consultationTimeSlotApi";
export function TimeSlotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: slots = [] } = useGetConsultationTimeSlotsQuery();
  const slot = slots.find((s) => s.timeSlotId === Number(id));

  const [form, setForm] = useState({
    startTime: slot?.startTime || "",
    endTime: slot?.endTime || "",
    label: slot?.label || "",
  });

  const [updateSlot] = useUpdateConsultationTimeSlotMutation();
  const [deleteSlot] = useDeleteConsultationTimeSlotMutation();

  useEffect(() => {
    if (slot) {
      setForm({
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: slot.label,
      });
    }
  }, [slot]);

  if (!slot) return <p className="p-6">Time slot not found</p>;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSlot({ timeSlotId: slot.timeSlotId, data: form });
    toast.success("Time slot updated!");
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this time slot?")) {
      await deleteSlot(slot.timeSlotId);
      navigate("/consultation-management");
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
          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Time Slot Detail
          </h1>
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
              className="p-3 border rounded-lg w-full mb-4 focus:border-pink-700"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Label"
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
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
