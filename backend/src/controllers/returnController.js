import ReturnItem from "../models/ReturnItem.js";
import Inventory from "../models/Inventory.js";

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

    let inventoryAdjusted = false;

    // Inventory subtraction rules
    const canAdjustInventory =
      adjustInventory === true && type !== "customer_return"; // 👈 IMPORTANT

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

      if (product.quantity > availableStock) {
        return res.status(400).json({
          message: "Damaged quantity exceeds available stock",
        });
      }

      inventoryItem.inventory.stockNumber -= product.quantity;
      await inventoryItem.save();

      inventoryAdjusted = true;
    }

    const returnItem = await ReturnItem.create({
      type,
      adjustInventory,
      contact,
      product,
      reason,
      image: req.file ? `${uploads}${req.file.filename}` : null,
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
    if (adjustInventory !== undefined)
      returnItem.adjustInventory = adjustInventory;

    // ❌ DO NOT TOUCH product object on update
    // ❌ DO NOT TOUCH contact object on update

    // Handle new image
    if (req.file) {
      returnItem.image = `/uploads/returns/${req.file.filename}`;
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

    await returnItem.remove();

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
