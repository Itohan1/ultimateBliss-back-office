import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createTextAd,
  getTextAds,
  deleteTextAd,
  createImageAd,
  getImageAds,
  deleteImageAd,
} from "../controllers/adController.js";
import { adProtect, protect, adminOnly } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Text ads
router.post("/text", protect, adminOnly, createTextAd);
router.get("/text", getTextAds);
router.delete("/text/:id", protect, adminOnly, deleteTextAd);

// Image ads
router.post(
  "/image",
  protect,
  adminOnly,
  upload.single("image"),
  createImageAd,
);
router.get("/image", getImageAds);
router.delete("/image/:id", protect, adminOnly, deleteImageAd);

export default router;
