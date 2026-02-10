import express from "express";
import multer from "multer";
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

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/ads",
  filename: (req, file, cb) =>
    cb(null, `ad_${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage });

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
