import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useCreateReturnItemMutation } from "../services/returnApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { toast } from "react-hot-toast";
import LoginPopup from "../components/LoginPopup.tsx";
import { useGetCategoriesQuery } from "../services/categoryApi";
import { inventoryApi, useGetInventoryItemsQuery } from "../services/inventoryApi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";

export default function AddDamagedReturn() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [createReturnItem, { isLoading }] = useCreateReturnItemMutation();
  const [showLogin, setShowLogin] = useState(false);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: products = [] } = useGetInventoryItemsQuery();

  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const availableSubcategories =
    categories.find((c) => c._id === selectedCategory?.id)?.subcategories || [];

  const availableProducts = products.filter(
    (p) =>
      selectedCategory &&
      selectedSubcategory &&
      p.category === selectedCategory.name &&
      p.subcategory === selectedSubcategory.name,
  );

  /* ================= STATE ================= */
  const [form, setForm] = useState({
    type: "",
    quantity: 1,
    contactName: "",
    contactPhone: "",
    contactAddress: "",
    reason: "",
    adjustInventory: false, // ✅ NEW
  });

  const [image, setImage] = useState<File | null>(null);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (
        !selectedCategory ||
        !selectedSubcategory ||
        !selectedProduct ||
        !form.type ||
        !form.contactName ||
        !form.contactPhone ||
        !form.contactAddress ||
        !form.quantity ||
        !form.reason
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const data = new FormData();

      data.append("type", form.type);

      data.append("contact[name]", form.contactName);
      data.append("contact[phone]", form.contactPhone);
      data.append("contact[address]", form.contactAddress);

      data.append("product[productId]", String(selectedProduct.id));
      data.append("product[productName]", selectedProduct.name);

      data.append("product[category][categoryId]", selectedCategory.id);
      data.append("product[category][categoryName]", selectedCategory.name);

      data.append(
        "product[subcategory][subcategoryId]",
        String(selectedSubcategory.id),
      );
      data.append(
        "product[subcategory][subcategoryName]",
        selectedSubcategory.name,
      );

      data.append("product[quantity]", String(form.quantity));
      data.append("reason", form.reason);
      data.append("adjustInventory", String(form.adjustInventory));

      if (image) data.append("image", image);

      await createReturnItem(data).unwrap();
      dispatch(inventoryApi.util.invalidateTags(["Inventory"]));
      toast.success("Damaged/Return item has been recorded");
      navigate("/inventory/returns");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  /* ================= UI ================= */
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
            Add Damaged / Return Item
          </h1>

          <Breadcrumb
            items={[
              {
                label: "Returned Items",
                onClick: () => navigate("/inventory/returns"),
              },
              { label: "Add Returned Item" },
            ]}
          />

          <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mt-4">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Product ID */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={selectedCategory?.id || ""}
                  onChange={(e) => {
                    const category = categories.find(
                      (c) => c._id === e.target.value,
                    );
                    setSelectedCategory(
                      category
                        ? { id: category._id!, name: category.name }
                        : null,
                    );
                    setSelectedSubcategory(null);
                    setSelectedProduct(null);
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Subcategory</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  disabled={!selectedCategory}
                  value={selectedSubcategory?.id || ""}
                  onChange={(e) => {
                    const sub = availableSubcategories.find(
                      (s) => s.subId === Number(e.target.value),
                    );
                    setSelectedSubcategory(
                      sub ? { id: sub.subId!, name: sub.name } : null,
                    );
                    setSelectedProduct(null);
                  }}
                >
                  <option value="">Select subcategory</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.subId} value={sub.subId}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Product</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  disabled={!selectedSubcategory}
                  value={selectedProduct?.id || ""}
                  onChange={(e) => {
                    const product = availableProducts.find(
                      (p) => p.productId === Number(e.target.value),
                    );
                    setSelectedProduct(
                      product
                        ? { id: product.productId, name: product.productName }
                        : null,
                    );
                  }}
                >
                  <option value="">Select product</option>
                  {availableProducts.map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName}
                    </option>
                  ))}
                </select>
              </div>
              {/* Type */}
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={(e) => {
                    const value = e.target.value;

                    setForm((prev) => ({
                      ...prev,
                      type: value,
                      adjustInventory:
                        value === "damaged"
                          ? true
                          : value === "supplier_return"
                            ? prev.adjustInventory
                            : false,
                    }));
                  }}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select type</option>
                  <option value="damaged">Damaged</option>
                  <option value="supplier_return">Supplier Return</option>
                  <option value="customer_return">Customer Return</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="text-sm font-medium">Contact Name</label>
                <input
                  name="contactName"
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <input
                  name="contactPhone"
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Contact Address</label>
                <input
                  name="contactAddress"
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="md:col-span-2 flex flex-col items-center gap-3">
                {form.type === "supplier_return" && (
                  <div className="md:col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="adjustInventory"
                      checked={form.adjustInventory}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <label className="text-sm font-medium">
                      Adjust inventory stock for this return
                    </label>
                  </div>
                )}
                {form.type === "damaged" && (
                  <p className="text-sm text-red-500">
                    (Damaged Items quantity will automatically be subtracted from
                    iventory)
                  </p>
                )}
              </div>

              {/* Image */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="mt-1 w-full"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Reason / Notes</label>
                <textarea
                  name="reason"
                  rows={3}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/inventory/returns")}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-pink-600 text-white px-5 py-2 rounded-xl shadow hover:bg-pink-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
