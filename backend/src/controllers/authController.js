import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid4 } from "uuid";
import { login } from "./login.js";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{8,15}$/;
const normalizeEmail = (value = "") => value.trim().toLowerCase();
const normalizePhone = (value = "") => value.trim().replace(/[^\d+]/g, "");

export const registerUser = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;
    const normalizedEmail = normalizeEmail(email || "");
    const normalizedPhone = phoneNumber ? normalizePhone(phoneNumber) : "";
    const userId = uuid4().toString();

    if ((!normalizedEmail && !normalizedPhone) || !password) {
      return res.status(400).json({
        error: "Email or phone number, and password are required",
      });
    }

    if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please provide a valid email" });
    }

    if (normalizedPhone && !phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        error: "Please provide a valid phone number",
      });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    if (normalizedPhone) {
      const phoneInUse = await User.findOne({ phonenumber: normalizedPhone });
      if (phoneInUse) {
        return res.status(400).json({ error: "Phone number already in use" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const datejoined = new Date();

    const newUser = await User.create({
      userId,
      ...(normalizedEmail && { email: normalizedEmail }),
      password: hashedPassword,
      phonenumber: normalizedPhone || undefined,
      status: "Active",
      datejoined,
    });

    newUser.lastlogin = new Date();
    await newUser.save();

    const tokenPayload = {
      userId: newUser.userId,
      ...(newUser.email && { email: newUser.email }),
      ...(newUser.phonenumber && { phone: newUser.phonenumber }),
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        userId: newUser.userId,
        email: newUser.email || "",
        phonenumber: newUser.phonenumber,
        status: newUser.status,
      },
    });
  } catch (err) {
    console.error("Registration failed", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const editUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.userId;
    const {
      email,
      phoneNumber,
      address,
      firstname,
      lastname,
      password,
      currentPassword,
    } = req.body;

    if (userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this account" });
    }

    const user = await User.findOne({ userId }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only check current password if changing password
    if (password) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required to change password" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Update other fields
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (phoneNumber) {
      const normalizedPhone = normalizePhone(phoneNumber);
      if (!phoneRegex.test(normalizedPhone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }
      const existingPhone = await User.findOne({ phonenumber: normalizedPhone });
      if (existingPhone && existingPhone.userId !== userId) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
      user.phonenumber = normalizedPhone;
    }
    if (address) user.address = address;
    if (email) {
      const normalizedEmail = normalizeEmail(email);
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail && existingEmail.userId !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = normalizedEmail;
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    return res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Edit user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "firstname userId lastname email phonenumber status datejoined lastlogin",
    );
    res.status(200).json(users);
  } catch (err) {
    console.err("Failed to fetch users", err);
    res.status(500).json({ message: "Server error unable to fetch Users" });
  }
};

export const findUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.userId;

    if (userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this account" });
    }
    const user = await User.findOne({ userId }).select(
      "firstname lastname email phonenumber status datejoined lastlogin password",
    );

    if (!user) {
      res.status(400).json({ message: "User was not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.err("failed to fetch");
  }
};

export const findUserAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ userId }).select(
      "firstname lastname email phonenumber status datejoined lastlogin address",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("failed to fetch user (admin)", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserStatusAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { status } = req.body;

    if (!["Active", "Suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findOneAndUpdate(
      { userId },
      { status },
      { new: true }
    ).select("firstname lastname email phonenumber status datejoined lastlogin address");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("failed to update user status (admin)", err);
    return res.status(500).json({ message: "Server error" });
  }
};
