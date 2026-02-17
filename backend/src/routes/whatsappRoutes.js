import express from "express";
import { inboundWhatsappWebhook } from "../controllers/whatsappController.js";

const router = express.Router();

// Twilio sends webhooks as application/x-www-form-urlencoded.
router.post("/inbound", express.urlencoded({ extended: false }), inboundWhatsappWebhook);

export default router;
