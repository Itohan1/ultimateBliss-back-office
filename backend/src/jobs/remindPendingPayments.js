import Order from "../models/Order.js";
import User from "../models/User.js";
import { createNotification } from "../services/notification.js";

export const remindPendingPayments = async () => {
  try {
    const now = new Date();

    const pendingOrders = await Order.find({
      transactionStatus: "pending",
      orderStatus: { $ne: "cancelled" },
    });

    for (const order of pendingOrders) {
      const minutesPassed = (now - order.createdAt) / (1000 * 60);

      // Send reminder every 30 mins but only within first 2 hours
      if (minutesPassed > 120) continue;
      if (minutesPassed % 30 > 5) continue; // small tolerance window

      const user = await User.findOne({ userId: order.userId });
      if (!user) continue;

      await createNotification({
        userId: order.userId,
        title: "Payment Reminder",
        message: `Reminder: Please complete payment for order #${order.orderId}. Orders are cancelled after 2 hours.`,
        type: "ORDER",
        email: user.email,
        recipientRole: "user",
        metadata: { orderId: order.orderId },
      });

      console.log(`🔔 Reminder sent for order #${order.orderId}`);
    }
  } catch (err) {
    console.error("Reminder job error:", err);
  }
};
