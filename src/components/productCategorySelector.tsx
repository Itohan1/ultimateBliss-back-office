import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCategoriesQuery } from "../services/categoryApi";
import type { Subcategory } from "../types/category.ts"; // adjust path

interface ProductCategorySelectorProps {
  formData: {
    category: string;
    subcategory: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // <-- add this
}

export default function ProductCategorySelector({
  formData,
  handleChange,
}: ProductCategorySelectorProps) {
  const navigate = useNavigate();
  const { data: categories } = useGetCategoriesQuery();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Update subcategories when category changes
  useEffect(() => {
    const selectedCategory = categories?.find(
      (cat) => cat._id === selectedCategoryId
    );
    setSubcategories(selectedCategory?.subcategories || []);
    handleChange({
      target: { name: "subcategory", value: "" },
    } as React.ChangeEvent<HTMLSelectElement>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, categories]);

  return (
    <div className="flex flex-col gap-2">
      {/* Category Select */}
      <select
        name="category"
        value={selectedCategoryId}
        onChange={(e) => {
          const categoryId = e.target.value;
          setSelectedCategoryId(categoryId);

          const selectedCategory = categories?.find(
            (cat) => cat._id === categoryId
          );
          handleChange({
            target: { name: "category", value: selectedCategory?.name || "" },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
        className="input"
      >
        <option value="">Select Category</option>
        {categories?.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => navigate("/categories/add")}
        className="text-pink-600 text-sm hover:underline"
      >
        + Add new category
      </button>

      {/* Subcategory Select */}
      <select
        name="subcategory"
        value={formData.subcategory}
        onChange={handleChange}
        className="input mt-2"
        disabled={!subcategories.length}
      >
        <option value="">Select Subcategory</option>
        {subcategories.map((subcat) => (
          <option key={subcat.subId} value={subcat.name}>
            {subcat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
