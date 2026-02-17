import Aside from "../components/Aside";
import Header from "../components/Header";
import {
  useGetAdminNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
} from "../services/notificationApi";
import { Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal.tsx";

export default function Notifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: notifications = [], isLoading } =
    useGetAdminNotificationsQuery();

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    await deleteNotification(selectedDeleteId);
    setSelectedDeleteId(null);
  };

  //if (isLoading) return <p className="p-6">Loading notifications...</p>;

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
          {isLoading ? (
            <p className="p-6">Loading notifications...</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-pink-700">
                  Notifications
                </h1>
                <button
                  onClick={() => markAllAsRead()}
                  className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                >
                  Mark all as read
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow divide-y">
                {notifications.length === 0 && (
                  <p className="p-6 text-gray-500">No notifications yet</p>
                )}

                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex justify-between items-start p-4 ${
                      n.isRead ? "bg-white" : "bg-pink-50"
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold">{n.title}</h3>
                      <p className="text-gray-600 text-sm">{n.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedDeleteId(n._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <ConfirmModal
        isOpen={selectedDeleteId !== null}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setSelectedDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
