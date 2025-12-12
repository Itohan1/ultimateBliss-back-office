import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BookingManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const bookings = [
    {
      id: 1,
      name: "Rexter Sun",
      email: "rexter@example.com",
      phone: "09023456789",
      plan: "Premium Glow Package",
      price: "₦12,000",
      date: "06/12/2025",
      time: "1:00 PM - 2:00 PM",
      created: "03/12/2025",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "janedoe@gmail.com",
      phone: "08123456789",
      plan: "Basic Skin Consultation",
      price: "₦3,000",
      date: "05/12/2025",
      time: "11:00 AM - 12:00 PM",
      created: "02/12/2025",
      status: "Completed",
    },
    {
      id: 3,
      name: "Michael Lee",
      email: "michael@example.com",
      phone: "07099887766",
      plan: "Advanced Skin Consultation",
      price: "₦7,000",
      date: "01/12/2025",
      time: "3:00 PM - 4:00 PM",
      created: "30/11/2025",
      status: "Expired",
    },
  ];

  function calculateDaysRemaining(dateString: string): number {
    // Convert dd/mm/yyyy format to proper date
    const [day, month, year] = dateString.split("/").map(Number);
    const bookingDate = new Date(year, month - 1, day);
    const today = new Date();

    const diffTime = bookingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  const itemsPerPage = 5;
  const filtered = bookings.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  {
    /*const statusColors: Record<string, string> = {
    Active: "bg-green-500",
    Completed: "bg-blue-500",
    Due: "bg-yellow-500",
    Expired: "bg-red-600",
    Deactivated: "bg-gray-500",
  };*/
  }

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
            Booking Management
          </h1>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow w-full md:w-1/3">
              <Search size={18} className="text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full outline-none bg-transparent"
                placeholder="Search by name..."
              />
            </div>

            <select className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-40">
              <option>All</option>
              <option>Active</option>
              <option>Due</option>
              <option>Completed</option>
              <option>Expired</option>
              <option>Deactivated</option>
            </select>

            <input
              type="date"
              className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-48"
            />
          </div>

          {/* Table */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>*/}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>*/}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Schedule Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Days Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>*/}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginated.map((b) => {
                  const daysRemaining = calculateDaysRemaining(b.date);

                  return (
                    <tr
                      key={b.id}
                      onClick={() => navigate(`/booking/${b.id}`)}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{b.name}</td>
                      {/*<td className="px-6 py-4 whitespace-nowrap">{b.email}</td>*/}
                      <td className="px-6 py-4 whitespace-nowrap">{b.phone}</td>
                      <td className="px-6 py-4 flex flex-col whitespace-nowrap">
                        <span>{b.plan}</span>
                        <span>{b.price}</span>
                      </td>
                      {/*<td className="px-6 py-4 whitespace-nowrap">{b.price}</td>*/}
                      <td className="px-6 py-4 whitespace-nowrap">{b.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.time}</td>

                      {/* Days Remaining */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {daysRemaining > 0 ? (
                          <span className="text-green-600 font-semibold">
                            {daysRemaining} days
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            Expired
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {b.created}
                      </td>

                      {/*<td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-xl text-white ${
                            statusColors[b.status] || "bg-gray-500"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>*/}
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
