import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Aside from "../components/Aside.tsx";
import Header from "../components/Header.tsx";
import { Breadcrumb } from "../components/Breadcrumbs.tsx";
import { Upload, X, Save } from "lucide-react";

export default function AddProduct() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
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
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-semibold text-2xl text-pink-700">
              Add New Product
            </h1>

            <div className="flex gap-3">
              <button className="px-4 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Save size={18} /> Save Product
              </button>

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
                { label: "Add Product" },
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
                <input className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50" />

                <label className="block mt-4 text-sm font-medium">
                  SKU / Product Code
                </label>
                <input className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50" />

                <label className="block mt-4 text-sm font-medium">
                  Category
                </label>
                <select className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50">
                  <option>Skincare</option>
                  <option>Haircare</option>
                  <option>Bodycare</option>
                  <option>Add custom category</option>
                </select>

                <label className="block mt-4 text-sm font-medium">
                  Subcategory
                </label>
                <input className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium">Brand Name</label>
                <input className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50" />

                <label className="block mt-4 text-sm font-medium">
                  Manufacturer
                </label>
                <input className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50" />

                <label className="block mt-4 text-sm font-medium">
                  Unit of Measure
                </label>
                <input className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50" />
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
                  type="number"
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
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
                  type="number"
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Selling Price
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* Product Image Upload */}
          <section className="bg-white rounded-2xl p-6 shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Product Image Upload</h2>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              {image ? (
                <img
                  src={image}
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
                  />
                </label>

                {image && (
                  <button
                    onClick={() => setImage(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
