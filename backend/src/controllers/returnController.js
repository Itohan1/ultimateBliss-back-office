import ReturnItem from "../models/ReturnItem.js";
import Inventory from "../models/Inventory.js";
import { uploadImageBuffer } from "../services/media.js";

const toBoolean = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

/* ================================
   CREATE RETURN / DAMAGED ITEM
================================ */
// controllers/returnController.js
export const createReturnItem = async (req, res) => {
  try {
    const { type, contact, product, reason, adjustInventory } = req.body;

    if (
      !type ||
      !contact?.name ||
      !contact?.phone ||
      !contact?.address ||
      !product?.productId ||
      !product?.productName ||
      !product?.category?.categoryId ||
      !product?.category?.categoryName ||
      !product?.subcategory?.subcategoryId ||
      !product?.subcategory?.subcategoryName ||
      !product?.quantity ||
      !reason
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const shouldAdjustInventory =
      type === "damaged"
        ? true
        : type === "customer_return"
          ? false
          : toBoolean(adjustInventory);
    const quantity = Number(product.quantity);
    let inventoryAdjusted = false;

    // Inventory subtraction rules
    const canAdjustInventory =
      shouldAdjustInventory && type !== "customer_return"; // 👈 IMPORTANT

    if (canAdjustInventory) {
      const inventoryItem = await Inventory.findOne({
        productId: product.productId,
      });

      if (!inventoryItem) {
        return res.status(404).json({
          message: "Inventory product not found",
        });
      }

      const availableStock = inventoryItem.inventory.stockNumber;

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      if (quantity > availableStock) {
        return res.status(400).json({
          message: "Damaged quantity exceeds available stock",
        });
      }

      inventoryItem.inventory.stockNumber -= quantity;
      await inventoryItem.save();

      inventoryAdjusted = true;
    }

    let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, {
        folder: "returns",
        publicIdPrefix: "return",
      });
      imageUrl = uploadResult.url;
    }
    const returnItem = await ReturnItem.create({
      type,
      adjustInventory: shouldAdjustInventory,
      contact,
      product: { ...product, quantity },
      reason,
      image: imageUrl,
      inventoryAdjusted,
    });

    res.status(201).json({
      message: "Return item recorded successfully",
      returnItem,
    });
  } catch (err) {
    console.error("Create return item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   UPDATE RETURN / DAMAGED ITEM
================================ */
export const updateReturnItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reason, adjustInventory } = req.body;

    const returnItem = await ReturnItem.findById(id);
    if (!returnItem) {
      return res.status(404).json({ message: "Return item not found" });
    }

    // ✅ Only update fields that admins are allowed to edit
    if (type) returnItem.type = type;
    if (reason) returnItem.reason = reason;
    if (adjustInventory !== undefined) {
      returnItem.adjustInventory =
        returnItem.type === "damaged"
          ? true
          : returnItem.type === "customer_return"
            ? false
            : toBoolean(adjustInventory);
    }

    // ❌ DO NOT TOUCH product object on update
    // ❌ DO NOT TOUCH contact object on update

    // Handle new image
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, {
        folder: "returns",
        publicIdPrefix: "return",
      });
      returnItem.image = uploadResult.url;
    }

    await returnItem.save();

    res.status(200).json(returnItem);
  } catch (err) {
    console.error("Update return item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   DELETE RETURN / DAMAGED ITEM
================================ */
export const deleteReturnItem = async (req, res) => {
  try {
    const { id } = req.params;

    const returnItem = await ReturnItem.findById(id);
    if (!returnItem)
      return res.status(404).json({ message: "Return item not found" });

    await returnItem.deleteOne();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete return item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllReturnItems = async (req, res) => {
  try {
    const returns = await ReturnItem.find().sort({ createdAt: -1 });
    res.status(200).json(returns);
  } catch (err) {
    console.error("Fetch returns error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   GET SINGLE RETURN
================================ */
export const getReturnItem = async (req, res) => {
  try {
    const { id } = req.params;

    const returnItem = await ReturnItem.findById(id);

    if (!returnItem) {
      return res.status(404).json({ message: "Return item not found" });
    }

    res.status(200).json(returnItem);
  } catch (err) {
    console.error("Fetch return error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
