import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Aside from "../components/Aside.tsx";
import Header from "../components/Header.tsx";

export default function UserManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const users = [
    {
      id: 1,
      name: "Rexter",
      email: "rexop89727@besenica.com",
      status: "Unknown",
      joined: "02/12/2025",
      lastLogin: "02/12/2025",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane@example.com",
      status: "Active",
      joined: "01/12/2025",
      lastLogin: "02/12/2025",
    },
    {
      id: 3,
      name: "Michael Lee",
      email: "mlee@example.com",
      status: "Suspended",
      joined: "20/11/2025",
      lastLogin: "01/12/2025",
    },
    {
      id: 4,
      name: "Sarah Smith",
      email: "smith.sarah@example.com",
      status: "Active",
      joined: "18/11/2025",
      lastLogin: "30/11/2025",
    },
  ];

  const itemsPerPage = 3;
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
            User Management
          </h1>

          {/* Search Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow w-full md:w-1/3">
              <Search size={18} className="text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full outline-none bg-transparent"
                placeholder="Search by name"
              />
            </div>

            <select className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-40">
              <option>All</option>
              <option>Active</option>
              <option>Suspended</option>
              <option>Unknown</option>
            </select>

            <input
              type="date"
              className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-48"
            />
          </div>

          {/* User Table */}
          <div className="bg-white p-5 rounded-2xl shadow">
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Login
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr
                    onClick={() => navigate(`/user/${user.id}`)}
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.joined}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.lastLogin}
                    </td>
                  </tr>
                ))}
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
