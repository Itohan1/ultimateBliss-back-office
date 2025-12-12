import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import { Search, Plus, Minus } from "lucide-react";

export default function SalesManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quantities, setQuantities] = useState({
    p1: 4,
    p2: 0,
  });

  const updateQty = (key: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + value),
    }));
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

        <section className="mt-16 md:ml-64 p-6">
          <h1 className="font-semibold text-2xl text-pink-700 mb-2">
            Sales Management
          </h1>

          <Breadcrumb
            items={[{ label: "Sales" }, { label: "Sales Management" }]}
          />

          {/* Search + Filters */}
          <div className="mt-6 bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                placeholder="Search ..."
                className="pl-10 w-full border rounded-xl px-3 py-2 bg-gray-50"
              />
            </div>

            <select className="border rounded-xl px-3 py-2 bg-gray-50 w-full md:w-40">
              <option>All Brands</option>
              <option>Brand A</option>
              <option>Brand B</option>
            </select>
          </div>

          {/* Product Listing */}
          <h2 className="font-semibold text-lg mt-8 mb-4">Product Listing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product 1 */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-semibold text-lg">Dwq</h3>
              <p className="text-gray-500">Another product</p>
              <p className="text-gray-500">qjerwrhu</p>

              <p className="text-xl font-bold text-pink-700 mt-3">₦95,000</p>

              {/* Quantity Control */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => updateQty("p1", -1)}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Minus size={16} />
                </button>

                <span className="text-lg font-semibold">{quantities.p1}</span>

                <button
                  onClick={() => updateQty("p1", 1)}
                  className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="text-gray-500 mt-2">896 Units left</p>

              <button className="mt-4 w-full px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700">
                Add More to Cart
              </button>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-semibold text-lg">First product</h3>
              <p className="text-gray-500">First product</p>
              <p className="text-gray-500">qwjbn</p>

              <p className="text-xl font-bold text-pink-700 mt-3">
                ₦990,000,000
              </p>

              {/* Quantity Control */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => updateQty("p2", -1)}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Minus size={16} />
                </button>

                <span className="text-lg font-semibold">{quantities.p2}</span>

                <button
                  onClick={() => updateQty("p2", 1)}
                  className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="text-gray-500 mt-2">9000 Units left</p>

              <button className="mt-4 w-full px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700">
                Add to Cart
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
