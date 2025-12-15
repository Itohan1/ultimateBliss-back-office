import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/", getAllBookings);
router.get("/:bookingId", getBookingById);
router.put("/:bookingId", updateBooking);
router.delete("/:bookingId", deleteBooking);

export default router;
