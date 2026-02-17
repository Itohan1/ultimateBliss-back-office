import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Breadcrumb } from "../components/Breadcrumbs.tsx";
import Aside from "../components/Aside.tsx";
import Header from "../components/Header.tsx";
import { Edit3, X, Upload, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetInventoryItemQuery,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from "../services/inventoryApi";
import type { InventoryItem } from "../types/InventoryItem.ts";
import { getErrorMessage } from "../getErrorMessage.ts";
import { compressImageFile } from "../utils/imageUpload";
import ConfirmModal from "../components/ConfirmModal.tsx";
//import { getErrorMessage } from "../getErrorMessage.ts";

export default function ViewProduct() {
  const navigate = useNavigate();
  const [deleteInventoryItem, { isLoading: isDeleting }] =
    useDeleteInventoryItemMutation();
  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [updateInventoryItem] = useUpdateInventoryItemMutation();
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { id: productId } = useParams<{ id: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { data: productData, isLoading } = useGetInventoryItemQuery(
    productId || ""
  );

  // Product Data States
  // Handle input changes

  useEffect(() => {
    if (productData) {
      setProduct({
        productId: productData.productId,
        productName: productData.productName,
        sku: productData.sku,
        category: productData.category,
        subcategory: productData.subcategory ?? "",
        brandName: productData.brandName ?? "",
        manufacturer: productData.manufacturer ?? "",
        unitOfMeasure: productData.unitOfMeasure ?? "",
        inventory: {
          stockNumber: productData.inventory.stockNumber,
          lowStockThreshold: productData.inventory.lowStockThreshold,
          expiryDate: productData.inventory.expiryDate
            ? new Date(productData.inventory.expiryDate)
                .toISOString()
                .slice(0, 10)
            : undefined,
        },
        pricing: {
          costPrice: productData.pricing.costPrice,
          sellingPrice: productData.pricing.sellingPrice,
          discount: productData.pricing.discount ?? 0,
          discountType: productData.pricing.discountType ?? "none",
          discountedPrice:
            productData.pricing.discountedPrice ??
            productData.pricing.sellingPrice,
          freeOffer: {
            minQuantityOfPurchase:
              productData.pricing.freeOffer?.minQuantityOfPurchase ?? 1,
            freeItemQuantity: productData.pricing.freeOffer?.freeItemQuantity ?? 1,
            freeItemDescription:
              productData.pricing.freeOffer?.freeItemDescription ?? "",
          },
        },
      });
      setProductImage(productData.productImage ?? null);
      setImageFile(null);
    }
  }, [productData]);

  useEffect(() => {
    return () => {
      if (productImage?.startsWith("blob:")) {
        URL.revokeObjectURL(productImage);
      }
    };
  }, [productImage]);

  type EditableProductKeys =
    | "productName"
    | "sku"
    | "category"
    | "subcategory"
    | "brandName"
    | "manufacturer"
    | "unitOfMeasure"
    | "stockNumber"
    | "lowStockThreshold"
    | "expiry"
    | "costPrice"
    | "sellingPrice";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: EditableProductKeys
  ) => {
    if (!product) return;

    // For nested fields like inventory or pricing, you might need special handling
    if (key === "stockNumber") {
      setProduct({
        ...product,
        inventory: {
          ...product.inventory,
          stockNumber: Number(e.target.value),
        },
      });
    } else if (key === "lowStockThreshold") {
      setProduct({
        ...product,
        inventory: {
          ...product.inventory,
          lowStockThreshold: Number(e.target.value),
        },
      });
    } else if (key === "expiry") {
      setProduct({
        ...product,
        inventory: { ...product.inventory, expiryDate: e.target.value },
      });
    } else if (key === "costPrice") {
      setProduct({
        ...product,
        pricing: { ...product.pricing, costPrice: Number(e.target.value) },
      });
    } else if (key === "sellingPrice") {
      setProduct({
        ...product,
        pricing: { ...product.pricing, sellingPrice: Number(e.target.value) },
      });
    } else {
      // simple string fields
      setProduct({ ...product, [key]: e.target.value });
    }
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      setProductImage(URL.createObjectURL(uploadFile));
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setProductImage(null);
  };

  const handleSave = async () => {
    if (!productImage) {
      toast.error("Product image is required");
      return;
    }

    const stockNumber = Number(product?.inventory.stockNumber);
    const lowStockThreshold = Number(product?.inventory.lowStockThreshold);

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
    if (product?.inventory.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize

      const expiryDate = new Date(product?.inventory.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        toast.error("Expiry date cannot be earlier than today");
        return;
      }
    }

    const discount = Number(product?.pricing.discount ?? 0);
    const sellingPrice = Number(product?.pricing.sellingPrice ?? 0);
    const discountType = product?.pricing.discountType ?? "none";

    if (discount < 0) {
      toast.error("Discount cannot be negative");
      return;
    }

    if (
      (discountType === "percentage" || discountType === "flat") &&
      discount <= 0
    ) {
      toast.error("Discount must be greater than 0 for percentage or flat type");
      return;
    }

    if (discountType === "percentage" && discount > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    if (discountType === "flat" && discount > sellingPrice) {
      toast.error("Flat discount cannot exceed selling price");
      return;
    }

    if (!productId) return;

    const payload = {
      productName: product?.productName,
      sku: product?.sku,
      category: product?.category,
      subcategory: product?.subcategory,
      brandName: product?.brandName,
      manufacturer: product?.manufacturer,
      unitOfMeasure: product?.unitOfMeasure,
      inventory: {
        stockNumber: Number(product?.inventory?.stockNumber),
        lowStockThreshold: Number(product?.inventory?.lowStockThreshold),
        expiryDate: product?.inventory?.expiryDate || undefined,
      },
      pricing: {
        costPrice: Number(product?.pricing.costPrice),
        sellingPrice: Number(product?.pricing.sellingPrice),
        discount: Number(product?.pricing.discount ?? 0),
        discountType: product?.pricing.discountType ?? "none",
        discountedPrice: Number(
          product?.pricing.discountedPrice ?? product?.pricing.sellingPrice ?? 0,
        ),
        freeOffer: {
          minQuantityOfPurchase: Number(
            product?.pricing.freeOffer?.minQuantityOfPurchase ?? 1,
          ),
          freeItemQuantity: Number(product?.pricing.freeOffer?.freeItemQuantity ?? 1),
          freeItemDescription: product?.pricing.freeOffer?.freeItemDescription ?? "",
        },
      },
    };

    try {
      const shouldClearImage = Boolean(productData?.productImage && !productImage);

      if (imageFile) {
        const form = new FormData();
        form.append("payload", JSON.stringify(payload));
        form.append("image", imageFile);
        await updateInventoryItem({ productId, data: form }).unwrap();
      } else {
        await updateInventoryItem({
          productId,
          data: shouldClearImage ? { ...payload, productImage: null } : payload,
        }).unwrap();
      }

      setIsEditing(false);
      toast("Product updated successfully!");
      navigate("/inventory");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to update product."));
    }
  };

  if (isLoading || !product) return <p className="p-6">Loading product...</p>;
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-y-auto">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <section className="mt-16 md:ml-64 flex-1 p-6">
          {/* Header Section */}
          <div className="flex sm:flex-row flex-col sm:gap-0 gap-4 items-center justify-between mb-4">
            <h1 className="font-semibold text-2xl text-pink-700">
              View Details
            </h1>
            <div className="flex gap-3">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save size={18} /> Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 flex items-center gap-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  <Edit3 size={18} /> Edit
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 flex items-center gap-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={() => setIsConfirmOpen(true)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-red-700 text-white rounded-xl"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-8">
            <Breadcrumb
              items={[
                { label: "Inventory", onClick: () => navigate("/inventory") },
                { label: "Inventory Details" },
              ]}
            />
          </div>

          {/* Product Information */}
          <section className="bg-white rounded-2xl p-6 shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">
                  {product?.productName}
                </label>
                <input
                  type="text"
                  value={product?.productName}
                  onChange={(e) => handleChange(e, "productName")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  SKU / Product Code
                </label>
                <input
                  type="text"
                  value={product?.sku}
                  onChange={(e) => handleChange(e, "sku")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Category
                </label>
                <input
                  type="text"
                  value={product?.category}
                  onChange={(e) => handleChange(e, "category")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={product?.subcategory}
                  onChange={(e) => handleChange(e, "subcategory")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Brand Name</label>
                <input
                  type="text"
                  value={product?.brandName}
                  onChange={(e) => handleChange(e, "brandName")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={product?.manufacturer}
                  onChange={(e) => handleChange(e, "manufacturer")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Unit of Measure
                </label>
                <input
                  type="text"
                  value={product?.unitOfMeasure}
                  onChange={(e) => handleChange(e, "unitOfMeasure")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* Inventory Details */}
          <section className="bg-white rounded-2xl p-6 shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Inventory Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium">
                  Stock Number
                </label>
                <input
                  type="text"
                  value={product?.inventory?.stockNumber}
                  onChange={(e) => handleChange(e, "stockNumber")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Low Stock Threshold
                </label>
                <input
                  type="text"
                  value={product?.inventory?.lowStockThreshold}
                  onChange={(e) => handleChange(e, "lowStockThreshold")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={product?.inventory?.expiryDate || ""}
                  onChange={(e) => handleChange(e, "expiry")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* Pricing Details */}
          <section className="bg-white rounded-2xl p-6 shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Pricing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">Cost Price</label>
                <input
                  type="text"
                  value={product?.pricing?.costPrice}
                  onChange={(e) => handleChange(e, "costPrice")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Selling Price
                </label>
                <input
                  type="text"
                  value={product?.pricing?.sellingPrice}
                  onChange={(e) => handleChange(e, "sellingPrice")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Discount Type</label>
                {isEditing ? (
                  <select
                    value={product?.pricing?.discountType ?? "none"}
                    onChange={(e) =>
                      setProduct((prev) =>
                        prev
                          ? {
                              ...prev,
                              pricing: {
                                ...prev.pricing,
                                discountType: e.target.value as
                                  | "none"
                                  | "percentage"
                                  | "flat"
                                  | "free",
                              },
                            }
                          : prev,
                      )
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (NGN)</option>
                    <option value="free">Buy X Get Y Free</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={product?.pricing?.discountType ?? "none"}
                    readOnly
                    className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Discount Value</label>
                <input
                  type="text"
                  value={
                    product?.pricing?.discountType === "percentage"
                      ? `${product?.pricing?.discount ?? 0}%`
                      : product?.pricing?.discountType === "flat"
                        ? `NGN ${(product?.pricing?.discount ?? 0).toLocaleString()}`
                        : product?.pricing?.discountType === "free"
                          ? "Buy X Get Y Free"
                          : "No Discount"
                  }
                  readOnly
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Final Price</label>
                <input
                  type="text"
                  value={`NGN ${(product?.pricing?.discountedPrice ?? product?.pricing?.sellingPrice ?? 0).toLocaleString()}`}
                  readOnly
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>

              {product?.pricing?.discountType === "free" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium">
                      Min Quantity Of Purchase
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={product?.pricing?.freeOffer?.minQuantityOfPurchase ?? 0}
                      readOnly={!isEditing}
                      onChange={(e) =>
                        setProduct((prev) =>
                          prev
                            ? {
                                ...prev,
                                pricing: {
                                  ...prev.pricing,
                                  freeOffer: {
                                    ...prev.pricing.freeOffer,
                                    minQuantityOfPurchase: Number(e.target.value),
                                  },
                                },
                              }
                            : prev,
                        )
                      }
                      className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Free Item Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={product?.pricing?.freeOffer?.freeItemQuantity ?? 0}
                      readOnly={!isEditing}
                      onChange={(e) =>
                        setProduct((prev) =>
                          prev
                            ? {
                                ...prev,
                                pricing: {
                                  ...prev.pricing,
                                  freeOffer: {
                                    ...prev.pricing.freeOffer,
                                    freeItemQuantity: Number(e.target.value),
                                  },
                                },
                              }
                            : prev,
                        )
                      }
                      className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">
                      Free Item Description
                    </label>
                    <input
                      type="text"
                      value={product?.pricing?.freeOffer?.freeItemDescription ?? ""}
                      readOnly={!isEditing}
                      onChange={(e) =>
                        setProduct((prev) =>
                          prev
                            ? {
                                ...prev,
                                pricing: {
                                  ...prev.pricing,
                                  freeOffer: {
                                    ...prev.pricing.freeOffer,
                                    freeItemDescription: e.target.value,
                                  },
                                },
                              }
                            : prev,
                        )
                      }
                      className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium">Free Offer</label>
                  <input
                    type="text"
                    value="-"
                    readOnly
                    className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Image Upload */}
          <section className="bg-white rounded-2xl p-6 shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Product Image Upload</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              {productImage ? (
                <img
                  src={productImage}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <p className="text-gray-500 mb-4">
                  Drag and drop logo here, or click "Add Image"
                </p>
              )}

              <div className="flex gap-4">
                <label className="cursor-pointer px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2">
                  <Upload size={18} /> Add Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={!isEditing}
                  />
                </label>
                <button
                  onClick={handleClearImage}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  disabled={!isEditing}
                >
                  Clear
                </button>
              </div>
            </div>
          </section>
        </section>
      </main>
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          if (typeof product.productId === "number") {
            await deleteInventoryItem(product.productId);
            setIsConfirmOpen(false);
            navigate("/inventory");
          }
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
