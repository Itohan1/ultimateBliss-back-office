import Notification from "../models/Notification.js";
import { sendEmail } from "./email.js";
import { io } from "../../server.js";
import { sendPushNotification } from "./push.js";
import { triggerWebhooks } from "./webhook.js";
import { notificationEmailTemplate } from "../utils/emailTemplates.js";
/**
 * CREATE notification (with side effects)
 */
export async function createNotification({
  userId = null,
  recipientRole,
  title,
  message,
  type,
  metadata = {},
  email,
}) {
  // 1️⃣ Save notification
  const notification = await Notification.create({
    userId,
    recipientRole,
    title,
    message,
    type,
    metadata,
  });

  // 2️⃣ REAL-TIME SOCKET PUSH
  if (userId) {
    io.to(`${recipientRole}:${userId}`).emit("notification", notification);
  } else {
    io.to(`${recipientRole}:*`).emit("notification", notification);
  }
  console.log("THE EMAIL GOT HERE");
  // 3️⃣ EMAIL
  if (!email) {
    console.log("❌ Email skipped — no email provided");
  } else {
    console.log("📨 About to send email to:", email);

    await sendEmail({
      to: email,
      subject: title,
      html: notificationEmailTemplate({
        title,
        message,
      }),
    });

    console.log("✅ sendEmail() finished");
  }

  console.log("THE NOTIFICATION GOT HERE");
  // 4️⃣ PUSH (mobile / external)
  await sendPushNotification({
    userId,
    role: recipientRole,
    title,
    message,
  });

  console.log("THE NOTIFICATION GOT HERE TOOOO");
  // 5️⃣ WEBHOOK (you already built this 🔥)
  await triggerWebhooks("notification.created", {
    notificationId: notification._id,
    userId,
    recipientRole,
    title,
    message,
    type,
    metadata,
    createdAt: notification.createdAt,
  });

  return notification;
}

/**
 * GET all notifications for a user
 */
export async function getUserNotifications(userId) {
  return Notification.find({
    $or: [{ userId }, { recipientRole: "both" }],
  }).sort({ createdAt: -1 });
}

export async function getAdminNotifications() {
  return Notification.find({
    recipientRole: { $in: ["admin", "both"] },
  }).sort({ createdAt: -1 });
}

/**
 * GET single notification
 */
export async function getNotificationById(notificationId) {
  return Notification.findById(notificationId);
}

/**
 * UPDATE notification (generic)
 */
export async function updateNotification(notificationId, updateData) {
  return Notification.findByIdAndUpdate(notificationId, updateData, {
    new: true,
  });
}

/**
 * MARK one notification as read
 */
export async function markNotificationAsRead(notificationId) {
  return Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true },
  );
}

/**
 * MARK all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId) {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

/**
 * DELETE notification
 */
export async function deleteNotification(notificationId) {
  return Notification.findByIdAndDelete(notificationId);
}

/**
 * GET unread count (very useful for UI badges)
 */
export async function getUnreadCount(userId) {
  return Notification.countDocuments({
    userId,
    isRead: false,
  });
}
