const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const inboundWhatsappWebhook = async (req, res) => {
  try {
    const from = req.body?.From || "unknown";
    const incomingText = req.body?.Body || "";

    console.log("WhatsApp inbound message:", { from, incomingText });

    const replyText = "Hello, Thank you for contacting ultimate";
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(replyText)}</Message></Response>`;

    res.set("Content-Type", "text/xml");
    return res.status(200).send(twiml);
  } catch (error) {
    console.error("WhatsApp inbound webhook error:", error);
    return res.status(500).send("Webhook error");
  }
};
