import express from "express";
import {
  getProductLikes,
  getUserLikedProducts,
  toggleProductLike,
  getUserWishlistCount,
} from "../controllers/likeController.js";
import {
  optionalAuth,
  attachSession,
  verifyToken,
} from "../middleware/auth.js";

const router = express.Router();

router.get("/product/:productId", getProductLikes);
router.post("/:productId/like", optionalAuth, attachSession, toggleProductLike);
router.get("/user/:userId", getUserLikedProducts);
router.get("/user/:userId/count", verifyToken, getUserWishlistCount);

export default router;
