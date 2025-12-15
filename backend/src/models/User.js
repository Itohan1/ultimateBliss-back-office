import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    firstname: {
      type: String,
      lowercase: true,
      trim: true,
    },
    lastname: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phonenumber: {
      type: String,
      validate: {
        validator: (v) => !v || v.length >= 10,
        message: "Phone number must be at least 10 characters",
      },
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
    },
    lastlogin: {
      type: Date,
      default: null,
    },
    datejoined: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
