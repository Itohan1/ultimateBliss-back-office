import mongoose from "mongoose";

const PaymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String }, // e.g., account number, card type
  isActive: { type: Boolean, default: true }, // available to customers
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PaymentMethod", PaymentMethodSchema);
