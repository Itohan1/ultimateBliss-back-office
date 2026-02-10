import express from "express";
import {
  createTimeSlot,
  getAllTimeSlots,
  getAvailableTimeSlots,
  updateTimeSlot,
  bookTimeSlot,
  deleteTimeSlot,
} from "../controllers/consultationTimeController.js";

import { verifyToken, adminMiddleware } from "../middleware/auth.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

/* Public */
router.get("/", getAvailableTimeSlots);
router.get("/all", getAllTimeSlots);

/* Admin */
router.post("/", verifyToken, adminMiddleware, createTimeSlot);
router.patch("/:timeSlotId", verifyToken, adminMiddleware, updateTimeSlot);

/* User booking */
router.post("/:timeSlotId/book", verifyToken, bookTimeSlot);
/* Admin */
router.delete("/:timeSlotId", protect, adminOnly, deleteTimeSlot);

export default router;
