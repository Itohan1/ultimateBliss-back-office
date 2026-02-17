import express from "express";
import {
  createReturnItem,
  getAllReturnItems,
  getReturnItem,
  updateReturnItem,
  deleteReturnItem,
} from "../controllers/returnController.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();
// ADMIN ROUTES
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"), // 👈 image field name
  createReturnItem,
);

router.get("/", getAllReturnItems);
router.get("/:id", getReturnItem);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateReturnItem,
);

router.delete("/:id", protect, adminOnly, deleteReturnItem);

export default router;
