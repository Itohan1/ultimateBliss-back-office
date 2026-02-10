import express from "express";
import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  getMyCart,
  getCart,
} from "../controllers/cartController.js";
import {
  adminAddToCart,
  adminIncreaseQuantity,
  adminDecreaseQuantity,
  adminRemoveFromCart,
  adminGetMyCart,
} from "../controllers/adminCartController.js";
import {
  verifyToken,
  attachSession,
  optionalAuth,
} from "../middleware/auth.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(attachSession);
router.use(optionalAuth);
router.post("/", addToCart);
router.get("/me", getMyCart);
router.get("/:cartId", getCart);
router.patch("/:cartId/increase/:orderItemId", increaseQuantity);
router.patch("/:cartId/decrease/:orderItemId", decreaseQuantity);
router.delete("/:cartId/remove/:orderItemId", removeFromCart);
router.post("/admin", protect, adminOnly, adminAddToCart);
router.get("/admin/me", protect, adminOnly, adminGetMyCart);
router.patch("/admin/:cartId/increase/:orderItemId", adminIncreaseQuantity);
router.patch("/admin/:cartId/decrease/:orderItemId", adminDecreaseQuantity);
router.delete("/admin/:cartId/remove/:orderItemId", adminRemoveFromCart);

export default router;
