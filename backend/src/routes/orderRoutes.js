import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderStatuses,
  updateTransactionStatus,
  cancelOrder,
  updateShippingDetails,
  disputeOrder,
  settleDispute,
} from "../controllers/orderController.js";
import {
  verifyToken,
  adminMiddleware,
  optionalAuth,
  attachSession,
} from "../middleware/auth.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";
import Order from "../models/Order.js";

const router = express.Router();

// User routes
router.post("/", optionalAuth, attachSession, createOrder);
router.get("/my-orders", verifyToken, getUserOrders);

// Admin rorouter.post("/", verifyToken, createOrder);
router.post("/admin", protect, adminOnly, createOrder);
router.get("/admin/my-orders", protect, adminOnly, getUserOrders);
router.get("/", getAllOrders);
router.patch("/:orderId/shipping", protect, adminOnly, updateShippingDetails);
router.patch("/:orderId/dispute", verifyToken, disputeOrder);
router.patch("/:orderId/settle-dispute", protect, adminOnly, settleDispute);
router.patch("/:orderId/cancel", verifyToken, cancelOrder);
router.patch("/admin/:orderId/cancel", protect, adminOnly, cancelOrder);
router.patch("/:orderId/status", protect, adminOnly, updateOrderStatus);

router.patch(
  "/:orderId/transaction-status",
  protect,
  adminOnly,
  updateTransactionStatus,
);

// Optional: update both
router.patch("/:orderId/statuses", protect, adminOnly, updateOrderStatuses);

router.get("/:orderId", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;
