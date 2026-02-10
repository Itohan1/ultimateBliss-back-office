import { useState, useEffect, useRef } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { EllipsisVertical, Trash2, Eye } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import {
  useGetConsultationPlansQuery,
  useAddConsultationPlanMutation,
  useDeleteConsultationPlanMutation,
} from "../services/consultationPlanApi.ts";
//useUpdateConsultationPlanMutation,
import LoginPopup from "../components/LoginPopup.tsx";
import {
  useGetConsultationTimeSlotsQuery,
  useAddConsultationTimeSlotMutation,
  useDeleteConsultationTimeSlotMutation,
  //useUpdateConsultationTimeSlotMutation,
} from "../services/consultationTimeSlotApi.ts";

export default function ConsultationManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openPlanDropdown, setOpenPlanDropdown] = useState<number | null>(null);
  const [openSlotDropdown, setOpenSlotDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /** Consultation Plan Form */
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    amount: "",
  });
  const {
    data: plans = [],
    isLoading: plansLoading,
    refetch: refetchPlans,
  } = useGetConsultationPlansQuery();
  const [addPlan] = useAddConsultationPlanMutation();
  const navigate = useNavigate();
  const [deletePlan] = useDeleteConsultationPlanMutation();
  //const [updatePlan] = useUpdateConsultationPlanMutation();

  /** Time Slot Form */
  const [timeForm, setTimeForm] = useState({
    startTime: "",
    endTime: "",
  });

  const { data: timeSlots = [], isLoading: timeLoading } =
    useGetConsultationTimeSlotsQuery();
  //refetch: refetchTimes,
  const [addTimeSlot] = useAddConsultationTimeSlotMutation();
  const [deleteTimeSlot] = useDeleteConsultationTimeSlotMutation();
  //const [updateTimeSlot] = useUpdateConsultationTimeSlotMutation();

  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenPlanDropdown(null);
        setOpenSlotDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPlan({
        ...planForm,
        amount: Number(planForm.amount), // convert to number here
      }).unwrap();
      setPlanForm({ name: "", description: "", amount: "" }); // reset as string
      //refetchPlans();
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  const handleTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const label = `${timeForm.startTime} - ${timeForm.endTime}`;

      await addTimeSlot({
        startTime: timeForm.startTime,
        endTime: timeForm.endTime,
        label,
      }).unwrap();

      setTimeForm({ startTime: "", endTime: "" });
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  if (plansLoading || timeLoading) return <p className="p-6">Loading...</p>;

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
            Consultation Management
          </h1>

          {/* Add Consultation Plan */}
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="text-lg font-semibold text-pink-700 mb-4">
              Add Consultation Plan
            </h2>
            <form
              onSubmit={handlePlanSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <input
                value={planForm.name}
                onChange={(e) =>
                  setPlanForm({ ...planForm, name: e.target.value })
                }
                placeholder="Plan Name"
                className="p-3 border rounded-lg focus:border-pink-700"
                required
              />
              <input
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
                placeholder="Description"
                className="p-3 border rounded-lg focus:border-pink-700"
                required
              />
              <input
                type="number"
                value={planForm.amount}
                onChange={
                  (e) => setPlanForm({ ...planForm, amount: e.target.value }) // keep as string
                }
                placeholder="Amount (₦)"
                className="p-3 border rounded-lg focus:border-pink-700"
                required
              />
              <button
                type="submit"
                className="bg-pink-700 text-white font-semibold py-3 rounded-xl hover:bg-pink-600 col-span-1 md:col-span-3"
              >
                Add Plan
              </button>
            </form>
          </div>

          {/* Add Time Slot */}
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="text-lg font-semibold text-pink-700 mb-4">
              Add Time Slot
            </h2>
            <form
              onSubmit={handleTimeSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <input
                type="time"
                value={timeForm.startTime}
                onChange={(e) =>
                  setTimeForm({ ...timeForm, startTime: e.target.value })
                }
                className="p-3 border rounded-lg focus:border-pink-700"
                required
              />

              <input
                type="time"
                value={timeForm.endTime}
                onChange={(e) =>
                  setTimeForm({ ...timeForm, endTime: e.target.value })
                }
                className="p-3 border rounded-lg focus:border-pink-700"
                required
              />

              <button
                type="submit"
                className="bg-pink-700 text-white font-semibold py-3 rounded-xl hover:bg-pink-600"
              >
                Add Slot
              </button>
            </form>
          </div>

          {/* Plans Table */}
          <div className="bg-white p-4 rounded-2xl shadow mb-8 overflow-x-auto">
            <h2 className="text-lg font-semibold text-pink-700 mb-4">
              Consultation Plans
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan, idx) => (
                  <tr key={plan.consultationPlanId}>
                    <td className="px-6 py-4">{plan.name}</td>
                    <td className="px-6 py-4">{plan.description}</td>
                    <td className="px-6 py-4">₦{plan.amount}</td>
                    <td className="px-6 py-4 text-right relative">
                      <div
                        className="cursor-pointer text-gray-500 hover:text-pink-600 inline-block"
                        onClick={() =>
                          setOpenPlanDropdown(
                            openPlanDropdown === idx ? null : idx
                          )
                        }
                      >
                        <EllipsisVertical />
                      </div>
                      {openPlanDropdown === idx && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-8 w-40 bg-white border rounded-xl shadow-lg z-10"
                        >
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              navigate(
                                `/consultationplan-detail/${plan.consultationPlanId}`
                              );
                              console.log("View plan", plan.consultationPlanId);
                            }}
                          >
                            <Eye size={16} /> View details
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            onClick={async () => {
                              await deletePlan(plan.consultationPlanId);
                              refetchPlans();
                              setOpenPlanDropdown(null);
                            }}
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

          {/* Time Slots Table */}
          <div className="bg-white p-4 rounded-2xl shadow overflow-x-auto">
            <h2 className="text-lg font-semibold text-pink-700 mb-4">
              Time Slots
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Slot
                  </th>*/}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Label
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeSlots.map((slot, idx) => (
                  <tr key={slot.timeSlotId}>
                    <td className="px-6 py-4">{slot.startTime}</td>
                    <td className="px-6 py-4">{slot.endTime}</td>
                    <td className="px-6 py-4">{slot.label}</td>
                    <td className="px-6 py-4 text-right relative">
                      <div
                        className="cursor-pointer text-gray-500 hover:text-pink-600 inline-block"
                        onClick={() =>
                          setOpenSlotDropdown(
                            openSlotDropdown === idx ? null : idx
                          )
                        }
                      >
                        <EllipsisVertical />
                      </div>
                      {openSlotDropdown === idx && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-8 w-40 bg-white border rounded-xl shadow-lg z-10"
                        >
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              navigate(`/timeslot-detail/${slot.timeSlotId}`);
                              console.log("View Time Slot", slot.timeSlotId);
                            }}
                          >
                            <Eye size={16} /> View details
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            onClick={async () => {
                              await deleteTimeSlot(slot.timeSlotId);
                              //refetchTimes();
                              setOpenSlotDropdown(null);
                            }}
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
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
