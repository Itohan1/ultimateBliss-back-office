import express from "express";
import multer from "multer";
import {
  getTextAds,
  createTextAd,
  deleteTextAd,
  getImageAds,
  createImageAd,
  deleteImageAd,
} from "../controllers/adController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/ads"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `ad_${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage });

router.get("/text", getTextAds);
router.post("/text", createTextAd);
router.delete("/text/:id", deleteTextAd);

router.get("/image", getImageAds);
router.post("/image", upload.single("image"), createImageAd);
router.delete("/image/:id", deleteImageAd);

export default router;
