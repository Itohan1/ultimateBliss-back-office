import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function AddProduct() {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 md:ml-64 mt-16 text-gray-900">
      <h1 className="text-2xl font-semibold text-pink-700 mb-6">
        Add New Product
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* Product Information */}
          <div className="bg-white p-6 rounded-2xl shadow border border-purple-100">
            <h2 className="text-xl font-semibold text-pink-700 mb-4">
              Product Information
            </h2>

            <label className="block mb-3">
              <span className="text-gray-600">Product Name</span>
              <input
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="Ultimate Foam Cleanser"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">SKU / Product Code</span>
              <input
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="ULT1234"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Category</span>
              <select className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none">
                <option>Select</option>
                <option>Skincare</option>
                <option>Haircare</option>
                <option>Bodycare</option>
              </select>
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Subcategory</span>
              <input
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="Skincare"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Brand Name</span>
              <input
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="Ultimate"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Manufacturer</span>
              <input
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="Ultimate Labs"
              />
            </label>

            <label className="block mb-2">
              <span className="text-gray-600">Unit of Measure</span>
              <input
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="Carton"
              />
            </label>
          </div>

          {/* Inventory Details */}
          <div className="bg-white p-6 rounded-2xl shadow border border-purple-100">
            <h2 className="text-xl font-semibold text-pink-700 mb-4">
              Inventory Details
            </h2>

            <label className="block mb-3">
              <span className="text-gray-600">Stock Number</span>
              <input
                type="number"
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="500"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Low Stock Threshold</span>
              <input
                type="number"
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="80"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Expiry Date</span>
              <input
                type="date"
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
              />
            </label>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Pricing Details */}
          <div className="bg-white p-6 rounded-2xl shadow border border-purple-100">
            <h2 className="text-xl font-semibold text-pink-700 mb-4">
              Pricing Details
            </h2>

            <label className="block mb-3">
              <span className="text-gray-600">Cost Price</span>
              <input
                type="number"
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="2000"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Selling Price</span>
              <input
                type="number"
                className="w-full bg-gray-100 p-3 rounded-xl mt-1 outline-none"
                placeholder="3000"
              />
            </label>
          </div>

          {/* Product Image Upload */}
          <div className="bg-white p-6 rounded-2xl shadow border border-purple-100">
            <h2 className="text-xl font-semibold text-pink-700 mb-4">
              Product Image Upload
            </h2>

            <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-purple-50/40">
              {image ? (
                <div className="relative w-40 h-40 mb-4">
                  <img
                    src={image}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-1 right-1 bg-pink-600 text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="text-pink-600 mb-2" size={40} />
                  <p className="text-gray-600">
                    Drag and drop logo here, or click "Add Image"
                  </p>
                </>
              )}

              <label className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-700">
                Add Image
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
                  className="mt-2 text-red-500 underline text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 font-semibold">
          Save Product
        </button>
      </div>
    </div>
  );
}
