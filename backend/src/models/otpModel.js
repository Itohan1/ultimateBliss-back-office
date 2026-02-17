// models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  channel: { type: String, enum: ["email", "whatsapp"], default: "email" },
  target: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Number, required: true },
});

export default mongoose.model("Otp", otpSchema);
