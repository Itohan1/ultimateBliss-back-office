import { X } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal.tsx";
import { useCreateLearnMutation } from "../services/learnApi";
import { useState } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import LoginPopup from "../components/LoginPopup.tsx";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import {
  useGetAllLearnQuery,
  useDeleteLearnMutation,
} from "../services/learnApi";

export default function LearnManagement() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: learns, isLoading } = useGetAllLearnQuery();
  const [deleteLearn] = useDeleteLearnMutation();
  const [showLogin, setShowLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [createLearn, { isLoading: isCreating }] = useCreateLearnMutation();

  const [form, setForm] = useState<{
    title: string;
    description: string;
    image: File | null;
  }>({
    title: "",
    description: "",
    image: null,
  });

  const handleCreate = async () => {
    try {
      if (!form.title || !form.description) return;

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);

      if (form.image) {
        formData.append("image", form.image);
      }

      await createLearn(formData).unwrap();

      setForm({ title: "", description: "", image: null });
      setIsAddOpen(false);
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  const itemsPerPage = 5;

  const filtered = learns?.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = filtered ? Math.ceil(filtered.length / itemsPerPage) : 0;

  const displayed = filtered?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    await deleteLearn(selectedId).unwrap();
    setIsConfirmOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <section className="mt-16 md:ml-64 p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-semibold text-pink-700">
              Learn Management
            </h1>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-pink-700 text-white rounded-lg"
            >
              + Add Learn Content
            </button>
          </div>

          <Breadcrumb items={[{ label: "Learn" }]} />
          {isAddOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4"
                >
                  <X />
                </button>

                <h2 className="text-xl font-semibold text-pink-700 mb-4">
                  Add Learn Content
                </h2>

                <div className="space-y-4">
                  <input
                    className="w-full border px-3 py-2 rounded-lg"
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />

                  <textarea
                    className="w-full border px-3 py-2 rounded-lg"
                    placeholder="Description"
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          image: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsAddOpen(false)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="px-4 py-2 bg-pink-700 text-white rounded-lg disabled:opacity-50"
                    >
                      {isCreating ? "Saving..." : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <input
            className="border px-3 py-2 rounded-lg my-4 w-full md:w-1/3"
            placeholder="Search learn content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="bg-white rounded-2xl shadow p-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="min-w-full">
                    <thead className="bg-pink-100">
                      <tr>
                        <th className="px-4 py-2">Title</th>
                        <th className="px-4 py-2">Created</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayed?.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{item.title}</td>
                          <td className="px-4 py-2">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <div className="group relative inline-block">
                              <MoreVertical />
                              <div className="absolute right-0 hidden group-hover:block bg-white shadow rounded-lg w-36">
                                <button
                                  onClick={() => navigate(`/learn/${item._id}`)}
                                  className="flex items-center gap-2 px-4 py-2 w-full"
                                >
                                  <Eye size={16} /> View
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(item._id)}
                                  className="flex items-center gap-2 px-4 py-2 w-full text-red-600"
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 md:hidden">
                  {displayed?.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/learn/${item._id}`)}
                          className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item._id)}
                          className="rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
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
        isOpen={isConfirmOpen}
        title="Delete Learn Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
