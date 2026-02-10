import axios from "axios";
import Webhook from "../models/Webhook.js";

export async function triggerWebhooks(event, payload) {
  const webhooks = await Webhook.find({
    event,
    isActive: true,
  });

  for (const webhook of webhooks) {
    try {
      await axios.post(webhook.url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Event": event,
          "X-Webhook-Signature": webhook.secret || "",
        },
        timeout: 5000,
      });
    } catch (error) {
      console.error(`Webhook failed: ${webhook.url}`, error.message);
    }
  }
}
