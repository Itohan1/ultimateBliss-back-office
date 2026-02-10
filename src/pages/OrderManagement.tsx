import { useState, useRef, useEffect } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { EllipsisVertical, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAllOrdersQuery } from "../services/orderApi.ts";
import { TransactionBadge } from "../components/Order.tsx";
import { OrderStatusBadge } from "../components/Orders/OrderStatusBadge.tsx";

const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetAllOrdersQuery();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* Pagination */
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

  //if (isLoading) return <p className="p-6">Loading orders...</p>;

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
          {isLoading ? (
            <p className="p-6">Loading orders...</p>
          ) : (
            <>
              {/* Breadcrumb */}
              <p className="text-sm text-gray-500 mb-2">Dashboard / Orders</p>
              <h1 className="text-2xl font-semibold text-pink-700 mb-6">
                Recent Orders
              </h1>
              {/* Orders Table */}
              <div className="bg-white overflow-x-auto p-4 rounded-2xl shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Buyer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {paginatedOrders.map((order, idx) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {order.billing.firstname} {order.billing.lastname}
                          </p>
                          <p className="text-sm text-gray-500">
                            #{order.orderId}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {order.items
                              .slice(0, 2)
                              .map((i) => i.name)
                              .join(", ")}
                            {order.items.length > 2 && "…"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <TransactionBadge status={order.transactionStatus} />
                        </td>

                        <td className="px-6 py-4">
                          <OrderStatusBadge status={order.orderStatus} />
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-right relative">
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
                              className="absolute right-10 top-8 w-44 bg-white border rounded-xl shadow-lg z-10"
                            >
                              <button
                                onClick={() =>
                                  navigate(`/orders/${order.orderId}`)
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                              >
                                <Eye size={16} /> View Order Details
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
