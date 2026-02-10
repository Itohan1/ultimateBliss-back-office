import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../features/notificationsSlice";
import type { RootState } from "../store";
import { socket } from "../utils/socket.ts"; // import socket from new file

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsListener() {
  const dispatch = useDispatch();
  const admin = useSelector((state: RootState) => state.adminAuth.admin);
  const adminId = admin?.adminId || localStorage.getItem("adminId");
  console.log(`The notification is showing at this point ${admin}`);
  // Connect and join room
  useEffect(() => {
    if (!adminId) {
      console.log("This is not admin");
      return;
    }

    socket.connect();

    socket.emit("join", {
      userId: adminId, // ✅ THIS MUST MATCH BACKEND
      role: "admin",
    });
    console.log("This is an admin");
    return () => {
      socket.disconnect();
    };
  }, [adminId]);

  // Listen for notifications
  useEffect(() => {
    console.log("The notification is showing you are safe");
    socket.on("notification", (notification: Notification) => {
      toast(
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "4px 2px",
            maxWidth: "320px",
          }}
        >
          {/* Accent bar / icon */}
          <div
            style={{
              width: "4px",
              borderRadius: "4px",
              backgroundColor: "#7c3aed", // purple accent
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "text-pink-600",
              }}
            >
              {notification.title}
            </strong>

            <span
              style={{
                fontSize: "13px",
                color: "#4b5563",
                lineHeight: 1.4,
              }}
            >
              {notification.message}
            </span>

            <span
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                marginTop: "4px",
              }}
            >
              Just now
            </span>
          </div>
        </div>,
      );

      dispatch(addNotification(notification));
    });

    return () => {
      socket.off("notification");
    };
  }, [dispatch]);

  return null;
}
