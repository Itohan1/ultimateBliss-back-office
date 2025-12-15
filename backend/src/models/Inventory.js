import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    unitOfMeasure: {
      type: String,
      trim: true,
    },
    inventory: {
      stockNumber: {
        type: Number,
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 0,
      },
      expiryDate: {
        type: Date,
        default: null,
      },
    },
    pricing: {
      costPrice: {
        type: Number,
        default: 0,
      },
      sellingPrice: {
        type: Number,
        default: 0,
      },
    },
    productImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
