import mongoose from "mongoose";

// models/ReturnItem.js
const returnItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["customer_return", "supplier_return", "damaged"],
      required: true,
    },

    adjustInventory: {
      type: Boolean,
      default: false,
    },

    contact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },

    product: {
      productId: { type: Number, required: true },
      productName: { type: String, required: true },

      category: {
        categoryId: { type: String, required: true },
        categoryName: { type: String, required: true },
      },

      subcategory: {
        subcategoryId: { type: Number, required: true },
        subcategoryName: { type: String, required: true },
      },

      quantity: { type: Number, required: true },
      details: String,
    },

    reason: {
      type: String,
      required: true,
    },

    image: String,

    inventoryAdjusted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
export default mongoose.model("ReturnItem", returnItemSchema);
