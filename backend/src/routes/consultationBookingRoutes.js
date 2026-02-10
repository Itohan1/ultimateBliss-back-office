import express from "express";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  confirmPayment,
  getBookingById,
  updateBookingStatus,
  updateTransactionStatus,
  getAllBookings,
} from "../controllers/consultationBookingController.js";
import { verifyToken } from "../middleware/auth.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

/* User routes */
router.post("/", verifyToken, createBooking);
router.get("/", verifyToken, getUserBookings);
router.patch("/:bookingId/cancel", verifyToken, cancelBooking);

/* Payment route */
router.patch("/:bookingId/confirm-payment", verifyToken, confirmPayment);
router.get("/all", getAllBookings);
router.get("/:bookingId", getBookingById);
router.patch("/:bookingId/status", protect, adminOnly, updateBookingStatus);
router.patch(
  "/:bookingId/transaction-status",
  protect,
  adminOnly,
  updateTransactionStatus,
);
export default router;
