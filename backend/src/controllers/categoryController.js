import Category from "../models/Category.js";

/* ---------------- Category Endpoints ---------------- */

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, subcategories, isActive } = req.body;

    if (!name)
      return res.status(400).json({ message: "Category name is required" });

    const exists = await Category.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      description,
      subcategories: subcategories || [],
      isActive: isActive ?? true,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all active categories
export const getCategories = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const query = includeInactive ? {} : { isActive: true };

    const categories = await Category.find(query).sort({
      createdAt: -1,
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single category by id
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    console.error("Fetch category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- Subcategory Endpoints ---------------- */

// Add a subcategory to a category
export const addSubcategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Assign a numeric subId
    const maxId = category.subcategories.reduce(
      (max, sub) => (sub.subId > max ? sub.subId : max),
      0
    );

    category.subcategories.push({
      subId: maxId + 1,
      name,
      description,
      isActive: isActive ?? true,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Add subcategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a subcategory
export const updateSubcategory = async (req, res) => {
  try {
    const { id, subcategoryId } = req.params; // id = category ID, subcategoryId = numeric subId
    const { name, description, isActive } = req.body;

    // Find category first
    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Then find the subcategory inside
    const subcat = category.subcategories.find(
      (sub) => sub.subId === Number(subcategoryId)
    );

    if (!subcat)
      return res.status(404).json({ message: "Subcategory not found" });

    // Update fields
    if (name !== undefined) subcat.name = name;
    if (description !== undefined) subcat.description = description;
    if (isActive !== undefined) subcat.isActive = isActive;

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error("Update subcategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    const { id: categoryId, subcategoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const subIndex = category.subcategories.findIndex(
      (sub) => sub.subId === Number(subcategoryId)
    );
    if (subIndex === -1)
      return res.status(404).json({ message: "Subcategory not found" });

    // Remove subcategory
    category.subcategories.splice(subIndex, 1);
    await category.save();

    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
