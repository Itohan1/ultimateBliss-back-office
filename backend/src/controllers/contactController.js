import nodemailer from "nodemailer";
import { notificationEmailTemplate } from "../utils/emailTemplates.js";
import User from "../models/User.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER, // your Gmail
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP ERROR:", err);
  } else {
    console.log("✅ SMTP ready to send emails");
  }
});

async function sendEmail({ to, subject, html, replyTo }) {
  const info = await transporter.sendMail({
    from: `"Ultimate Bliss" <${process.env.MAIL_USER}>`,
    to,
    subject,
    replyTo,
    html,
  });
}

const Contact = async (req, res) => {
  try {
    console.log("Get the user", req.user);

    const user = req.user;
    const UserMessage = req.body.message;
    const name = req.body.name;
    const email = req.body.email;

    let contactName = name;
    let contactTitle = `New Contact Message - UltimateBliss`;

    if (user) {
      const userData = await User.findOne({ userId: user.userId });
      console.log("This is the userData", userData);
      if (userData) {
        contactName = `${userData.firstname} ${userData.lastname}`;
        if (!userData.lastname || !userData.firstname) {
          contactName = "No name";
        }
        contactTitle = `${contactName} - UltimateBliss`;
      }
    }

    const message = `
<strong>Name:</strong> ${contactName}<br/>
<strong>Email:</strong> ${email}<br/><br/>
${UserMessage}
`;

    await sendEmail({
      to: process.env.MAIL_USER,
      subject: contactTitle,
      html: notificationEmailTemplate({
        title: contactTitle,
        message,
      }),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Email failed" });
  }
};

export default Contact;
