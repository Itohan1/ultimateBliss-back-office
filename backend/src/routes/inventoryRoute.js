import express from "express";
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getBestOffers,
  addReview,
  getReviews,
} from "../controllers/inventoryController.js";
import {
  verifyToken,
  optionalAuth,
  attachSession,
} from "../middleware/auth.js";
import { toggleProductLike } from "../controllers/likeController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createInventoryItem);
router.get("/best-offers", optionalAuth, attachSession, getBestOffers);
router.get("/", optionalAuth, attachSession, getInventoryItems);
router.get("/:productId", getInventoryItem);
router.put(
  "/:productId",
  verifyToken,
  upload.single("image"),
  updateInventoryItem,
);
router.delete("/:productId", verifyToken, deleteInventoryItem);
router.post("/:productId/review", verifyToken, addReview);
router.get("/:productId/reviews", getReviews);

/* LIKE / UNLIKE */

export default router;
