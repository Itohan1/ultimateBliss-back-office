import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { v4 as uuidv4 } from "uuid";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        adminId: admin.adminId,
        email: admin.email,
        role: "admin", // 🔥 hardcoded & safe
        isSuperAdmin: admin.isSuperAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      admin: {
        adminId: admin.adminId,
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
      },
    });
  } catch (err) {
    console.error("Admin login failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createFirstSuperAdmin = async (req, res) => {
  try {
    const existingSuper = await Admin.findOne({ isSuperAdmin: true });
    if (existingSuper) {
      return res
        .status(403)
        .json({ message: "Superadmin already exists. Remove this route!" });
    }

    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = new Admin({
      adminId: uuidv4(), // <-- generate unique adminId
      firstname,
      lastname,
      email,
      password, // pre-save hook will hash it
      isSuperAdmin: true,
    });

    await admin.save();

    res.status(201).json({
      message: "Superadmin created successfully",
      admin: {
        adminId: admin.adminId,
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create normal admin
export const createAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, password, isSuperAdmin } = req.body;

    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({
      adminId: uuidv4(), // <-- generate unique adminId
      firstname,
      lastname,
      email,
      password, // pre-save hook will hash it
      isSuperAdmin: isSuperAdmin || false,
    });

    await admin.save();

    res.status(201).json({
      adminId: admin.adminId,
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
    });
  } catch (err) {
    console.error("Create admin failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password"); // hide password
    res.json(admins);
  } catch (err) {
    console.error("Get admins failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error("Get admin failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, password, isSuperAdmin } = req.body;

    const updateData = { firstname, lastname, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (isSuperAdmin !== undefined) updateData.isSuperAdmin = isSuperAdmin;

    const admin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error("Update admin failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Delete admin failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminStatus = async (req, res) => {
  try {
    console.log("This is the admin here", req.user);
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.isSuperAdmin) {
      return res.status(400).json({ message: "Cannot deactivate super admin" });
    }

    admin.isActive = isActive;
    await admin.save();

    res.json({ message: "Status updated", admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCurrentAdminProfile = async (req, res) => {
  try {
    const { firstname, lastname, email } = req.body;

    const admin = await Admin.findOne({ adminId: req.user?.adminId });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (typeof firstname === "string") admin.firstname = firstname.trim();
    if (typeof lastname === "string") admin.lastname = lastname.trim();

    if (typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }

      const existing = await Admin.findOne({
        email: normalizedEmail,
        _id: { $ne: admin._id },
      });

      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      admin.email = normalizedEmail;
    }

    if (!admin.firstname || !admin.lastname) {
      return res
        .status(400)
        .json({ message: "Firstname and lastname are required" });
    }

    await admin.save();

    return res.json({
      message: "Profile updated successfully",
      admin: {
        _id: admin._id,
        adminId: admin.adminId,
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (err) {
    console.error("Update current admin profile failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const changeCurrentAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const admin = await Admin.findOne({ adminId: req.user?.adminId }).select(
      "+password",
    );
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "New password must be different from current password" });
    }

    admin.password = newPassword;
    await admin.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change current admin password failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
