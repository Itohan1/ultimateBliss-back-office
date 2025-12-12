import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { v4 as uuid4 } from "uuid";

const userId = uuid4();

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      userId,
      email,
      password: hashedPassword,
      status: "Active",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser.userId,
        email: newUser.email,
        status: newUser.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const editUser = async (req, res) => {
  try {
    const userId = req.params.userId; // ID from URL
    const currentUserId = req.user.id; // ID from token/session middleware
    const { email, phoneNumber, address, dateOfBirth } = req.body;

    // 1️⃣ Validate: user can only edit their own account
    if (userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this account" });
    }

    // 2️⃣ Check if email already exists (only if email is being updated)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // 3️⃣ Update only fields provided
    const updatedData = {};

    if (email) updatedData.email = email;
    if (phoneNumber) updatedData.phoneNumber = phoneNumber;
    if (address) updatedData.address = address;
    if (dateOfBirth) updatedData.dateOfBirth = dateOfBirth;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    ).select("-password"); // remove password from response

    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Edit user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
