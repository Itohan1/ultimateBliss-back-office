import { useState, useEffect, useRef } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetCategoriesQuery } from "../services/categoryApi";
import {
  useGetInventoryItemsQuery,
  useDeleteInventoryItemMutation,
} from "../services/inventoryApi";

export default function Inventory() {
  const navigate = useNavigate();
  const { data: categories } = useGetCategoriesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { refetch } = useGetInventoryItemsQuery();

  const { data: products = [], isLoading } = useGetInventoryItemsQuery();
  const [deleteInventoryItem] = useDeleteInventoryItemMutation();

  const filteredProducts = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /*useEffect(() => {
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
  }, []);*/

  const stats = {
    totalProducts: products.length,
    inStock: products.filter((p) => p.inventory.stockNumber > 0).length,
    lowStock: products.filter(
      (p) => p.inventory.stockNumber <= p.inventory.lowStockThreshold
    ).length,
    expired: products.filter(
      (p) =>
        p.inventory.expiryDate && new Date(p.inventory.expiryDate) < new Date()
    ).length,
    expiringSoon: products.filter(
      (p) =>
        p.inventory.expiryDate &&
        new Date(p.inventory.expiryDate) > new Date() &&
        new Date(p.inventory.expiryDate) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length,
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <p className="p-6">Loading inventory...</p>;

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

          <button
            onClick={() => navigate("/categories")}
            className="bg-pink-700 rounded-lg flex gap-2 px-1 font-semibold hover:bg-pink-600 justify-center items-center cursor-pointer py-1 mb-3 text-white"
          >
            <Eye size={16} /> View Product categories
          </button>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Expiring Soon</span>
              <span className="text-xl font-bold">
                {stats?.expiringSoon ?? 0} batch(es)
              </span>
            </div>

            <div className="bg-white p-4 flex flex-col gap-1 rounded-2xl shadow">
              <span className="text-gray-600">Expired</span>
              <span className="text-xl font-bold">
                {stats?.expired ?? 0} batch(es)
              </span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Total Products</span>
              <span className="text-xl font-bold">
                {stats?.totalProducts ?? 0}
              </span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">In Stock</span>
              <span className="text-xl font-bold">{stats?.inStock ?? 0}</span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Low Stock</span>
              <span className="text-xl font-bold">{stats?.lowStock ?? 0}</span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Damaged/Returned</span>
              <span className="text-xl font-bold">—</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white overflow-x-auto sm:overflow-x-visible p-4 rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-lg w-1/3 outline-none"
              />
              <select
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <table className=" min-w-full divide-y divide-gray-200">
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
                  <tr key={product._id}>
                    <td className="px-6 py-4">{product.productName}</td>
                    <td className="px-6 py-4">{product.sku}</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">
                      ₦{product.pricing.sellingPrice}
                    </td>
                    <td className="px-6 py-4">
                      {product.inventory.stockNumber}
                    </td>
                    <td className="px-6 py-4">
                      {product.inventory.expiryDate
                        ? new Date(
                            product.inventory.expiryDate
                          ).toLocaleDateString()
                        : "—"}
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
                            onClick={() =>
                              navigate(
                                `/inventory/inventory-details/${product.productId}`
                              )
                            }
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                          >
                            <Eye size={16} /> View Details
                          </button>

                          <button
                            onClick={async () => {
                              if (typeof product.productId === "number") {
                                await deleteInventoryItem(product.productId);
                                refetch();
                              }

                              setOpenDropdown(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                          >
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
