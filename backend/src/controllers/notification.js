import {
  createNotification,
  getUserNotifications,
  getNotificationById,
  getAdminNotifications,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.js";

/**
 * POST /notifications
 */
export async function postNotification(req, res) {
  try {
    const notification = await createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
}

/**
 * GET /notifications/user/:userId
 */
export async function getNotifications(req, res) {
  try {
    const notifications = await getUserNotifications(req.params.userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAdminNotificationsController(req, res) {
  try {
    const notifications = await getAdminNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * GET /notifications/:id
 */
export async function getNotification(req, res) {
  try {
    const notification = await getNotificationById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * PATCH /notifications/:id
 */
export async function updateNotificationById(req, res) {
  try {
    const notification = await updateNotification(req.params.id, req.body);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * PATCH /notifications/:id/read
 */
export async function markAsRead(req, res) {
  try {
    const notification = await markNotificationAsRead(req.params.id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * PATCH /notifications/user/:userId/read-all
 */
export async function markAllAsRead(req, res) {
  try {
    await markAllNotificationsAsRead(req.params.userId);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * DELETE /notifications/:id
 */
export async function deleteNotificationById(req, res) {
  try {
    await deleteNotification(req.params.id);
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
