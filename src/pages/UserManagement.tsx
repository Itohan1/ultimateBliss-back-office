import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Aside from "../components/Aside.tsx";
import { useGetUsersQuery } from "../services/authApi.ts";
import Header from "../components/Header.tsx";

export default function UserManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Suspended"
  >("All");
  const [dateFilter, setDateFilter] = useState<string>("");

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading users</div>;

  const itemsPerPage = 3;
  /*const filteredUsers = (users ?? []).filter((u) =>
    `${u.firstname ?? ""} ${u.lastname ?? ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())      
  );*/

  const filteredUsers = (users ?? []).filter((u) => {
    const matchesName = `${u.firstname ?? ""} ${u.lastname ?? ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      u.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesDate =
      !dateFilter ||
      u.datejoined?.startsWith(dateFilter) ||
      u.lastlogin?.startsWith(dateFilter);

    return matchesName && matchesStatus && matchesDate;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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

        <section className="mt-16 md:ml-64 p-2 sm:p-6">
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

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value as "All" | "Active" | "Suspended",
                );
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-40"
            >
              <option>All</option>
              <option>Active</option>
              <option>Suspended</option>
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

          {/* User Table */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <div className="hidden md:block">
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
                  {paginatedUsers.map((user, index) => (
                    <tr
                      onClick={() => navigate(`/user/${user.userId}`)}
                      key={`${user.userId}-${index}`}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.firstname} {user.lastname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.status}
                      </td>
                      <td className="px-6 py-4">{user.datejoined}</td>
                      <td className="px-6 py-4">{user.lastlogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {paginatedUsers.length ? (
                paginatedUsers.map((user, index) => (
                  <button
                    type="button"
                    onClick={() => navigate(`/user/${user.userId}`)}
                    key={`${user.userId}-${index}`}
                    className="w-full rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
                  >
                    <p className="font-semibold text-gray-900">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Status:</span>{" "}
                      {user.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      Joined: {user.datejoined}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last login: {user.lastlogin}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">No users found.</p>
              )}
            </div>

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
                className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700"
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
