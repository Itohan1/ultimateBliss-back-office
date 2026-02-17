import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";
import LoginPopup from "../components/LoginPopup";
import { Breadcrumb } from "../components/Breadcrumbs";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getErrorMessage } from "../getErrorMessage";
import { useUpdateShippingDetailsMutation } from "../services/orderApi";
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdateTransactionStatusMutation,
  useSettleDisputeMutation,
} from "../services/orderApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { OrderStatus, TransactionStatus } from "../types/order";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const adminToken = useSelector((state: RootState) => state.adminAuth.token);
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const { data: order, isLoading } = useGetOrderByIdQuery(Number(orderId));
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updateTransactionStatus] = useUpdateTransactionStatusMutation();

  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updateShippingDetails] = useUpdateShippingDetailsMutation();
  const [estimatedDelivery, setEstimatedDelivery] = useState(getTomorrowDate);
  const [shippingDescription, setShippingDescription] = useState(
    "Your product has been shipped",
  );
  const [settleDispute] = useSettleDisputeMutation();
  const [isSettling, setIsSettling] = useState(false);

  const handleSettleDispute = async () => {
    if (!order?.orderId) return;

    await requireAuth(async () => {
      try {
        setIsSettling(true);
        await settleDispute(order.orderId).unwrap();
        toast.success("Dispute settled successfully");
      } catch (err: unknown) {
        const error = err as FetchBaseQueryError;
        if ("status" in error && error.status === 401) {
          setShowLogin(true);
        } else {
          toast.error(getErrorMessage(err, "Failed to settle dispute"));
        }
      } finally {
        setIsSettling(false);
      }
    });
  };

  const handleShippingUpdate = async () => {
    await requireAuth(async () => {
      try {
        if (!order?.orderId) {
          toast.error("Order not loaded");
          return;
        }

        await updateShippingDetails({
          orderId: order.orderId,
          description: shippingDescription || undefined,
          estimatedDelivery: estimatedDelivery
            ? new Date(estimatedDelivery).toISOString()
            : undefined,
        }).unwrap();

        toast.success("Shipping details updated");
      } catch (err: unknown) {
        const error = err as FetchBaseQueryError;
        if ("status" in error && error.status === 401) {
          setShowLogin(true);
        } else {
          toast.error(getErrorMessage(err, "Failed to update shipping"));
        }
      }
    });
  };

  if (isLoading) return <p className="p-6">Loading order...</p>;
  if (!order) return <p className="p-6">Order not found</p>;

  const requireAuth = async (action: () => Promise<void>) => {
    if (!adminToken) {
      setShowLogin(true);
      return;
    }
    await action();
  };

  const ORDER_STATUSES: readonly OrderStatus[] = [
    "pending",
    "packaging",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
  ];
  const statusesRequiringSuccessfulTransaction: ReadonlySet<OrderStatus> =
    new Set(["packaging", "shipped", "delivered", "completed"]);

  const TRANSACTION_STATUSES: readonly TransactionStatus[] = [
    "pending",
    "success",
    "failed",
  ];

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    packaging: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-800",
  };

  const transactionColor: Record<TransactionStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  const naira = new Intl.NumberFormat("en-NG");
  const getUnitPrice = (item: (typeof order.items)[number]) =>
    Number(item.discountedPrice ?? item.sellingPrice ?? item.price ?? 0);
  const getSellingPrice = (item: (typeof order.items)[number]) =>
    Number(item.sellingPrice ?? item.price ?? getUnitPrice(item));
  const getDiscountLabel = (item: (typeof order.items)[number]) => {
    if (item.discountType === "percentage" && (item.discount ?? 0) > 0) {
      return `-${item.discount}%`;
    }
    if (item.discountType === "flat" && (item.discount ?? 0) > 0) {
      return `NGN ${naira.format(item.discount ?? 0)} off`;
    }
    if (item.discountType === "free") {
      return `Buy ${item.minPurchaseQuantity ?? 1} Get ${item.freeQuantity ?? 0} ${item.freeItemDescription ?? "item"} Free`;
    }
    return "No Discount";
  };

  const handleTransactionChange = async (value: TransactionStatus) => {
    await requireAuth(async () => {
      try {
        await updateTransactionStatus({
          orderId: order.orderId,
          transactionStatus: value,
        }).unwrap();

        // Auto move to packaging when payment succeeds
        if (value === "success") {
          await updateOrderStatus({
            orderId: order.orderId,
            orderStatus: "packaging",
          }).unwrap();
        }

        toast.success("Transaction updated");
      } catch (err: unknown) {
        const error = err as FetchBaseQueryError;

        if ("status" in error && error.status === 401) {
          setShowLogin(true);
        } else {
          toast.error(getErrorMessage(err, "Failed to update transaction"));
        }
      }
    });
  };

  const handleOrderStatusChange = async (value: OrderStatus) => {
    await requireAuth(async () => {
      try {
        await updateOrderStatus({
          orderId: order.orderId,
          orderStatus: value,
        }).unwrap();

        toast.success("Order status updated");
      } catch (err: unknown) {
        const error = err as FetchBaseQueryError;

        if ("status" in error && error.status === 401) {
          setShowLogin(true);
        } else {
          toast.error(getErrorMessage(err, "Failed to update transaction"));
        }
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <section className="mt-16 md:ml-64 p-2 sm:p-6 space-y-6">
          <Breadcrumb
            items={[
              { label: "Orders", onClick: () => navigate("/orders") },
              { label: `Order #${order.orderId}` },
            ]}
          />

          <h1 className="text-2xl font-semibold text-pink-700">
            Order #{order.orderId}
          </h1>

          {/* Status controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-medium mb-2">Transaction Status</p>
              <select
                value={order.transactionStatus}
                onChange={(e) =>
                  handleTransactionChange(e.target.value as TransactionStatus)
                }
                className={`w-full border rounded-lg px-3 py-2 ${transactionColor[order.transactionStatus]}`}
              >
                {TRANSACTION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-medium mb-2">Order Status</p>
              <select
                value={order.orderStatus}
                onChange={(e) =>
                  handleOrderStatusChange(e.target.value as OrderStatus)
                }
                className={`w-full border rounded-xl px-3 py-2 ${statusColor[order.orderStatus]}`}
              >
                {ORDER_STATUSES.map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={
                      statusesRequiringSuccessfulTransaction.has(s) &&
                      order.transactionStatus !== "success"
                    }
                  >
                    {s}
                  </option>
                ))}
              </select>
              {order.transactionStatus !== "success" && (
                <p className="mt-2 text-xs text-red-500">
                  Transaction must be successful before setting order status to
                  packaging, shipped, delivered, or completed.
                </p>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow mt-6">
            <h2 className="font-semibold mb-2">Shipping Details</h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <input
                type="text"
                value={shippingDescription}
                onChange={(e) => setShippingDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., Your product has been shipped"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Estimated Delivery</label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <button
              onClick={handleShippingUpdate}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
            >
              Update Shipping
            </button>
          </div>
          {order.isDisputed && (
            <div className="bg-white p-4 rounded-xl shadow mt-6">
              <h2 className="font-semibold mb-2 text-red-700">
                Dispute Settlement
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                This order is currently under dispute. You can settle the
                dispute to allow the order to continue its normal workflow.
              </p>

              <button
                onClick={handleSettleDispute}
                disabled={isSettling}
                className={`w-full py-2 rounded-lg font-medium text-white ${
                  isSettling
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSettling ? "Settling..." : "Settle Dispute"}
              </button>
            </div>
          )}
          {/* Items */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <div className="hidden md:block">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs">Product</th>
                    <th className="px-4 py-2 text-left text-xs">Qty</th>
                    <th className="px-4 py-2 text-left text-xs">Price</th>
                    <th className="px-4 py-2 text-left text-xs">Discount</th>
                    <th className="px-4 py-2 text-left text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>NGN {naira.format(getUnitPrice(item))}</span>
                          {item.discountType !== "free" &&
                            getUnitPrice(item) < getSellingPrice(item) && (
                              <span className="text-xs text-gray-400 line-through">
                                NGN {naira.format(getSellingPrice(item))}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getDiscountLabel(item)}</td>
                      <td className="px-4 py-3 font-medium">
                        NGN {naira.format(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-sm text-gray-600">
                    Price: NGN {naira.format(getUnitPrice(item))}
                  </p>
                  <p className="text-sm text-gray-600">
                    Discount: {getDiscountLabel(item)}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    Total: NGN {naira.format(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Payment Summary</h2>
            <p className="text-sm text-gray-600">
              Subtotal: NGN {naira.format(order.subTotal)}
            </p>
            <p className="text-sm text-gray-600">
              Discount: -NGN {naira.format(order.totalDiscount)}
            </p>
            <p className="font-semibold text-gray-800">
              Grand Total: NGN {naira.format(order.grandTotal)}
            </p>
          </div>

          {/* Billing */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Billing Information</h2>
            <p>
              {order.billing.firstname} {order.billing.lastname}
            </p>
            <p className="text-sm text-gray-500">
              {order.billing.streetAddress}, {order.billing.city},{" "}
              {order.billing.state}
            </p>
          </div>
        </section>
      </main>

      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
