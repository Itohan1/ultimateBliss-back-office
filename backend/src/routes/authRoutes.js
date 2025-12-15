import express from "express";
import {
  registerUser,
  editUser,
  getUsers,
  findUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { login } from "../controllers/login.js";
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.post("/register", registerUser);
router.put("/users/:userId", verifyToken, editUser);
router.get("/users", verifyToken, getUsers);
router.get("/users/:userId", verifyToken, findUser);
router.post("/login", login);
router.post("/inventory", verifyToken, createInventoryItem);
router.get("/inventory", verifyToken, getInventoryItems);
router.get("/inventory/:productId", verifyToken, getInventoryItem);
router.put("/inventory/:productId", verifyToken, updateInventoryItem);
router.delete("/inventory/:productId", verifyToken, deleteInventoryItem);

export default router;
