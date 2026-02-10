import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid4 } from "uuid";
import { login } from "./login.js";

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = uuid4().toString();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const datejoined = new Date();

    const newUser = await User.create({
      userId,
      email,
      password: hashedPassword,
      status: "Active",
      datejoined,
    });

    newUser.lastlogin = new Date();
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        userId: newUser.userId,
        email: newUser.email,
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

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Update other fields
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (phoneNumber) user.phonenumber = phoneNumber;
    if (address) user.address = address;
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail.userId !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
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
      "firstname userId lastname email status datejoined lastlogin",
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
      "firstname lastname email status datejoined lastlogin password",
    );

    if (!user) {
      res.status(400).json({ message: "User was not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.err("failed to fetch");
  }
};
