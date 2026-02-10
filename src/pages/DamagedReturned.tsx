import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { useGetReturnItemsQuery } from "../services/returnApi";
import { useNavigate } from "react-router-dom";

type FilterType = "all" | "customer_return" | "supplier_return" | "damaged";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function DamagedReturned() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const { data: returns = [], isLoading } = useGetReturnItemsQuery();
  const ITEMS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  const filtered = returns.filter((r) => {
    const matchesSearch =
      r.product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" ? true : r.type === filterType;

    return matchesSearch && matchesType;
  });
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedReturns = filtered.slice(start, start + ITEMS_PER_PAGE);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const stats = {
    total: returns.length,
    supplier: returns.filter((r) => r.type === "supplier_return").length,
    customer: returns.filter((r) => r.type === "customer_return").length,
    damaged: returns.filter((r) => r.type === "damaged").length,
  };

  if (isLoading) return <p className="p-6">Loading returns...</p>;

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-pink-700">
              Damaged & Returned Items
            </h1>

            <button
              onClick={() => navigate("/returns/add")}
              className="bg-pink-600 text-white px-4 py-2 rounded-xl shadow hover:bg-pink-700 transition"
            >
              + Add Damaged / Return Item
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card label="Total Records" value={stats.total} />
            <Card label="Supplier Returns" value={stats.supplier} />
            <Card label="Customer Returns" value={stats.customer} />
            <Card label="Damaged Items" value={stats.damaged} />
          </div>

          {/* Table */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                placeholder="Search by product, contact or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-lg w-1/3"
              />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="customer_return">Customer Return</option>
                <option value="supplier_return">Supplier Return</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Inventory Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedReturns.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => navigate(`/inventory/returns/${item._id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">{item.product.productName}</td>
                    <td className="px-6 py-4">
                      {item.image ? (
                        <img
                          src={`${API_URL}${item.image}`}
                          alt={item.product.productName}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {item.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{item.contact.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.contact.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">{item.product.quantity}</td>
                    <td className="px-6 py-4">
                      {item.inventoryAdjusted ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-lg ${
                    p === page
                      ? "bg-pink-600 text-white"
                      : "border text-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ===== Card ===== */
function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <span className="text-gray-600">{label}</span>
      <span className="block text-xl font-bold">{value}</span>
    </div>
  );
}
