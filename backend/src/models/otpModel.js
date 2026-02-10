// models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Number,
});

export default mongoose.model("Otp", otpSchema);
