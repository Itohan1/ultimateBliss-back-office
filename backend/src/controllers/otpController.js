import crypto from "crypto";
import Otp from "../models/otpModel.js";
import { transporter } from "../utils/mailer.js";

const normalizePhone = (value = "") => value.trim().replace(/\s+/g, "");

const getOtpContext = ({ email, phone, channel }) => {
  const requestedChannel = String(channel || "").toLowerCase();

  const resolvedChannel = requestedChannel || (phone ? "whatsapp" : "email");

  if (resolvedChannel === "whatsapp") {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return { error: "Phone number is required for WhatsApp OTP" };
    }
    if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
      return {
        error:
          "Phone number must be in international format, e.g. +2348012345678",
      };
    }
    return {
      channel: "whatsapp",
      target: normalizedPhone,
      email: email?.trim().toLowerCase() || undefined,
      phone: normalizedPhone,
    };
  }

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return { error: "Email is required for email OTP" };
  }

  return {
    channel: "email",
    target: normalizedEmail,
    email: normalizedEmail,
    phone: phone ? normalizePhone(phone) : undefined,
  };
};

const sendWhatsappOtp = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  console.log("TWILIO DEBUG:", {
    sid: process.env.TWILIO_ACCOUNT_SID,
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: phone,
  });

  if (!accountSid || !authToken || !from) {
    throw new Error(
      "WhatsApp OTP is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM",
    );
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`,
    Body: `Your Ultimate Bliss OTP is ${otp}. It expires in 5 minutes.`,
  });

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString(
    "base64",
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio WhatsApp send failed: ${response.status} ${text}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email, phone, channel } = req.body;
    const otpContext = getOtpContext({ email, phone, channel });

    if (otpContext.error) {
      return res.status(400).json({ message: otpContext.error });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await Otp.deleteMany({
      target: otpContext.target,
      channel: otpContext.channel,
    });

    await Otp.create({
      email: otpContext.email,
      phone: otpContext.phone,
      channel: otpContext.channel,
      target: otpContext.target,
      otp,
      expiresAt,
    });

    if (otpContext.channel === "whatsapp") {
      await sendWhatsappOtp(otpContext.target, otp);
    } else {
      await transporter.sendMail({
        from: `"Ultimate Bliss" <${process.env.MAIL_USER}>`,
        to: otpContext.email,
        subject: "Your OTP Code",
        html: `
          <h2>Your OTP</h2>
          <p><strong>${otp}</strong></p>
          <p>This code expires in 5 minutes.</p>
        `,
      });
    }

    return res.json({
      message: `OTP sent successfully via ${otpContext.channel}`,
      channel: otpContext.channel,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ---------------- VERIFY OTP ---------------- */
export const verifyOtp = async (req, res) => {
  try {
    const { email, phone, channel, otp } = req.body;
    const otpContext = getOtpContext({ email, phone, channel });

    if (otpContext.error) {
      return res.status(400).json({ message: otpContext.error });
    }

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const lookupConditions = [
      { target: otpContext.target, channel: otpContext.channel, otp },
    ];

    if (otpContext.email) {
      lookupConditions.push({ email: otpContext.email, otp });
    }

    const record = await Otp.findOne({ $or: lookupConditions });

    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({
      target: record.target || otpContext.target,
      channel: record.channel || otpContext.channel,
    });

    return res.json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};
