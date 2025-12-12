import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumbs.tsx";
import { useState } from "react";
import Aside from "../components/Aside.tsx";
import Header from "../components/Header.tsx";
import { Edit3, X, Upload, Save } from "lucide-react";

export default function ViewProduct() {
  const navigate = useNavigate();
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Product Data States
  const [product, setProduct] = useState({
    name: "Ultimate Foam Cleanser",
    sku: "ULT1234",
    category: "Cosmetics",
    subcategory: "Skincare",
    brand: "Ultimate",
    manufacturer: "Ultimate Labs",
    unit: "Carton",
    stock: "500",
    lowStock: "80",
    expiry: "12/11/2025",
    costPrice: "2000",
    sellingPrice: "3000",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof product
  ) => {
    setProduct({ ...product, [key]: e.target.value });
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProductImage(imageUrl);
    }
  };

  const handleClearImage = () => setProductImage(null);

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    alert("Product details saved successfully!");
  };

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
          <div className="flex items-center justify-between mb-4">
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
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-8">
            <Breadcrumb
              items={[
                { label: "Inventory", onClick: () => navigate("/inventory") },
                { label: "View Details" },
              ]}
            />
          </div>

          {/* Product Information */}
          <section className="bg-white rounded-2xl p-6 shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">
                  Product Name
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleChange(e, "name")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  SKU / Product Code
                </label>
                <input
                  type="text"
                  value={product.sku}
                  onChange={(e) => handleChange(e, "sku")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Category
                </label>
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => handleChange(e, "category")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={product.subcategory}
                  onChange={(e) => handleChange(e, "subcategory")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Brand Name</label>
                <input
                  type="text"
                  value={product.brand}
                  onChange={(e) => handleChange(e, "brand")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={product.manufacturer}
                  onChange={(e) => handleChange(e, "manufacturer")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />

                <label className="block mt-4 text-sm font-medium">
                  Unit of Measure
                </label>
                <input
                  type="text"
                  value={product.unit}
                  onChange={(e) => handleChange(e, "unit")}
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
                  value={product.stock}
                  onChange={(e) => handleChange(e, "stock")}
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
                  value={product.lowStock}
                  onChange={(e) => handleChange(e, "lowStock")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={product.expiry}
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
                  value={product.costPrice}
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
                  value={product.sellingPrice}
                  onChange={(e) => handleChange(e, "sellingPrice")}
                  readOnly={!isEditing}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
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
                  Drag and drop logo here, or click “Add Image”
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
    </div>
  );
}
