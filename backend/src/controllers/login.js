import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Cart from "../models/Cart.js";

const normalizeEmail = (value = "") => value.trim().toLowerCase();
const normalizePhone = (value = "") => value.trim().replace(/[^\d+]/g, "");
const canonicalPhone = (value = "") => normalizePhone(value).replace(/\D/g, "");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{8,15}$/;

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const normalizedEmail = email?.includes("@") ? normalizeEmail(email) : "";
    const fallbackPhoneFromEmail = email && !email.includes("@") ? email : "";
    const normalizedPhone = normalizePhone(phone || fallbackPhoneFromEmail);

    /* ---------- Validate input ---------- */
    if ((!normalizedEmail && !normalizedPhone) || !password) {
      return res.status(400).json({
        message: "Email or phone number, and password are required",
      });
    }

    if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    if (normalizedPhone && !phoneRegex.test(normalizedPhone)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid phone number" });
    }

    /* ---------- Find user ---------- */
    const conditions = [];
    if (normalizedEmail) {
      conditions.push({ email: normalizedEmail });
    }
    if (normalizedPhone) {
      conditions.push({ phonenumber: normalizedPhone });
    }

    let user = await User.findOne({ $or: conditions }).select("+password");

    // Fallback for legacy phone formats already stored with symbols/spaces.
    if (!user && normalizedPhone) {
      const usersWithPhone = await User.find({
        phonenumber: { $exists: true, $ne: null },
      }).select("+password");

      const requestedPhone = canonicalPhone(normalizedPhone);
      user = usersWithPhone.find(
        (entry) => canonicalPhone(entry.phonenumber) === requestedPhone,
      );
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* ---------- Verify password ---------- */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* ---------- Handle guest cart → attach to user ---------- */
    const sessionId = req.headers["x-session-id"];

    if (sessionId && typeof sessionId === "string") {
      // 1️⃣ Move ALL guest carts from this session to the logged-in user
      await Cart.updateMany(
        { sessionId, userId: null },
        { userId: user.userId, sessionId: null },
      );

      // 2️⃣ OPTIONAL: If user already had a cart, merge duplicates (safe merge)
      const carts = await Cart.find({ userId: user.userId });

      if (carts.length > 1) {
        const primaryCart = carts[0];

        for (let i = 1; i < carts.length; i++) {
          const cartToMerge = carts[i];

          cartToMerge.items.forEach((guestItem) => {
            const existingItem = primaryCart.items.find(
              (item) => item.productId === guestItem.productId,
            );

            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
              existingItem.totalPrice =
                existingItem.quantity * existingItem.price -
                existingItem.discount * existingItem.quantity;
            } else {
              primaryCart.items.push(guestItem);
            }
          });

          await cartToMerge.deleteOne();
        }

        await primaryCart.save();
      }
    }

    /* ---------- Update login timestamp ---------- */
    user.lastlogin = new Date();
    await user.save();

    /* ---------- Create JWT ---------- */
    const token = jwt.sign(
      {
        userId: user.userId,
        ...(user.email && { email: user.email }),
        ...(user.phonenumber && { phone: user.phonenumber }),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    /* ---------- Respond ---------- */
    res.status(200).json({
      token,
      user: {
        userId: user.userId,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email || "",
        phonenumber: user.phonenumber,
      },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};
