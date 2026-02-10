import crypto from "crypto";
import Otp from "../models/otpModel.js";
import { transporter } from "../utils/mailer.js";

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  await Otp.deleteMany({ email });
  await Otp.create({ email, otp, expiresAt });

  await transporter.sendMail({
    from: `"Ultimate Bliss" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>Your OTP</h2>
      <p><strong>${otp}</strong></p>
      <p>This code expires in 5 minutes.</p>
    `,
  });

  res.json({ message: "OTP sent successfully" });
};

/* ---------------- VERIFY OTP ---------------- */
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email, otp });

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ message: "OTP verified" });
};
