import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import {
  useGetUserQuery,
  useUpdateUserStatusAdminMutation,
} from "../services/authApi";
import { useGetAllOrdersQuery } from "../services/orderApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import toast from "react-hot-toast";
import LoginPopup from "../components/LoginPopup.tsx";
import { getErrorMessage } from "../getErrorMessage";
import ConfirmModal from "../components/ConfirmModal.tsx";

export default function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "Active" | "Suspended" | null
  >(null);
  const NAIRA = "\u20A6";

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetUserQuery(id ?? "", { skip: !id });
  const { data: orders = [] } = useGetAllOrdersQuery();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusAdminMutation();

  const recentOrders = useMemo(() => {
    if (!id) return [];
    return orders
      .filter((order) => order.userId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [orders, id]);

  useEffect(() => {
    if (!userError) return;
    const error = userError as FetchBaseQueryError;
    if ("status" in error && error.status === 401) {
      setShowLogin(true);
      return;
    }
    toast.error(getErrorMessage(userError, "Failed to load user details."));
  }, [userError]);

  if (!id) return <div className="p-6">User not found.</div>;
  if (isUserLoading) return <div className="p-6">Loading...</div>;
  if (isUserError || !user) {
    return (
      <div className="p-6">
        <p>User not found.</p>
        {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  const fullName = `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();
  const displayName = fullName || user.email || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";

  const handleStatusChange = () => {
    setPendingStatus(nextStatus);
    setIsStatusConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus || !id) return;
    try {
      await updateUserStatus({ userId: id, status: pendingStatus }).unwrap();
      toast.success(
        pendingStatus === "Suspended"
          ? "User suspended successfully."
          : "User activated successfully.",
      );
      setIsStatusConfirmOpen(false);
      setPendingStatus(null);
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) {
        setShowLogin(true);
        return;
      }
      toast.error(getErrorMessage(err, "Failed to update user status."));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-purple-950/20">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col w-full overflow-y-auto">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="mt-16 md:ml-64 p-2 sm:p-6 md:p-8">
          <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-300 mb-4">
            User Details
          </h1>

          <Breadcrumb
            items={[
              { label: "Users", onClick: () => navigate("/users") },
              { label: displayName },
            ]}
          />

          <div className="bg-white dark:bg-pink-900 p-6 rounded-2xl shadow mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-14 h-14 bg-pink-200 dark:bg-pink-700 rounded-full flex items-center justify-center text-xl font-bold text-pink-900 dark:text-white">
                {initial}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold dark:text-white break-words">
                  {displayName}
                </h2>
                <p className="text-gray-500 dark:text-gray-300 break-words">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <span
                className={`px-4 py-1 text-sm rounded-full font-medium ${
                  user.status === "Suspended"
                    ? "bg-red-200 text-red-700 dark:bg-red-700 dark:text-white"
                    : "bg-green-200 text-green-700 dark:bg-green-700 dark:text-white"
                }`}
              >
                {user.status ?? "Unknown"}
              </span>

              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600"
              >
                {nextStatus === "Suspended" ? "Suspend" : "Activate"}
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl shadow opacity-50 cursor-not-allowed"
                disabled
              >
                Delete
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-pink-900 p-6 rounded-2xl shadow mb-8">
            <h3 className="text-lg font-bold mb-4 dark:text-white">
              Personal Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <Detail
                label="Phone Number"
                value={(user as { phoneNumber?: string }).phoneNumber ?? "---"}
              />
              <Detail label="Email" value={user.email ?? "---"} />
              <Detail label="Date Joined" value={user.datejoined ?? "---"} />
              <Detail label="Last Login" value={user.lastlogin ?? "---"} />
              <Detail
                label="Address"
                value={(user as { address?: string }).address ?? "---"}
              />
              <Detail
                label="Date of Birth"
                value={(user as { dateOfBirth?: string }).dateOfBirth ?? "---"}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-pink-900 p-6 rounded-2xl shadow">
            <h3 className="text-lg font-bold mb-4 dark:text-white">
              Recent Orders
            </h3>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-pink-700">
                    <th className="py-3">Date</th>
                    <th className="py-3">Order ID</th>
                    <th className="py-3">Deal</th>
                    <th className="py-3">Unit</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="dark:text-white">
                  {recentOrders.length ? (
                    recentOrders.map((order) => {
                      const firstItem = order.items?.[0]?.name ?? "Order";
                      const extraCount =
                        (order.items?.length ?? 0) > 1
                          ? ` + ${(order.items?.length ?? 0) - 1} more`
                          : "";
                      const units = order.items?.reduce(
                        (total, item) => total + (item.quantity ?? 0),
                        0,
                      );
                      return (
                        <tr
                          key={order.orderId}
                          className="border-b dark:border-pink-700"
                        >
                          <td className="py-3">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td>{order.orderId}</td>
                          <td>{`${firstItem}${extraCount}`}</td>
                          <td>{units ?? 0}</td>
                          <td>
                            {NAIRA}
                            {order.grandTotal?.toLocaleString()}
                          </td>
                          <td className="text-yellow-600 font-medium">
                            {order.orderStatus}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="py-3" colSpan={6}>
                        No recent orders.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {recentOrders.length ? (
                recentOrders.map((order) => {
                  const firstItem = order.items?.[0]?.name ?? "Order";
                  const extraCount =
                    (order.items?.length ?? 0) > 1
                      ? ` + ${(order.items?.length ?? 0) - 1} more`
                      : "";
                  const units = order.items?.reduce(
                    (total, item) => total + (item.quantity ?? 0),
                    0,
                  );
                  return (
                    <div
                      key={order.orderId}
                      className="rounded-xl border border-gray-200 p-4 dark:border-pink-700"
                    >
                      <p className="font-semibold dark:text-white break-all">
                        {order.orderId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {`${firstItem}${extraCount}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Units: {units ?? 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Price: {NAIRA}
                        {order.grandTotal?.toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-yellow-600">
                        {order.orderStatus}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No recent orders.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      <ConfirmModal
        isOpen={isStatusConfirmOpen}
        title="Confirm Account Status Change"
        message={`Are you sure you want to ${
          pendingStatus === "Suspended" ? "suspend" : "activate"
        } this user account?`}
        confirmText={
          pendingStatus === "Suspended" ? "Suspend User" : "Activate User"
        }
        onCancel={() => {
          setIsStatusConfirmOpen(false);
          setPendingStatus(null);
        }}
        onConfirm={confirmStatusChange}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

interface DetailProp {
  label: string;
  value: string;
}

function Detail({ label, value }: DetailProp) {
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-300 text-sm">{label}</p>
      <p className="font-medium dark:text-white break-words">{value}</p>
    </div>
  );
}
