import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure =
  String(process.env.SMTP_SECURE || (smtpPort === 465 ? "true" : "false")) ===
  "true";

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 15000),
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
  tls: { minVersion: "TLSv1.2" },
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP verify failed:", err.message);
  } else {
    console.log(`SMTP ready (${smtpHost}:${smtpPort}, secure=${smtpSecure})`);
  }
});
