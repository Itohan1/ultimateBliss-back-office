import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Trash2, Plus } from "lucide-react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import Input from "../components/Input";
import ConfirmModal from "../components/ConfirmModal.tsx";
import { toast } from "react-hot-toast";
import {
  useGetCategoryQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} from "../services/categoryApi";
import type { Subcategory } from "../types/category";
import { getErrorMessage } from "../getErrorMessage";

export default function CategoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // API hooks
  const {
    data: category,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCategoryQuery(id!);
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
  const [pendingDelete, setPendingDelete] = useState<
    | { type: "category" }
    | { type: "subcategory"; index: number; subId?: number }
    | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    try {
      await updateCategory({ id: id!, data: formData }).unwrap();
      toast.success("Category updated successfully");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update category"));
    }
  };

  const handleSaveSubcategory = async (index: number, subId?: number) => {
    const sub = subcategories[index];
    try {
      if (subId !== undefined) {
        await updateSubcategory({
          categoryId: id!,
          subcategoryId: subId,
          data: sub,
        }).unwrap();
        toast.success("Subcategory updated successfully");
      } else {
        await addSubcategory({ categoryId: id!, data: sub }).unwrap();
        toast.success("Subcategory added successfully");
      }
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save subcategory"));
    }
  };

  const handleRemoveSubcategory = (index: number, subId?: number) => {
    setPendingDelete({ type: "subcategory", index, subId });
  };

  const handleDeleteCategory = () => {
    setPendingDelete({ type: "category" });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      if (pendingDelete.type === "category") {
        await deleteCategory(id!).unwrap();
        navigate("/categories");
        return;
      }

      if (pendingDelete.subId !== undefined) {
        await deleteSubcategory({
          categoryId: id!,
          subcategoryId: pendingDelete.subId,
        }).unwrap();
      }
      setSubcategories((prev) =>
        prev.filter((_, i) => i !== pendingDelete.index),
      );
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete item"));
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (isLoading) return <p className="p-6">Loading...</p>;
  if (isError)
    return <p className="p-6">{getErrorMessage(error, "Failed to load category details")}</p>;

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
      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={
          pendingDelete?.type === "category"
            ? "Delete Category"
            : "Delete Subcategory"
        }
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
