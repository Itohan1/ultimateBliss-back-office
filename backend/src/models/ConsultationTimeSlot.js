import mongoose from "mongoose";

const ConsultationTimeSlotSchema = new mongoose.Schema(
  {
    timeSlotId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    startTime: {
      type: String, // "09:00"
      required: true,
    },

    endTime: {
      type: String, // "10:00"
      required: true,
    },

    label: {
      type: String, // "9:00 AM - 10:00 AM"
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ConsultationTimeSlot",
  ConsultationTimeSlotSchema
);
