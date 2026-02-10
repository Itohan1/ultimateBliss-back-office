import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Aside from "../components/Aside";
import LoginPopup from "../components/LoginPopup.tsx";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getErrorMessage } from "../getErrorMessage.ts";
import {
  useGetLearnByIdQuery,
  useUpdateLearnMutation,
} from "../services/learnApi";
import { useNavigate } from "react-router-dom";

export default function LearnDetail() {
  const [showLogin, setShowLogin] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [preview, setPreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: learn, isLoading } = useGetLearnByIdQuery(id!);
  const [updateLearn, { isLoading: isSaving }] = useUpdateLearnMutation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: null as File | null,
  });

  useEffect(() => {
    if (learn) {
      setForm({
        title: learn.title,
        description: learn.description,
        image: null,
      });
    }
  }, [learn]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);

      await updateLearn({ id: id!, data: formData }).unwrap();
      toast.success("Updated successfully");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;

      if ("status" in error && error.status === 401) {
        setShowLogin(true);
      } else {
        toast.error(getErrorMessage(err, "Failed to update transaction"));
      }
    }
  };

  if (isLoading) return <p>Loading...</p>;

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

        <section className="mt-16 md:ml-64 p-6 max-w-3xl">
          <Breadcrumb
            items={[
              { label: "Learn", onClick: () => navigate("/learn") },
              { label: "Details" },
            ]}
          />

          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Edit Learn Content
          </h1>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <input
              className="w-full border px-3 py-2 rounded-lg"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              rows={5}
              className="w-full border px-3 py-2 rounded-lg"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            {(preview || learn?.image) && (
              <img
                src={
                  preview
                    ? preview
                    : `http://localhost:5000/uploads/${learn?.image}`
                }
                className="w-full max-h-64 object-cover rounded-lg"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;

                setForm({ ...form, image: file });

                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
              className="w-full border px-3 py-2 rounded-lg"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-pink-700 text-white rounded-lg disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>
        {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      </main>
    </div>
  );
}
