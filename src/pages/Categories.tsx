import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../services/categoryApi";
import type { Category } from "../types/category.ts";
import ConfirmModal from "../components/ConfirmModal.tsx";

export default function CategoriesList() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: categories, isLoading } = useGetCategoriesQuery({
    includeInactive: true,
  });
  const [deleteCategory] = useDeleteCategoryMutation();
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Suspended"
  >("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteCategory(selectedDeleteId).unwrap();
      setSelectedDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories?.filter((cat: Category) => {
    const matchesCategoryName = cat.name
      .toLowerCase()
      .includes(filter.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (cat.isActive && statusFilter === "Active") ||
      (!cat.isActive && statusFilter === "Suspended");

    return matchesCategoryName && matchesStatus;
  });

  const totalPages = filteredCategories
    ? Math.ceil(filteredCategories.length / itemsPerPage)
    : 0;
  const displayedCategories = filteredCategories?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

        <section className="mt-16 md:ml-64 flex-1 p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-2xl font-semibold text-pink-700">
              Inventory Categories
            </h1>
            <button
              onClick={() => navigate("/categories/add")}
              className="px-4 py-2 bg-pink-700 text-white rounded-lg hover:bg-pink-600 cursor-pointer"
            >
              + Add Category
            </button>
          </div>

          <Breadcrumb
            items={[
              { label: "Inventory", onClick: () => navigate("/inventory") },
              { label: "Inventory Categories" },
            ]}
          />

          {/* Filters */}
          <div className="my-4 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search categories..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full md:w-1/3 outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value as "All" | "Active" | "Suspended"
                );
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded-xl bg-white shadow w-full md:w-40"
            >
              <option>All</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto sm:overflow-x-visible bg-white rounded-2xl shadow p-4">
            {isLoading ? (
              <p>Loading categories...</p>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="min-w-full table-auto">
                    <thead className="bg-pink-100 text-left text-gray-700">
                      <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Subcategories</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedCategories?.map((cat: Category) => (
                        <tr
                          key={cat._id ?? cat.name}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            if (cat._id) navigate(`/categories/${cat._id}`);
                          }}
                        >
                          <td className="px-4 py-2">{cat.name}</td>
                          <td className="px-4 py-2">{cat.description || "-"}</td>
                          <td className="px-4 py-2">
                            {cat.isActive ? "Active" : "Inactive"}
                          </td>
                          <td className="px-4 py-2">
                            {cat.subcategories?.map((sub) => sub.name).join(", ")}
                          </td>
                          <td className="px-4 py-2 relative">
                            <div className="group inline-block">
                              <MoreVertical size={20} className="cursor-pointer" />
                              <div className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-lg z-10 w-36">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cat._id) navigate(`/categories/${cat._id}`);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100"
                                >
                                  <Eye size={16} /> View
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cat._id) setSelectedDeleteId(cat._id);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-red-600"
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!displayedCategories?.length && (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            No categories found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 md:hidden">
                  {displayedCategories?.length ? (
                    displayedCategories.map((cat: Category) => (
                      <div
                        key={cat._id ?? cat.name}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <p className="font-semibold">{cat.name}</p>
                        <p className="text-sm text-gray-600">
                          {cat.description || "-"}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Status: {cat.isActive ? "Active" : "Inactive"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Subcategories:{" "}
                          {cat.subcategories?.map((sub) => sub.name).join(", ") ||
                            "-"}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() =>
                              cat._id && navigate(`/categories/${cat._id}`)
                            }
                            className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white"
                          >
                            View
                          </button>
                          <button
                            onClick={() => cat._id && setSelectedDeleteId(cat._id)}
                            className="rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4">No categories found</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 border rounded-lg hover:bg-gray-100 ${
                    currentPage === idx + 1 ? "bg-pink-200" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
      <ConfirmModal
        isOpen={selectedDeleteId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setSelectedDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
