import mongoose from "mongoose";

// Subcategory schema
const subcategorySchema = new mongoose.Schema(
  {
    subId: { type: Number }, // will auto-assign
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false } // disable separate MongoDB _id
);

// Category schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subcategories: [subcategorySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to auto-assign subId
categorySchema.pre("save", function () {
  if (!this.isModified("subcategories")) return;

  let maxId = 0;

  this.subcategories.forEach((sub) => {
    if (sub.subId != null && sub.subId > maxId) maxId = sub.subId;
  });

  this.subcategories.forEach((sub) => {
    if (sub.subId == null) {
      maxId += 1;
      sub.subId = maxId;
    }
  });
});

export default mongoose.model("Category", categorySchema);
