import mongoose from "mongoose";

const ConsultationBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // UUID
      required: true,
    },

    consultationPlanId: {
      type: Number,
      ref: "ConsultationPlan",
      required: true,
    },

    timeSlotId: {
      type: Number,
      ref: "ConsultationTimeSlot",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    transactionStatus: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },

    paymentExpiresAt: {
      type: Date,
      required: true,
    },

    transactionId: {
      type: String,
    },

    paymentMethod: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ConsultationBooking", ConsultationBookingSchema);
