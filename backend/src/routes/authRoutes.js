import express from "express";
import { registerUser, editUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.put("/users/:userId", verifyToken, editUser);

export default router;
