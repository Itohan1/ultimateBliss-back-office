import Order from "../models/Order.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { createNotification } from "../services/notification.js";
import { getOrderStatusMessage } from "../utils/orderNotifications.js";

const notifyAllAdmins = async ({ title, message, metadata = {} }) => {
  const admins = await Admin.find();

  for (const admin of admins) {
    await createNotification({
      userId: admin.adminId,
      title,
      message,
      type: "ORDER",
      email: admin.email,
      recipientRole: "admin",
      metadata,
    });
  }
};

export const autoCancelOldOrders = async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const expiredOrders = await Order.find({
      orderStatus: { $in: ["pending", "packaging"] },
      transactionStatus: "pending",
      createdAt: { $lte: twoHoursAgo },
    });

    for (const order of expiredOrders) {
      order.orderStatus = "cancelled";
      order.transactionStatus = "failed";
      await order.save();

      const message = getOrderStatusMessage("cancelled", order.orderId);
      const user = await User.findOne({ userId: order.userId });

      // Notify user
      if (user) {
        await createNotification({
          userId: order.userId,
          title: "Order Cancelled",
          message,
          type: "ORDER",
          email: user.email,
          recipientRole: "user",
          metadata: {
            orderId: order.orderId,
            reason: "Payment not completed within 2 hours",
          },
        });
      }

      // Notify ALL admins
      await notifyAllAdmins({
        title: "Order Auto-Cancelled",
        message: `Order #${order.orderId} was automatically cancelled (payment timeout).`,
        metadata: {
          orderId: order.orderId,
          userId: order.userId,
        },
      });

      console.log(`⏱ Order #${order.orderId} auto-cancelled`);
    }
  } catch (error) {
    console.error("Auto-cancel job error:", error);
  }
};
