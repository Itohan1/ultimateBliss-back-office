import { useParams } from "react-router-dom";
import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import LoginPopup from "../components/LoginPopup.tsx";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../getErrorMessage.ts";
import { Breadcrumb } from "../components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import {
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useUpdateTransactionStatusMutation,
} from "../services/bookingApi";
import { useGetUsersQuery } from "../services/authApi";

import type { AdminBooking } from "../services/bookingApi";

type BookingStatus = AdminBooking["status"];
type TransactionStatus = AdminBooking["transactionStatus"];

export default function BookingDetails() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: booking, isLoading } = useGetBookingByIdQuery(bookingId!);
  const { data: users } = useGetUsersQuery();

  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [updateTransactionStatus] = useUpdateTransactionStatusMutation();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    type: "booking" | "transaction";
    value: string;
  } | null>(null);

  if (isLoading || !booking) return <div>Loading...</div>;
  const user = users?.find((u) => u.userId === booking.userId);

  // Color mapping for statuses
  const bookingColor = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const transactionColor = {
    pending: "bg-yellow-100 text-yellow-800",
    successful: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  const handleChange = (type: "booking" | "transaction", value: string) => {
    setPendingChange({ type, value });
    setModalOpen(true);
  };

  const confirmChange = async () => {
    try {
      if (!pendingChange) return;

      if (pendingChange.type === "booking") {
        await updateBookingStatus({
          bookingId: booking._id,
          status: pendingChange.value as BookingStatus,
        }).unwrap();
        toast.success("Booking status has been updated successfully");
      } else {
        await updateTransactionStatus({
          bookingId: booking._id,
          transactionStatus: pendingChange.value as TransactionStatus,
        }).unwrap();
        toast.success(
          "Booking Transaction-status has been updated successfully",
        );
      }

      setModalOpen(false);
      setPendingChange(null);
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;

      if ("status" in error && error.status === 401) {
        setShowLogin(true);
      } else {
        toast.error(getErrorMessage(err, "Failed to update booking status"));
      }
    }
  };

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

        <section className="mt-16 md:ml-64 p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-pink-700">
            Booking Details
          </h1>
          <Breadcrumb
            items={[
              { label: "Bookings", onClick: () => navigate("/bookings") },
              { label: "Booking Details" },
            ]}
          />

          {/* User Info */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-semibold mb-3">User Information</h2>
            <p>
              <strong>Name:</strong>{" "}
              {user ? `${user.firstname ?? ""} ${user.lastname ?? ""}` : "—"}
            </p>
            <p>
              <strong>Email:</strong> {user?.email ?? "—"}
            </p>
          </div>

          {/* Booking Info */}
          <div className="bg-white rounded-2xl shadow p-5 grid md:grid-cols-2 gap-4">
            <p>
              <strong>Plan:</strong> {booking.consultationPlanId?.name}
            </p>
            <p>
              <strong>Amount:</strong> ₦{booking.consultationPlanId?.amount}
            </p>
            <p>
              <strong>Time Slot:</strong> {booking.timeSlotId?.label} (
              {booking.timeSlotId?.startTime} - {booking.timeSlotId?.endTime})
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(booking.date).toLocaleDateString("en-GB")}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(booking.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(booking.updatedAt).toLocaleString()}
            </p>
          </div>

          {/* Status Controls */}
          <div className="bg-white rounded-2xl shadow p-5 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Booking Status</label>
              <select
                value={booking.status}
                onChange={(e) => handleChange("booking", e.target.value)}
                className={`border rounded-xl px-3 py-2 w-full ${bookingColor[booking.status]}`}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">
                Transaction Status
              </label>
              <select
                value={booking.transactionStatus}
                onChange={(e) => handleChange("transaction", e.target.value)}
                className={`border rounded-xl px-3 py-2 w-full ${transactionColor[booking.transactionStatus]}`}
              >
                <option value="pending">Pending</option>
                <option value="successful">Successful</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Confirmation Modal */}
        {modalOpen && pendingChange && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-lg space-y-4">
              <h2 className="text-lg font-semibold text-pink-700">
                Confirm Status Change
              </h2>
              <p>
                Are you sure you want to change the{" "}
                {pendingChange.type === "booking" ? "booking" : "transaction"}{" "}
                status to <strong>{pendingChange.value}</strong>? You may not be
                able to switch back.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmChange}
                  className="px-4 py-2 bg-pink-700 text-white rounded-xl"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      </main>
    </div>
  );
}
