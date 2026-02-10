import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Save, Plus } from "lucide-react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import Input from "../components/Input";
import { useAddCategoryMutation } from "../services/categoryApi.ts"; // your frontend API

interface SubcategoryForm {
  name: string;
  description: string;
  isActive: boolean;
}

export default function AddCategory() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [addCategory, { isLoading }] = useAddCategoryMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    subcategories: [] as SubcategoryForm[],
  });

  /* ---------------- Handlers ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;

    if (type === "checkbox") {
      // TypeScript knows e.target is HTMLInputElement
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      setFormData((prev) => ({ ...prev, [name]: target.value }));
    }
  };

  const handleSubcategoryChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    setFormData((prev) => {
      const updatedSubs = [...prev.subcategories];

      const key = target.name as keyof SubcategoryForm;

      if (
        key === "isActive" &&
        target instanceof HTMLInputElement &&
        target.type === "checkbox"
      ) {
        updatedSubs[index][key] = target.checked;
      } else if (key === "name" || key === "description") {
        updatedSubs[index][key] = target.value;
      }

      return { ...prev, subcategories: updatedSubs };
    });
  };

  const addSubcategory = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        { name: "", description: "", isActive: true },
      ],
    }));
  };

  const removeSubcategory = (index: number) => {
    setFormData((prev) => {
      const updatedSubs = prev.subcategories.filter((_, i) => i !== index);
      return { ...prev, subcategories: updatedSubs };
    });
  };

  const handleSubmit = async () => {
    try {
      await addCategory(formData).unwrap();
      navigate("/categories");
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  /* ---------------- UI ---------------- */
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-pink-700">
              Add New Category
            </h1>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={18} />
                {isLoading ? "Saving..." : "Save Category"}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 flex items-center gap-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Inventory", onClick: () => navigate("/inventory") },
              {
                label: "Inventory Categories",
                onClick: () => navigate("/categories"),
              },
              { label: "Add Category" },
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
              onChange={handleChange}
              placeholder="Enter category name"
              className="input"
            />

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description"
              className="input mt-4"
            />

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span className="text-gray-700">Active</span>
            </div>
          </section>

          {/* Subcategories */}
          <section className="bg-white rounded-2xl p-6 shadow mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-pink-700">
                Subcategories
              </h2>
              <button
                type="button"
                onClick={addSubcategory}
                className="flex items-center gap-1 text-pink-600 hover:underline"
              >
                <Plus size={16} /> Add Subcategory
              </button>
            </div>

            {formData.subcategories.map((sub, idx) => (
              <div key={idx} className="border rounded p-4 mb-4">
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
                    placeholder="Subcategory Description"
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

                <button
                  type="button"
                  onClick={() => removeSubcategory(idx)}
                  className="mt-2 text-red-600 hover:underline text-sm"
                >
                  Remove Subcategory
                </button>
              </div>
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}
