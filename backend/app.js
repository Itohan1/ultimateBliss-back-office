import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import adRoutes from "./src/routes/adRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoute.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import likeRoutes from "./src/routes/likeRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import adminAuthRoutes from "./src/routes/adminAuthRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js";
import consultationBookingRoutes from "./src/routes/consultationBookingRoutes.js";
import consultationPlanRoutes from "./src/routes/consultationPlanRoutes.js";
import consultationTimeRoutes from "./src/routes/consultationTimeRoutes.js";
import cron from "node-cron";
import learnRoutes from "./src/routes/learnRoutes.js";
import { expirePendingBookings } from "./src/cron/expireBookings.js";
import returnRoutes from "./src/routes/returns.js";
import path from "path";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import whatsappRoutes from "./src/routes/whatsappRoutes.js";
import Contact from "./src/controllers/contactController.js";
import { attachSession, optionalAuth } from "./src/middleware/auth.js";
import multer from "multer";
import discountRoutes from "./src/routes/discountRoutes.js";

const app = express();
app.use(cors());

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Expose-Headers", "X-Session-Id");
  next();
});
cron.schedule("*/5 * * * *", expirePendingBookings);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/contact", optionalAuth, attachSession, Contact);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/discounts", discountRoutes);
app.use("/api/v1/consultation-plans", consultationPlanRoutes);
app.use("/api/v1/consultation-times", consultationTimeRoutes);
app.use("/api/v1/admins", adminAuthRoutes);
app.use("/api/v1/payment-methods", paymentRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/returns", returnRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/consultation-bookings", consultationBookingRoutes);
app.use("/api/v1/ads", adRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/learn", learnRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Image must be 25MB or smaller" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err?.message === "Only image uploads are allowed") {
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }

  return next();
});

export default app;
