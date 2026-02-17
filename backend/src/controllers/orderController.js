import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "../services/notification.js";
import {
  getOrderStatusMessage,
  getTransactionStatusMessage,
} from "../utils/orderNotifications.js";
import { userInfo } from "node:os";

const TRANSACTION_STATUSES = ["pending", "success", "failed"];
const ORDER_STATUSES = [
  "pending",
  "packaging",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];
const ORDER_STATUSES_REQUIRING_SUCCESS_TRANSACTION = new Set([
  "packaging",
  "shipped",
  "delivered",
  "completed",
]);

// Generate a simple order ID (incremental)
let orderCounter = 1; // You can replace this with a more robust generator

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

export const createOrder = async (req, res) => {
  try {
    const { cartId, billing, paymentMethodId } = req.body;

    const userId = req.user?.userId || req.user?.adminId || null;
    const sessionId = userId ? null : req.sessionId;
    console.log("Check the session to be sure", req.sessionId);
    console.log("Check the user to be sure", req.user);
    console.log("Check the cartId to be sure", cartId);

    if (!cartId || !billing || !paymentMethodId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔍 1️⃣ Find cart FIRST
    const cart = await Cart.findOne({
      cartId: Number(cartId),
      $or: [{ userId: userId ?? null }, { sessionId: req.sessionId ?? null }],
    });

    console.log("This is the cart", cart);
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // 🔁 2️⃣ Prevent duplicate orders
    const existingOrder = await Order.findOne({ orderId: cart.orderId });
    if (existingOrder) {
      return res.status(400).json({ error: "Order already placed" });
    }

    const transactionId = uuidv4();

    // 🧮 Rebuild items with correct free item logic
    const recalculatedItems = cart.items.map((item) => {
      let freeQty = 0;

      if (
        item.discountType === "free" &&
        item.quantity >= item.minPurchaseQuantity
      ) {
        freeQty = Math.floor(item.quantity / item.minPurchaseQuantity);
      }

      return {
        ...(item.toObject?.() ?? item),
        freeQuantity: freeQty,
      };
    });

    // 🧾 3️⃣ Create order
    /*const order = new Order({
      orderId: cart.orderId, // reuse cart orderId
      userId,
      transactionId,
      items: cart.items,
      subTotal: cart.subTotal,
      totalDiscount: cart.totalDiscount,
      grandTotal: cart.grandTotal,
      billing,
      paymentMethodId,
      transactionStatus: "pending",
      orderStatus: "pending",
    });*/
    const order = new Order({
      orderId: cart.orderId,
      userId,
      transactionId,

      items: recalculatedItems, // ✅ use recalculated items

      subTotal: cart.subTotal,
      totalDiscount: cart.totalDiscount,
      grandTotal: cart.grandTotal,
      billing,
      paymentMethodId,
      transactionStatus: "pending",
      orderStatus: "pending",
    });

    await order.save();

    // 🧹 4️⃣ Delete cart after successful order
    await Cart.deleteOne({ _id: cart._id });

    const user = await User.findOne({ userId });

    if (user) {
      await createNotification({
        userId,
        title: "Order Created",
        message: `Your order #${order.orderId} has been placed successfully.`,
        type: "ORDER",
        email: user.email,
        recipientRole: "user",
        metadata: { orderId: order.orderId },
      });
    }

    // Notify ALL admins
    await notifyAllAdmins({
      title: "New Order Placed",
      message: `New order #${order.orderId} was created.`,
      metadata: {
        orderId: order.orderId,
        userId: order.userId,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.adminId;
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, transactionStatus } = req.body;

    // 1️⃣ Find order first
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 2️⃣ Validate new values
    if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({ error: "Invalid order status" });
    }
    if (
      transactionStatus &&
      !TRANSACTION_STATUSES.includes(transactionStatus)
    ) {
      return res.status(400).json({ error: "Invalid transaction status" });
    }

    const nextTransactionStatus = transactionStatus || order.transactionStatus;

    if (
      orderStatus &&
      ORDER_STATUSES_REQUIRING_SUCCESS_TRANSACTION.has(orderStatus) &&
      nextTransactionStatus !== "success"
    ) {
      return res.status(400).json({
        error:
          "Transaction status must be success before moving order to packaging, shipped, delivered, or completed",
      });
    }

    if (orderStatus === "delivered") {
      order.disputeWindowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      order.isDisputed = false;
      order.hasBeenDisputed = false; // reset for fresh delivery cycle

      await createNotification({
        userId: order.userId,
        title: "Order Delivered",
        message:
          `Your order #${order.orderId} has been delivered. ` +
          `You have 24 hours to place a dispute or the order will be marked completed.`,
        type: "ORDER",
        recipientRole: "user",
        metadata: { orderId: order.orderId },
      });
    }

    // 3️⃣ Apply updates only if provided
    if (orderStatus) order.orderStatus = orderStatus;
    if (transactionStatus) order.transactionStatus = transactionStatus;

    // 4️⃣ Derived logic
    if (transactionStatus === "failed") order.orderStatus = "cancelled";

    await order.save();

    // 5️⃣ Notifications
    const user = await User.findOne({ userId: order.userId });
    if (user) {
      const messages = [];
      if (orderStatus)
        messages.push(getOrderStatusMessage(orderStatus, orderId));
      if (transactionStatus)
        messages.push(getTransactionStatusMessage(transactionStatus, orderId));

      await createNotification({
        userId: order.userId,
        title: "Order Updated",
        message: messages.join(" | "),
        type: "ORDER",
        email: user.email,
        recipientRole: "user",
        metadata: { orderId, orderStatus, transactionStatus },
      });
    }

    await notifyAllAdmins({
      title: "Order Updated",
      message: `Order #${orderId} updated`,
      metadata: { orderId, orderStatus, transactionStatus },
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionStatus } = req.body;

    if (!TRANSACTION_STATUSES.includes(transactionStatus)) {
      return res.status(400).json({ error: "Invalid transaction status" });
    }

    // 1️⃣ Find the order
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 2️⃣ Update transaction status
    order.transactionStatus = transactionStatus;

    // Optional: auto-cancel if transaction failed
    if (transactionStatus === "failed") {
      order.orderStatus = "cancelled";
    }

    await order.save();

    // 3️⃣ Notify the user
    const user = await User.findOne({ userId: order.userId });
    if (user) {
      const message = getTransactionStatusMessage(transactionStatus, orderId);
      await createNotification({
        userId: order.userId,
        title: "Order Status Updated",
        message,
        type: "ORDER",
        email: user.email,
        recipientRole: "user",
        metadata: { orderId, transactionStatus },
      });
    }

    // 4️⃣ Notify all admins
    await notifyAllAdmins({
      title: "Transaction Updated",
      message: `Order #${orderId} transaction is now ${transactionStatus}`,
      metadata: { orderId, userId: order.userId, transactionStatus },
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatuses = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const { orderStatus, transactionStatus } = req.body;

    // 1️⃣ Find the order
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 2️⃣ Validate input
    if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({ error: "Invalid order status" });
    }
    if (
      transactionStatus &&
      !TRANSACTION_STATUSES.includes(transactionStatus)
    ) {
      return res.status(400).json({ error: "Invalid transaction status" });
    }

    const nextTransactionStatus = transactionStatus || order.transactionStatus;

    if (
      orderStatus &&
      ORDER_STATUSES_REQUIRING_SUCCESS_TRANSACTION.has(orderStatus) &&
      nextTransactionStatus !== "success"
    ) {
      return res.status(400).json({
        error:
          "Transaction status must be success before moving order to packaging, shipped, delivered, or completed",
      });
    }

    // 3️⃣ Update fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (transactionStatus) {
      order.transactionStatus = transactionStatus;

      // Auto-cancel if transaction failed
      if (transactionStatus === "failed") order.orderStatus = "cancelled";
    }

    await order.save();

    // 4️⃣ Notify user
    const user = await User.findOne({ userId: order.userId });
    if (user) {
      const messages = [];
      if (orderStatus)
        messages.push(getOrderStatusMessage(orderStatus, orderId));
      if (transactionStatus)
        messages.push(getTransactionStatusMessage(transactionStatus, orderId));

      await createNotification({
        userId: order.userId,
        title: "Order Updated",
        message: messages.join(" | "),
        type: "ORDER",
        email: user.email,
        recipientRole: "user",
        metadata: { orderId, orderStatus, transactionStatus },
      });
    }

    // 5️⃣ Notify admins
    await notifyAllAdmins({
      title: "Order Updated",
      message: `Order #${orderId} updated: ${
        orderStatus ? `status = ${orderStatus}` : ""
      } ${transactionStatus ? `transaction = ${transactionStatus}` : ""}`.trim(),
      metadata: { orderId, orderStatus, transactionStatus },
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId || req.user?.adminId;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 🔒 Ensure user owns the order (unless admin)
    if (order.userId !== userId && !req.user?.adminId) {
      return res
        .status(403)
        .json({ error: "Not allowed to cancel this order" });
    }

    // ❌ Already cancelled
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ error: "Order already cancelled" });
    }

    // ❌ Cannot cancel after shipped
    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res
        .status(400)
        .json({ error: "Order cannot be cancelled after shipment" });
    }

    // ✅ Cancel order
    order.orderStatus = "cancelled";

    // Optional but recommended: mark transaction failed
    if (order.transactionStatus === "pending") {
      order.transactionStatus = "failed";
    }

    await order.save();

    const message = getOrderStatusMessage("cancelled", orderId);

    // ================= USER NOTIFICATION =================
    const user = await User.findOne({ userId: order.userId });

    if (user) {
      await createNotification({
        userId: order.userId,
        title: "Order Cancelled",
        message,
        type: "ORDER",
        email: user.email,
        recipientRole: "user",
        metadata: {
          orderId,
          cancelledBy: req.user?.adminId ? "admin" : "user",
        },
      });
    }

    // ================= ADMIN NOTIFICATION =================
    await notifyAllAdmins({
      title: "Order Cancelled",
      message: `Order #${orderId} was cancelled by ${
        req.user?.adminId ? "admin" : "customer"
      }`,
      metadata: {
        orderId,
        userId: order.userId,
      },
    });

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateShippingDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { description, estimatedDelivery } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.orderStatus !== "shipped") {
      return res
        .status(400)
        .json({ error: "Can only update delivery for shipped orders" });
    }

    if (!order.delivery) order.delivery = {};

    if (description) order.delivery.description = description;
    if (estimatedDelivery)
      order.delivery.estimatedDelivery = new Date(estimatedDelivery);

    await order.save();

    res.json({
      message: "Shipping details updated",
      delivery: order.delivery,
    });
  } catch (error) {
    console.error("Update shipping details error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const disputeOrder = async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (
    !order.disputeWindowExpiresAt ||
    order.disputeWindowExpiresAt < new Date()
  ) {
    return res.status(400).json({
      error: "Dispute window has expired",
    });
  }

  if (order.orderStatus !== "delivered")
    return res
      .status(400)
      .json({ error: "Only delivered orders can be disputed" });

  if (order.isDisputed)
    return res.status(400).json({ error: "Order already disputed" });

  order.isDisputed = true;
  order.hasBeenDisputed = true; // mark that dispute has happened at least once
  await order.save();

  await createNotification({
    userId: order.userId,
    title: "Dispute Opened",
    message:
      `Order #${order.orderId} is now under dispute. ` +
      `This order process is on hold until resolved.`,
    type: "ORDER",
    recipientRole: "user",
    metadata: { orderId: order.orderId },
  });

  res.json(order);
};

export const settleDispute = async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.isDisputed = false;

  // keep hasBeenDisputed = true (do NOT reset)

  // Give user new 24h dispute window
  order.disputeWindowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await order.save();

  await createNotification({
    userId: order.userId,
    title: "Dispute Settled",
    message:
      `The dispute for order #${order.orderId} has been settled. ` +
      `You have 24 hours to place another dispute if the issue persists.`,
    type: "ORDER",
    recipientRole: "user",
    metadata: { orderId: order.orderId },
  });

  res.json(order);
};
