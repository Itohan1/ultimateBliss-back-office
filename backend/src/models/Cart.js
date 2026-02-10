import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    orderItemId: {
      type: Number,
      required: true,
    },

    productId: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    discountType: {
      type: String,
      enum: ["free", "promotion", "none"],
      default: "none",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    cartId: {
      type: Number,
      required: true,
      unique: true,
    },

    userId: {
      type: String, // UUID
      default: null,
      index: true,
    },

    sessionId: {
      type: String,
      default: null,
      index: true,
    },

    orderId: {
      type: Number,
      required: true,
    },

    items: [CartItemSchema],

    subTotal: {
      type: Number,
      default: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: { expires: "7d" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);
