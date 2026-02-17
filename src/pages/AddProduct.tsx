import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Save } from "lucide-react";
import type {
  CreateInventoryItem,
  DiscountType,
} from "../types/CreateInventoryItem.ts";
import Input from "../components/Input.tsx";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../getErrorMessage.ts";
import LoginPopup from "../components/LoginPopup.tsx";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import { useAddProductMutation } from "../services/inventoryApi";
import ProductCategorySelector from "../components/productCategorySelector";
import { compressImageFile } from "../utils/imageUpload";
//import type { Category, Subcategory } from "../types/category.ts";
export default function AddProduct() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [addProduct, { isLoading }] = useAddProductMutation();
  const [showLogin, setShowLogin] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    productName: "",
    sku: "",
    category: "",
    subcategory: "",
    description: "",
    brandName: "",
    manufacturer: "",
    unitOfMeasure: "",
    stockNumber: "",
    lowStockThreshold: "",
    expiryDate: "",
    costPrice: "",
    sellingPrice: "",

    // NEW
    discount: "",
    discountType: "none",

    minQuantityOfPurchase: "",
    freeItemQuantity: "",
    freeItemDescription: "",
  });

  /* ---------------- Handlers ---------------- */
  /*const [categories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    const selectedCategory = categories.find(
      (cat) => cat._id === formData.category
    );
    setSubcategories(selectedCategory?.subcategories || []);
  }, [formData.category, categories]);*/ // categories is now valid dependency

  /*const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };*/
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Image must be 25MB or smaller");
      return;
    }

    let uploadFile = file;
    try {
      uploadFile = await compressImageFile(file, {
        maxBytes: 2 * 1024 * 1024,
        maxDimension: 1600,
      });
      if (uploadFile.size < file.size) {
        toast.success("Image optimized for faster upload");
      }
    } catch {
      uploadFile = file;
    }

    setImageFile(uploadFile);
    setImagePreview(URL.createObjectURL(uploadFile));
  };

  const handleSubmit = async () => {
    try {
      if (!imageFile) {
        toast.error("Product image is required");
        return;
      }

      const stockNumber = Number(formData.stockNumber);
      const lowStockThreshold = Number(formData.lowStockThreshold);

      // --------- BASIC NUMBER VALIDATION ---------
      if (Number.isNaN(stockNumber) || stockNumber < 0) {
        toast.error("Stock must be a valid non-negative number");
        return;
      }

      if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
        toast.error("Low stock threshold must be a valid non-negative number");
        return;
      }

      // --------- LOW STOCK LOGIC ---------
      if (lowStockThreshold > stockNumber) {
        toast.error("Low stock threshold cannot be greater than stock");
        return;
      }

      // --------- EXPIRY DATE VALIDATION ---------
      if (formData.expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize

        const expiryDate = new Date(formData.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
          toast.error("Expiry date cannot be earlier than today");
          return;
        }
      }

      const discount = Number(formData.discount) || 0;
      const sellingPrice = Number(formData.sellingPrice) || 0;

      if (discount < 0) {
        toast.error("Discount cannot be negative");
        return;
      }

      if (
        (formData.discountType === "percentage" ||
          formData.discountType === "flat") &&
        discount <= 0
      ) {
        toast.error(
          "Discount must be greater than 0 for percentage or flat type",
        );
        return;
      }

      if (formData.discountType === "percentage" && discount > 100) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }

      if (formData.discountType === "flat" && discount > sellingPrice) {
        toast.error("Flat discount cannot exceed selling price");
        return;
      }

      // --------- BUILD PAYLOAD ---------
      const payload: CreateInventoryItem = {
        productName: formData.productName,
        sku: formData.sku,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        brandName: formData.brandName,
        manufacturer: formData.manufacturer,
        unitOfMeasure: formData.unitOfMeasure,
        inventory: {
          stockNumber,
          lowStockThreshold,
          expiryDate: formData.expiryDate,
        },
        pricing: {
          costPrice: Number(formData.costPrice),
          sellingPrice: Number(formData.sellingPrice),
          discount,
          discountType: formData.discountType as DiscountType,

          freeOffer:
            formData.discountType === "free"
              ? {
                  minQuantityOfPurchase:
                    Number(formData.minQuantityOfPurchase) || 0,
                  freeItemQuantity: Number(formData.freeItemQuantity) || 0,
                  freeItemDescription: formData.freeItemDescription || "",
                }
              : undefined,
        },
      };

      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
      if (imageFile) {
        form.append("image", imageFile);
      }

      await addProduct(form).unwrap();
      toast.success("Product created successfully");
      navigate("/inventory");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;

      if ("status" in error && error.status === 401) {
        setShowLogin(true);
      } else {
        toast.error(getErrorMessage(err, "Failed to add product to inventory"));
      }
    }
  };

  useEffect(() => {
    if (formData.discountType === "none") {
      setFormData((prev) => ({ ...prev, discount: "" }));
    }
  }, [formData.discountType]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* ---------------- UI ---------------- */

  const discountedPrice = (() => {
    const selling = Number(formData.sellingPrice) || 0;
    const discount = Number(formData.discount) || 0;

    if (formData.discountType === "percentage") {
      return Math.max(0, Math.round(selling - (selling * discount) / 100));
    }

    if (formData.discountType === "flat") {
      return Math.max(0, Math.round(selling - discount));
    }

    if (formData.discountType === "free") {
      return selling; // price unchanged
    }

    return selling;
  })();

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

        <section className="mt-16 md:ml-64 flex-1 p-2 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-pink-700">
              Add New Product
            </h1>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={18} />
                {isLoading ? "Saving..." : "Save Product"}
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
              { label: "Add Product" },
            ]}
          />

          {/* Product Information */}
          <section className="bg-white rounded-2xl p-6 shadow mt-6">
            <h2 className="text-lg font-semibold mb-4 text-pink-700">
              Product Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Product Name"
                  name="productName"
                  placeholder="Product Name"
                  value={formData.productName}
                  onChange={handleChange}
                  className="input"
                />
                <Input
                  label="SKU"
                  name="sku"
                  placeholder="SKU"
                  value={formData.sku}
                  onChange={handleChange}
                  className="input mt-4"
                />
                <ProductCategorySelector
                  formData={formData}
                  handleChange={handleChange}
                />
                <Input
                  label="Description"
                  name="description"
                  placeholder="Product description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input mt-4"
                />
              </div>

              <div>
                <Input
                  label="Brand Name"
                  name="brandName"
                  placeholder="Brand Name"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="input"
                />

                <Input
                  label="Manufacturer"
                  name="manufacturer"
                  placeholder="Manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="input mt-4"
                />

                <Input
                  label="UnitOfMeasure"
                  name="unitOfMeasure"
                  placeholder="Unit of Measure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  className="input mt-4"
                />
              </div>
            </div>
          </section>

          {/* Inventory */}
          <section className="bg-white rounded-2xl p-6 shadow mt-8">
            <h2 className="text-lg font-semibold mb-4 text-pink-700">
              Inventory
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Input
                label="Stock"
                name="stockNumber"
                type="number"
                placeholder="Stock"
                value={formData.stockNumber}
                onChange={handleChange}
                className="input"
              />

              <Input
                label="LowStockThreshold"
                name="lowStockThreshold"
                type="number"
                placeholder="Low Stock Threshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className="input"
              />

              <Input
                label="Expiry Date"
                min={new Date().toISOString().split("T")[0]}
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                className="input"
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-2xl p-6 shadow mt-8">
            <h2 className="text-lg text-pink-700 font-semibold mb-4">
              Pricing
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Cost Price"
                name="costPrice"
                type="number"
                placeholder="Cost Price"
                value={formData.costPrice}
                onChange={handleChange}
                className="input"
              />

              <Input
                label="Selling Price"
                name="sellingPrice"
                type="number"
                placeholder="Selling Price"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="input"
              />

              {/* Discount Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="input mt-1"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₦)</option>
                  <option value="free">Buy X Get Y Free</option>
                </select>
              </div>

              {/* Discount Value */}
              <Input
                label="Discount"
                name="discount"
                type="number"
                placeholder="Discount"
                value={formData.discount}
                disabled={
                  formData.discountType === "none" ||
                  formData.discountType === "free"
                }
                onChange={handleChange}
                className="input"
              />
            </div>
            {formData.discountType === "free" && (
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Min Quantity To Buy"
                  name="minQuantityOfPurchase"
                  type="number"
                  value={formData.minQuantityOfPurchase}
                  onChange={handleChange}
                  className="input"
                />

                <Input
                  label="Free Item Quantity"
                  name="freeItemQuantity"
                  type="number"
                  value={formData.freeItemQuantity}
                  onChange={handleChange}
                  className="input"
                />

                <Input
                  label="Free Item Description"
                  name="freeItemDescription"
                  placeholder="e.g Free Face Mask"
                  value={formData.freeItemDescription}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            )}

            {/* Discounted Price Preview */}
            <div className="mt-4 bg-gray-50 border rounded-lg p-3 text-sm">
              <span className="text-gray-600">Discounted Price: </span>
              <span className="font-semibold text-green-700">
                ₦{discountedPrice.toLocaleString()}
              </span>
            </div>
          </section>

          {/* Image Upload */}
          <section className="bg-white rounded-2xl p-6 shadow mt-8">
            <h2 className="text-pink-700 text-lg font-semibold mb-4">
              Product Image
            </h2>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="w-40 h-40 object-cover mb-4"
                  alt="Product preview"
                />
              ) : (
                <p className="text-gray-500 mb-4">Upload product image</p>
              )}

              <label className="px-4 py-2 bg-pink-600 text-white rounded-lg cursor-pointer flex items-center gap-2">
                <Upload size={18} />
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </label>

              {imagePreview && (
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="mt-3 text-sm text-gray-600"
                >
                  Remove image
                </button>
              )}
            </div>
          </section>
        </section>
        {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      </main>
    </div>
  );
}
