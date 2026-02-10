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

    subcategory: String,
    brandName: String,
    manufacturer: String,
    unitOfMeasure: String,

    inventory: {
      stockNumber: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 0 },
      expiryDate: { type: Date, default: null },
    },

    pricing: {
      costPrice: { type: Number, default: 0 },
      sellingPrice: { type: Number, default: 0 },

      discount: { type: Number, default: 0, min: 0 },

      discountType: {
        type: String,
        enum: ["none", "percentage", "flat", "free"],
        default: "none",
      },

      // 🔥 NEW FREE PROMO STRUCTURE
      freeOffer: {
        minQuantityOfPurchase: { type: Number, default: 0 },
        freeItemQuantity: { type: Number, default: 0 },
        freeItemDescription: { type: String, default: "" },
      },

      discountedPrice: { type: Number, default: 0 },
      isDiscounted: { type: Boolean, default: false },
    },

    productImage: {
      type: String,
      default: null,
    },

    /* SOCIAL SIGNALS */
    totalLikes: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ================================
   VIRTUAL: DISCOUNTED PRICE
================================ */

inventorySchema.pre("save", function (next) {
  const pricing = this.pricing || {};

  pricing.discount = Math.max(0, pricing.discount || 0);

  if (pricing.sellingPrice < pricing.costPrice) {
    pricing.sellingPrice = pricing.costPrice;
  }

  let discounted = pricing.sellingPrice;

  if (pricing.discountType === "percentage" && pricing.discount > 0) {
    discounted =
      pricing.sellingPrice - (pricing.sellingPrice * pricing.discount) / 100;
  }

  if (pricing.discountType === "flat" && pricing.discount > 0) {
    discounted = pricing.sellingPrice - pricing.discount;
  }

  // FREE PROMO → price stays same
  discounted = Math.max(0, Math.round(discounted));

  pricing.discountedPrice = discounted;
  pricing.isDiscounted =
    discounted < pricing.sellingPrice ||
    (pricing.discountType === "free" &&
      pricing.freeOffer?.freeItemQuantity > 0);

  this.pricing = pricing;
});

export default mongoose.model("Inventory", inventorySchema);
