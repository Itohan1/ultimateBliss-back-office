import Inventory from "../models/Inventory.js";
import { v4 as uuid4 } from "uuid";

export const createInventoryItem = async (req, res) => {
  try {
    const {
      productId,
      productName,
      sku,
      category,
      subcategory,
      brandName,
      manufacturer,
      unitOfMeasure,
      inventory,
      pricing,
      productImage,
    } = req.body;

    if (!productId || !productName || !sku || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Inventory.findOne({ productId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Product with this ID already exists" });
    }

    const newItem = await Inventory.create({
      productId,
      productName,
      sku,
      category,
      subcategory,
      brandName,
      manufacturer,
      unitOfMeasure,
      inventory,
      pricing,
      productImage,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Inventory item created successfully",
      product: newItem,
    });
  } catch (err) {
    console.error("Error creating inventory item:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInventoryItems = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const item = await Inventory.findOne({ productId });
    if (!item) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const updatedData = req.body;

    const updatedItem = await Inventory.findOneAndUpdate(
      { productId },
      { $set: updatedData },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Inventory item updated successfully",
      product: updatedItem,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedItem = await Inventory.findOneAndDelete({ productId });

    if (!deletedItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Server error" });
  }
};
