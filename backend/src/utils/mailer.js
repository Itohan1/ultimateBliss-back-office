import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER, // your Gmail
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

// Verify once on startup
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP error:", err);
  } else {
    console.log("✅ Gmail SMTP ready");
  }
});
