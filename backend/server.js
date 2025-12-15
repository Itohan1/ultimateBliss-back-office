import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import adRoutes from "./src/routes/adRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());
connectDB();

app.use("/api/v1", authRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/ads", adRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
