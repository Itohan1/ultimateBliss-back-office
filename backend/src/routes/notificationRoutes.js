import express from "express";
import {
  postNotification,
  getNotifications,
  getNotification,
  updateNotificationById,
  deleteNotificationById,
  getAdminNotificationsController,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

/* Create */
router.post("/", postNotification);

/* Read */
router.get("/admin", protect, adminOnly, getAdminNotificationsController);
router.get("/:id", getNotification);
router.get("/user/:userId", getNotifications);
/* Update */
router.patch("/:id", updateNotificationById);
router.patch("/:id/read", markAsRead);
router.patch("/user/:userId/read-all", markAllAsRead);

/* Delete */
router.delete("/:id", deleteNotificationById);

export default router;
