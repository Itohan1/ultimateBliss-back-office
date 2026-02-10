import Order from "../models/Order.js";
import { createNotification } from "../services/notification.js";

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

export const autoCompleteOrders = async () => {
  try {
    const now = new Date();

    const orders = await Order.find({
      orderStatus: "delivered",
      isDisputed: false,
      disputeWindowExpiresAt: { $lte: now },
      completedAt: { $exists: false },
    });

    if (!orders.length) return;

    const ids = orders.map((o) => o._id);

    await Order.updateMany(
      { _id: { $in: ids } },
      {
        orderStatus: "completed",
        completedAt: now,
      },
    );

    // Send notifications AFTER update
    for (const order of orders) {
      await createNotification({
        userId: order.userId,
        title: "Order Completed",
        message: `Order #${order.orderId} has been completed successfully.`,
        type: "ORDER",
        recipientRole: "user",
        metadata: { orderId: order.orderId },
      });

      await notifyAllAdmins({
        title: "Order Completed",
        message: `Order #${order.orderId} auto-completed`,
        metadata: { orderId: order.orderId },
      });
    }

    console.log(`Auto-completed ${orders.length} orders`);
  } catch (err) {
    console.error("Auto-complete orders failed:", err);
  }
};
