import LoginPopup from "../components/LoginPopup.tsx";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Aside from "../components/Aside";
import ConfirmModal from "../components/ConfirmModal.tsx";
import { Breadcrumb } from "../components/Breadcrumbs";
import Header from "../components/Header";
import {
  useGetReturnItemQuery,
  useDeleteReturnItemMutation,
  useUpdateReturnItemMutation,
} from "../services/returnApi";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../getErrorMessage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ReturnDetails() {
  const { id } = useParams<{ id: string }>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    type: "",
    quantity: 1,
    contactName: "",
    contactPhone: "",
    contactAddress: "",
    reason: "",
    adjustInventory: true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  const { data: item, isLoading } = useGetReturnItemQuery(id || "");
  const [deleteItem] = useDeleteReturnItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateReturnItemMutation();

  useEffect(() => {
    if (item) {
      setForm({
        type: item.type,
        quantity: item.product.quantity,
        contactName: item.contact.name,
        contactPhone: item.contact.phone,
        contactAddress: item.contact.address,
        reason: item.reason,
        adjustInventory: item.adjustInventory,
      });
      setShowImagePreview(item.image ? `${API_URL}${item.image}` : null);
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (!item) return;
    const data = new FormData();
    data.append("type", form.type);
    data.append("contact[name]", form.contactName);
    data.append("contact[phone]", form.contactPhone);
    data.append("contact[address]", form.contactAddress);
    data.append("product[quantity]", String(form.quantity));
    data.append("reason", form.reason);
    data.append("adjustInventory", String(form.adjustInventory));
    if (image) data.append("image", image);

    console.log("This is the update formdata", data);
    try {
      await updateItem({ id: item._id, data }).unwrap();
      toast.success("Return item updated successfully");
      navigate("/inventory/returns");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;

      if ("status" in error && error.status === 401) {
        setShowLogin(true);
        return;
      }

      toast.error(getErrorMessage(err, "Failed to update item"));
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!item) return;

    try {
      await deleteItem(item._id).unwrap();
      setIsConfirmOpen(false);
      toast.success("Return item deleted successfully");
      navigate("/inventory/returns");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;

      if ("status" in error && error.status === 401) {
        setShowLogin(true);
        return;
      }

      toast.error(getErrorMessage(err, "Failed to update item"));
    }
  };

  if (isLoading) return <p className="p-6">Loading item...</p>;

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

        <section className="mt-16 md:ml-64 flex-1 p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Return / Damaged Item Details
          </h1>

          <Breadcrumb
            items={[
              {
                label: "Returned Items",
                onClick: () => navigate("/inventory/returns"),
              },
              { label: "Damged/Returned-Item details" },
            ]}
          />
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Item Image</label>
              {showImagePreview && (
                <img
                  src={showImagePreview}
                  alt={form.contactName}
                  className="mt-2 w-32 h-32 object-cover rounded-lg border"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="mt-2 w-full"
              />
            </div>
            {/* Product Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  <option value="damaged">Damaged</option>
                  <option value="supplier_return">Supplier Return</option>
                  <option value="customer_return">Customer Return</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  disabled={form.adjustInventory}
                  min={1}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                {form.adjustInventory && (
                  <p className="mt-1 text-xs text-red-500">
                    Sorry, this product quantity has been subtracted from the
                    inventory. You can no longer update the quantity.
                  </p>
                )}
              </div>

              {/* Contact Details */}
              <div>
                <label className="text-sm font-medium">Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Contact Address</label>
                <input
                  type="text"
                  name="contactAddress"
                  value={form.contactAddress}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Adjust Inventory */}
              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="adjustInventory"
                  checked={form.adjustInventory}
                  disabled={form.adjustInventory === true}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                {form.adjustInventory ? (
                  <label className="text-sm font-medium text-red-500 ">
                    "Adjust Inventory" feature is disabled, this product
                    quantity has already been removed from inventory
                  </label>
                ) : (
                  <label className="text-sm font-medium">
                    Adjust Inventory
                  </label>
                )}
              </div>

              {/* Image */}

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Reason / Notes</label>
                <textarea
                  name="reason"
                  rows={3}
                  value={form.reason}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2 rounded-xl border text-red-600 hover:bg-red-50 transition"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="bg-pink-600 text-white px-5 py-2 rounded-xl shadow hover:bg-pink-700 transition disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </section>
      </main>
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Learn Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
