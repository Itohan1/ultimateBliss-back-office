import { useState, useEffect, useRef } from "react";
/*import { Bell, User, Search } from "lucide-react";*/
import Aside from "../components/Aside.tsx";
import Header from "../components/Header.tsx";
import { EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  name: string;
  sku: string;
  category: string;
  price: string;
  inStock: number;
  date: string;
}

export default function Inventory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const products: Product[] = [
    {
      name: "Product 1",
      sku: "SKU001",
      category: "Category A",
      price: "$10",
      inStock: 50,
      date: "2025-12-01",
    },
    {
      name: "Product 2",
      sku: "SKU002",
      category: "Category B",
      price: "$15",
      inStock: 5,
      date: "2025-11-20",
    },
    {
      name: "Product 3",
      sku: "SKU003",
      category: "Category A",
      price: "$12",
      inStock: 0,
      date: "2025-11-05",
    },
  ];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-y-auto">
        {/* Header */}
        {/*<header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm border-b">
          <div className="hidden sm:flex items-center w-60 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="text-gray-500" width={18} height={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 bg-transparent outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative">
              <Bell
                width={22}
                height={22}
                className="text-gray-600 hover:text-pink-600"
              />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 cursor-pointer hover:text-pink-700">
              <User width={24} height={24} />
              <span className="hidden md:inline">Admin</span>
             </div>
          </div>
        </header>*/}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Inventory Content */}
        <section className="mt-16 md:ml-64 flex-1 p-6">
          <h1 className="text-2xl font-semibold text-pink-700 mb-4">
            Inventory Overview
          </h1>
          <button
            onClick={() => navigate("/inventory/add-product")}
            className="bg-pink-700 rounded-lg px-3 font-semibold hover:bg-pink-600 cursor-pointer py-3 mb-3 text-white"
          >
            + Add Product
          </button>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <span className="text-gray-600">Expiring Soon</span>
              <span className="text-xl font-bold">6 batch(es)</span>
              <button className="text-pink-600 mt-2 underline text-sm">
                View Details
              </button>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <span className="text-gray-600">Expired</span>
              <span className="text-xl font-bold">3 batch(es)</span>
              <button className="text-pink-600 mt-2 underline text-sm">
                View Details
              </button>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <span className="text-gray-600">Total Products</span>
              <span className="text-xl font-bold">20</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <span className="text-gray-600">In Stock</span>
              <span className="text-xl font-bold">15</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <span className="text-gray-600">Low Stock</span>
              <span className="text-xl font-bold">3</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <span className="text-gray-600">Damaged/Returned</span>
              <span className="text-xl font-bold">2</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-lg w-1/3 outline-none"
              />
              <select className="border px-3 py-2 rounded-lg">
                <option>All Categories</option>
                <option>Category A</option>
                <option>Category B</option>
              </select>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    In Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.inStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                      <div
                        className="cursor-pointer text-gray-500 hover:text-pink-600 inline-block"
                        onClick={() =>
                          setOpenDropdown(openDropdown === idx ? null : idx)
                        }
                      >
                        <EllipsisVertical />
                      </div>

                      {openDropdown === idx && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-10 top-8 w-40 bg-white border rounded-xl shadow-lg z-10"
                        >
                          <button
                            onClick={() => navigate("/inventory/view-product")}
                            className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Eye size={16} /> View Details
                          </button>
                          <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                            <Trash2 size={16} /> Delete Product
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
