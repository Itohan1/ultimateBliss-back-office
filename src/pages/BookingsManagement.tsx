import { useState } from "react";
import { Search } from "lucide-react";
import Aside from "../components/Aside.tsx";
import Header from "../components/Header.tsx";
import { EllipsisVertical } from "lucide-react";
import type { AdminBooking } from "../services/bookingApi.ts";
import { useGetAllBookingsQuery } from "../services/bookingApi.ts";
import { useGetUsersQuery } from "../services/authApi.ts";

export default function Bookings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "pending" | "confirmed" | "cancelled" | "completed"
  >("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: users } = useGetUsersQuery();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetAllBookingsQuery();
  const bookings: AdminBooking[] = data ?? [];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading bookings</div>;

  const getTimeToBooking = (date: string, startTime?: string) => {
    if (!startTime) return "—";

    // Extract just YYYY-MM-DD from date string
    const dateOnly = date.split("T")[0];

    // Combine date + startTime
    const bookingDateTime = new Date(`${dateOnly}T${startTime}:00`);
    const now = new Date();

    const diffMs = bookingDateTime.getTime() - now.getTime();

    if (diffMs < 0) return "Expired";
    if (diffMs === 0) return "Started";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const itemsPerPage = 5;

  /* ------------------ Filters ------------------ */
  const filteredBookings = bookings.filter((booking) => {
    const planName = booking.consultationPlanId?.name ?? "";
    const slotLabel = booking.timeSlotId?.label ?? "";

    const matchesSearch =
      planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slotLabel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;

    const matchesDate = !dateFilter || booking.date.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  /* ------------------ Pagination ------------------ */
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

        <section className="mt-16 md:ml-64 p-6">
          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Consultation Bookings
          </h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow w-full md:w-1/3">
              <Search size={18} className="text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full outline-none bg-transparent"
                placeholder="Search by plan or time slot"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value as
                    | "All"
                    | "pending"
                    | "confirmed"
                    | "cancelled"
                    | "completed",
                );
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-48"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-48"
            />
          </div>

          {/* Bookings Table */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time To Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booking Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedBookings.map((booking) => {
                  const user = users?.find((u) => u.userId === booking.userId);

                  // Colors for booking status
                  const statusColors: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-800",
                    confirmed: "bg-blue-100 text-blue-800",
                    cancelled: "bg-red-100 text-red-800",
                    completed: "bg-green-100 text-green-800",
                  };

                  // Colors for transaction status
                  const transactionColors: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-800",
                    successful: "bg-green-100 text-green-800",
                    failed: "bg-red-100 text-red-800",
                  };

                  return (
                    <tr key={booking._id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user
                          ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() ||
                            "—"
                          : "—"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.timeSlotId?.label ?? "—"}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(booking.date).toLocaleDateString("en-GB")}
                      </td>

                      <td className="px-6 py-4 flex flex-col whitespace-nowrap">
                        <span>{booking.consultationPlanId?.name ?? "—"}</span>
                        <span>
                          {booking.consultationPlanId
                            ? `₦${booking.consultationPlanId.amount}`
                            : "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTimeToBooking(
                          booking.date,
                          booking.timeSlotId?.startTime,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            statusColors[booking.status] ??
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            transactionColors[booking.transactionStatus] ??
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.transactionStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right relative">
                        {/* Ellipsis button */}
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === booking._id
                                  ? null
                                  : booking._id,
                              )
                            }
                            className="text-gray-500 hover:text-gray-800 font-bold text-xl"
                          >
                            <EllipsisVertical />
                          </button>

                          {/* Dropdown menu */}
                          {/* Dropdown menu */}
                          {openDropdownId === booking._id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-lg z-10">
                              <a
                                href={`/bookings/${booking._id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Details
                              </a>
                              <button
                                disabled
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-not-allowed hover:bg-gray-100"
                              >
                                Delete Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                Prev
              </button>

              <span className="font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
