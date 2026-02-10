import express from "express";
import {
  createLearn,
  getAllLearn,
  getLearnById,
  deleteLearn,
  updateLearn,
} from "../controllers/learnController.js";
import { verifyToken, adminMiddleware } from "../middleware/auth.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* Admin */
router.post("/", protect, adminOnly, upload.single("image"), createLearn);
router.put("/:id", protect, adminOnly, upload.single("image"), updateLearn);
router.get("/", getAllLearn);
router.get("/:id", getLearnById);
router.delete("/:id", protect, adminOnly, deleteLearn);

export default router;
