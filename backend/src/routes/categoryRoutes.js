import express from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/categoryController.js";

const router = express.Router();

/* ----- Category Routes ----- */
router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

/* ----- Subcategory Routes ----- */
router.post("/:id/subcategories", addSubcategory); // Add subcategory to category
router.put("/:id/subcategories/:subcategoryId", updateSubcategory); // Update a subcategory
router.delete("/:id/subcategories/:subcategoryId", deleteSubcategory); // Delete a subcategory

export default router;
