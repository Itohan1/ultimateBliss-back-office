import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },

    // For TEXT advertisements
    text: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "text";
      },
    },

    // For IMAGE advertisements
    filename: {
      type: String,
      required: function () {
        return this.type === "image";
      },
    },

    url: {
      type: String,
      required: function () {
        return this.type === "image";
      },
    },

    // User who created the ad (from JWT)
    createdBy: {
      type: String, // UUID from token
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdOn",
      updatedAt: "updatedOn",
    },
  }
);

// Prevent model overwrite error in dev
const Ad = mongoose.models.Ad || mongoose.model("Ad", adSchema);

export default Ad;
