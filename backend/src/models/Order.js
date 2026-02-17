import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },

    discountedPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },

    discount: { type: Number, default: 0 },
    discountType: {
      type: String,
      enum: ["free", "percentage", "flat", "none"],
      default: "none",
    },

    // ⭐ ADD THESE
    freeQuantity: { type: Number, default: 0 },
    freeItemDescription: { type: String },
    minPurchaseQuantity: { type: Number, default: 1 },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true },
    userId: { type: String, required: true }, // UUID from your auth system
    items: [OrderItemSchema],
    subTotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Checkout info
    billing: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      company: { type: String },
      streetAddress: { type: String, required: true },
      apartment: { type: String },
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      postcode: { type: String },
    },

    paymentMethodId: { type: String, required: true },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    transactionStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "packaging",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    delivery: {
      description: { type: String },
      estimatedDelivery: { type: Date },
    },

    isDisputed: { type: Boolean, default: false },

    disputeWindowExpiresAt: { type: Date },

    hasBeenDisputed: { type: Boolean, default: false },

    completedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Order", OrderSchema);
