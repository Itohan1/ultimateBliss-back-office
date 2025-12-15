import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: Number,
      unique: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      required: true,
    },

    price: {
      type: String,
      required: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["New", "Confirmed", "Completed", "Cancelled"],
      default: "New",
    },

    daysRemaining: {
      type: String,
    },

    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
