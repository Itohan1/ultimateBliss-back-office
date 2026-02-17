import { useEffect, useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetCategoriesQuery } from "../services/categoryApi";
import {
  useDeleteInventoryItemMutation,
  useGetInventoryItemsQuery,
} from "../services/inventoryApi";
import { useGetReturnItemsQuery } from "../services/returnApi";
import ConfirmModal from "../components/ConfirmModal";

export default function Inventory() {
  const ITEMS_PER_PAGE = 10;

  const navigate = useNavigate();
  const { data: categories } = useGetCategoriesQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const { data: products = [], isLoading, refetch } = useGetInventoryItemsQuery();
  const { data: returnItems = [] } = useGetReturnItemsQuery();
  const [deleteInventoryItem, { isLoading: isDeleting }] =
    useDeleteInventoryItemMutation();

  const handleConfirmDelete = async () => {
    if (productToDelete === null) return;
    await deleteInventoryItem(productToDelete);
    await refetch();
    setProductToDelete(null);
  };

  useEffect(() => {
    const closeDropdown = () => setOpenDropdown(null);
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      product.productName.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term);

    const matchesCategory =
      !categoryFilter || product.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = {
    totalProducts: products.length,
    inStock: products.filter((p) => p.inventory.stockNumber > 0).length,
    lowStock: products.filter(
      (p) => p.inventory.stockNumber <= p.inventory.lowStockThreshold,
    ).length,
    expired: products.filter(
      (p) =>
        p.inventory.expiryDate && new Date(p.inventory.expiryDate) < new Date(),
    ).length,
    expiringSoon: products.filter(
      (p) =>
        p.inventory.expiryDate &&
        new Date(p.inventory.expiryDate) > new Date() &&
        new Date(p.inventory.expiryDate) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ).length,
  };

  if (isLoading) return <p className="p-6">Loading inventory...</p>;

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

        <section className="mt-16 md:ml-64 flex-1 p-2 md:p-6">
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
            className="bg-pink-700 rounded-lg flex gap-2 px-2 font-semibold hover:bg-pink-600 justify-center items-center cursor-pointer py-1 mb-3 text-white"
          >
            <Eye size={16} /> View Product Categories
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Expiring Soon</span>
              <span className="text-xl font-bold">
                {stats.expiringSoon} batch(es)
              </span>
            </div>

            <div className="bg-white p-4 flex flex-col gap-1 rounded-2xl shadow">
              <span className="text-gray-600">Expired</span>
              <span className="text-xl font-bold">{stats.expired} batch(es)</span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Total Products</span>
              <span className="text-xl font-bold">{stats.totalProducts}</span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">In Stock</span>
              <span className="text-xl font-bold">{stats.inStock}</span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Low Stock</span>
              <span className="text-xl font-bold">{stats.lowStock}</span>
            </div>

            <div className="bg-white flex flex-col gap-1 p-4 rounded-2xl shadow">
              <span className="text-gray-600">Damaged/Returned</span>
              <span className="text-xl font-bold">{returnItems.length}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full md:w-1/3 outline-none"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
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

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[980px] w-full table-fixed divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      In Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-4 py-4">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="h-12 w-12 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md border bg-gray-100" />
                        )}
                      </td>
                      <td
                        className="px-4 py-4 max-w-[180px] truncate"
                        title={product.productName}
                      >
                        {product.productName}
                      </td>
                      <td className="px-4 py-4 max-w-[120px] truncate" title={product.sku}>
                        {product.sku}
                      </td>
                      <td className="px-4 py-4 max-w-[130px] truncate" title={product.category}>
                        {product.category}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            NGN {(product.pricing.discountedPrice ?? product.pricing.sellingPrice).toLocaleString()}
                          </span>
                          {product.pricing.discountType !== "free" &&
                            (product.pricing.discountedPrice ?? product.pricing.sellingPrice) <
                              product.pricing.sellingPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                NGN {product.pricing.sellingPrice.toLocaleString()}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[250px] text-sm leading-5 break-words">
                        {product.pricing.discountType === "percentage" &&
                        (product.pricing.discount ?? 0) > 0
                          ? `-${product.pricing.discount}%`
                          : product.pricing.discountType === "flat" &&
                              (product.pricing.discount ?? 0) > 0
                            ? `NGN ${product.pricing.discount?.toLocaleString()}`
                            : product.pricing.discountType === "free"
                              ? `Buy ${product.pricing.freeOffer?.minQuantityOfPurchase ?? 1} Get ${product.pricing.freeOffer?.freeItemQuantity ?? 1} ${product.pricing.freeOffer?.freeItemDescription ?? "item"} Free`
                              : "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{product.inventory.stockNumber}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {product.inventory.expiryDate
                          ? new Date(product.inventory.expiryDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right relative">
                        <div
                          className="cursor-pointer text-gray-500 hover:text-pink-600 inline-block"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === product.productId
                                ? null
                                : product.productId,
                            );
                          }}
                        >
                          <EllipsisVertical />
                        </div>

                        {openDropdown === product.productId && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-10 top-8 w-40 bg-white border rounded-xl shadow-lg z-10"
                          >
                            <button
                              onClick={() =>
                                navigate(
                                  `/inventory/inventory-details/${product.productId}`,
                                )
                              }
                              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            >
                              <Eye size={16} /> View Details
                            </button>

                            <button
                              onClick={async () => {
                                if (typeof product.productId === "number") {
                                  setProductToDelete(product.productId);
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

            <div className="space-y-3 md:hidden">
              {paginatedProducts.map((product) => (
                <div
                  key={product.productId}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  {product.productImage ? (
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="mb-3 h-24 w-24 rounded-md object-cover border"
                    />
                  ) : null}
                  <p className="font-semibold">{product.productName}</p>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  <p className="text-sm text-gray-600">
                    Category: {product.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: NGN {(product.pricing.discountedPrice ?? product.pricing.sellingPrice).toLocaleString()}
                  </p>
                  {product.pricing.discountType !== "none" && (
                    <p className="text-sm text-gray-600">
                      Discount:{" "}
                      {product.pricing.discountType === "percentage"
                        ? `-${product.pricing.discount ?? 0}%`
                        : product.pricing.discountType === "flat"
                          ? `NGN ${(product.pricing.discount ?? 0).toLocaleString()}`
                          : `Buy ${product.pricing.freeOffer?.minQuantityOfPurchase ?? 1} Get ${product.pricing.freeOffer?.freeItemQuantity ?? 1} ${product.pricing.freeOffer?.freeItemDescription ?? "item"} Free`}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Stock: {product.inventory.stockNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expiry:{" "}
                    {product.inventory.expiryDate
                      ? new Date(product.inventory.expiryDate).toLocaleDateString()
                      : "-"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/inventory/inventory-details/${product.productId}`)
                      }
                      className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        if (typeof product.productId === "number") {
                          setProductToDelete(product.productId);
                        }
                      }}
                      className="rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Showing{" "}
                {filteredProducts.length === 0
                  ? 0
                  : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                {" - "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{" "}
                {filteredProducts.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ConfirmModal
        isOpen={productToDelete !== null}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
