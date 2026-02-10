import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true, // e.g. "notification.created"
    },
    url: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Webhook", webhookSchema);
