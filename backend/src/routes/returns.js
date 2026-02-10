import express from "express";
import {
  createReturnItem,
  getAllReturnItems,
  getReturnItem,
  updateReturnItem,
  deleteReturnItem,
} from "../controllers/returnController.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";
import multer from "multer";

const router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) =>
    cb(null, `ad_${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage });
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
