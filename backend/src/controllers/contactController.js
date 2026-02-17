import { notificationEmailTemplate } from "../utils/emailTemplates.js";
import { transporter } from "../utils/mailer.js";
import User from "../models/User.js";

async function sendEmail({ to, subject, html, replyTo }) {
  await transporter.sendMail({
    from: `"Ultimate Bliss" <${process.env.MAIL_USER}>`,
    to,
    subject,
    replyTo,
    html,
  });
}

const Contact = async (req, res) => {
  try {
    const user = req.user;
    const userMessage = req.body.message;
    const name = req.body.name;
    const email = req.body.email;

    let contactName = name;
    let contactTitle = "New Contact Message - UltimateBliss";

    if (user) {
      const userData = await User.findOne({ userId: user.userId });
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
${userMessage}
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
