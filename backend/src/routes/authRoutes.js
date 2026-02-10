import express from "express";
import {
  registerUser,
  editUser,
  getUsers,
  findUser,
} from "../controllers/authController.js";

import { login } from "../controllers/login.js";
import { verifyToken } from "../middleware/auth.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";

const router = express.Router();

router.post("/register", registerUser);
router.put("/users/:userId", verifyToken, editUser);
router.get("/users", getUsers);
router.get("/users/:userId", verifyToken, findUser);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
