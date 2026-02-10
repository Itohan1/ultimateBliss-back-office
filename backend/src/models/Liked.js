import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
    productId: {
      type: Number,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* Prevent duplicate likes per user OR session */
LikeSchema.index(
  { productId: 1, userId: 1, sessionId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("Like", LikeSchema);
