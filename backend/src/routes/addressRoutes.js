import express from "express";
import {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";
import { verifyToken } from "../middleware/auth.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// User only
router.post("/", verifyToken, addAddress);
router.get("/", verifyToken, getUserAddresses);
router.patch("/:addressId", verifyToken, updateAddress);
router.delete("/:addressId", verifyToken, deleteAddress);

export default router;
