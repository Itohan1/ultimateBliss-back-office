import express from "express";
import {
  createPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  changePaymentMethodStatus,
} from "../controllers/paymentController.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin routes
router.get("/", getPaymentMethods);

router.post("/", protect, adminOnly, createPaymentMethod);
router.put("/:id", protect, adminOnly, updatePaymentMethod);
router.delete("/:id", protect, adminOnly, deletePaymentMethod);
router.patch("/:id/status", protect, adminOnly, changePaymentMethodStatus);

export default router;
