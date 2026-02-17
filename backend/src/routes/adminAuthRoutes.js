import express from "express";
import Admin from "../models/Admin.js";
import {
  adminLogin,
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
  createFirstSuperAdmin,
  updateCurrentAdminProfile,
  changeCurrentAdminPassword,
} from "../controllers/adminAuthController.js";
import { protect, adminOnly, superAdminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// Login endpoint (public)
router.post("/login", adminLogin);

router.post("/", protect, superAdminOnly, createAdmin);

router.get("/", protect, adminOnly, getAdmins);
router.get("/me", protect, adminOnly, async (req, res) => {
  try {
    // req.user comes from the protect middleware
    const admin = await Admin.findOne({ adminId: req.user.adminId }).select(
      "-password",
    );
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error("Get current admin failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.patch("/me", protect, adminOnly, updateCurrentAdminProfile);
router.patch("/me/password", protect, adminOnly, changeCurrentAdminPassword);

router.post("/bootstrap", createFirstSuperAdmin);

router.get("/:id", protect, adminOnly, getAdminById);

router.put("/:id", protect, superAdminOnly, updateAdmin);

router.delete("/:id", protect, superAdminOnly, deleteAdmin);
router.patch("/:id/status", protect, superAdminOnly, updateAdminStatus);

// Get current logged-in admin

export default router;
