import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Trash2, Plus } from "lucide-react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import Input from "../components/Input";
import {
  useGetCategoryQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} from "../services/categoryApi";
import type { Subcategory } from "../types/category";
import {
  useGetConsultationTimeSlotsQuery,
  useUpdateConsultationTimeSlotMutation,
  useDeleteConsultationTimeSlotMutation,
} from "../services/consultationTimeSlotApi";

export default function CategoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // API hooks
  const { data: category, isLoading, refetch } = useGetCategoryQuery(id!);
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [addSubcategory] = useAddSubcategoryMutation();
  const [updateSubcategory] = useUpdateSubcategoryMutation();
  const [deleteSubcategory] = useDeleteSubcategoryMutation();

  // Local state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive ?? true,
      });
      setSubcategories(
        category.subcategories.map((sub) => ({
          ...sub,
          subId: sub.subId, // preserve numeric ID
        }))
      );
    }
  }, [category]);

  /* ---------------- Handlers ---------------- */
  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;
    let value: string | boolean;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      value = target.checked; // ✅ now TypeScript knows checked exists
    } else {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      value = target.value;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubcategoryChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setSubcategories((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [name]: type === "checkbox" ? checked : value,
      };
      return updated;
    });
  };

  const handleAddSubcategory = () => {
    setSubcategories((prev) => [
      { name: "", description: "", isActive: true },
      ...prev,
    ]);
  };

  const handleSaveCategory = async () => {
    await updateCategory({ id: id!, data: formData }).unwrap();
    refetch();
  };

  const handleSaveSubcategory = async (index: number, subId?: number) => {
    const sub = subcategories[index];
    if (subId !== undefined) {
      await updateSubcategory({
        categoryId: id!,
        subcategoryId: subId,
        data: sub,
      }).unwrap();
    } else {
      await addSubcategory({ categoryId: id!, data: sub }).unwrap();
    }
    refetch();
  };

  const handleRemoveSubcategory = async (index: number, subId?: number) => {
    try {
      if (subId !== undefined) {
        await deleteSubcategory({
          categoryId: id!,
          subcategoryId: subId,
        }).unwrap();
      }
      setSubcategories((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
    }
  };

  const handleDeleteCategory = async () => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id!).unwrap();
      navigate("/categories");
    }
  };

  /* ---------------- UI ---------------- */
  if (isLoading) return <p className="p-6">Loading...</p>;

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
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-2xl font-semibold text-pink-700">
              Category Details
            </h1>
            <button
              onClick={handleDeleteCategory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Category
            </button>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              {
                label: "Inventory Categories",
                onClick: () => navigate("/categories"),
              },
              { label: category?.name || "Category Details" },
            ]}
          />

          {/* Category Form */}
          <section className="bg-white rounded-2xl p-6 shadow mt-6">
            <h2 className="text-lg font-semibold mb-4 text-pink-700">
              Category Information
            </h2>

            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleCategoryChange}
              placeholder="Enter category name"
              className="input"
            />

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleCategoryChange}
              placeholder="Enter description"
              className="input mt-4"
            />

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCategoryChange}
              />
              <span className="text-gray-700">Active</span>
            </div>

            <button
              onClick={handleSaveCategory}
              className="mt-4 px-4 py-2 bg-green-600 text-white flex justify-center items-center rounded-lg hover:bg-green-700"
            >
              <Save size={16} /> Save Category
            </button>
          </section>

          {/* Subcategories */}
          <section className="bg-white rounded-2xl p-6 shadow mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-pink-700">
                Subcategories
              </h2>
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="flex items-center gap-1 text-pink-600 hover:underline"
              >
                <Plus size={16} /> Add Subcategory
              </button>
            </div>

            {subcategories.map((sub, idx) => (
              <div key={sub.subId || idx} className="border rounded p-4 mb-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label="Subcategory Name"
                    name="name"
                    value={sub.name}
                    onChange={(e) => handleSubcategoryChange(idx, e)}
                    placeholder="Subcategory Name"
                    className="input"
                  />

                  <Input
                    label="Description"
                    name="description"
                    value={sub.description}
                    onChange={(e) => handleSubcategoryChange(idx, e)}
                    placeholder="Description"
                    className="input"
                  />

                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={sub.isActive}
                      onChange={(e) => handleSubcategoryChange(idx, e)}
                    />
                    <span className="text-gray-700">Active</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSaveSubcategory(idx, sub.subId)}
                    className="px-4 py-2 bg-green-600 text-white flex justify-center items-center rounded-lg hover:bg-green-700"
                  >
                    <Save size={16} /> Save
                  </button>

                  <button
                    onClick={() => handleRemoveSubcategory(idx, sub.subId)}
                    className="px-4 flex justify-center items-center py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}
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
    alert("Time slot updated!");
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
