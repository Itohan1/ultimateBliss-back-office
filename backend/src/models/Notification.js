import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // If null → broadcast (admins or all users)
    userId: {
      type: String,
      index: true,
      default: null,
    },

    recipientRole: {
      type: String,
      enum: ["user", "admin", "both"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["BOOKING", "PAYMENT", "SYSTEM", "ORDER"],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
