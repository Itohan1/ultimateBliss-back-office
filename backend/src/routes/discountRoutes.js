import express from "express";
import { verifyToken, adminMiddleware } from "../middleware/auth.js";
import {
  getDiscountedItems,
  applyDiscount,
  removeDiscount,
} from "../controllers/discountController.js";

const router = express.Router();

router.get("/items", verifyToken, adminMiddleware, getDiscountedItems);
router.patch("/apply", verifyToken, adminMiddleware, applyDiscount);
router.patch("/remove", verifyToken, adminMiddleware, removeDiscount);

export default router;
