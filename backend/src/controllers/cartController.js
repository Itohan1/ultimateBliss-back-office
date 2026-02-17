import Cart from "../models/Cart.js";
import Counter from "../models/Counter.js";

/* Utility: Calculate totals */
const calculateTotals = (cart) => {
  let subTotal = 0;
  let totalDiscount = 0;

  cart.items.forEach((item) => {
    const sellingPrice = Number(item.sellingPrice ?? 0);
    const discountedPrice = Number(item.discountedPrice ?? sellingPrice);
    const qty = Number(item.quantity ?? 0);

    let freeQty = 0;

    // FREE ITEM LOGIC (Buy X Get Y)
    if (item.discountType === "free" && item.minPurchaseQuantity > 0) {
      freeQty =
        Math.floor(qty / item.minPurchaseQuantity) * (item.freeQuantity ?? 0);
    }

    const payableQty = qty; // user pays only for purchased qty
    const discountPerUnit = sellingPrice - discountedPrice;

    const itemSubTotal = discountedPrice * payableQty;

    subTotal += itemSubTotal;
    totalDiscount += discountPerUnit * payableQty;

    item.freeQuantity = freeQty;
    item.totalPrice = itemSubTotal;
    item.discount = discountPerUnit;
  });

  cart.subTotal = Number(subTotal || 0);
  cart.totalDiscount = Number(totalDiscount || 0);
  cart.grandTotal = Number(subTotal || 0); // grandTotal is subtotal (discount already subtracted)
};

/* Utility: Generate sequential IDs */
const getNextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

/* Utility: Transform cart for frontend */
const transformCart = (cart) => ({
  cartId: cart.cartId,
  userId: cart.userId,
  sessionId: cart.sessionId,
  orderId: cart.orderId,
  subTotal: cart.subTotal ?? 0,
  totalDiscount: cart.totalDiscount ?? 0,
  grandTotal: cart.grandTotal ?? 0,

  items: cart.items.map((item) => ({
    orderItemId: item.orderItemId,
    productId: item.productId,
    name: item.name,
    image: item.image,
    quantity: item.quantity ?? 0,
    sellingPrice: item.sellingPrice ?? 0,
    discountedPrice: item.discountedPrice ?? 0,
    totalPrice: item.totalPrice ?? 0,
    discount: item.discount ?? 0,
    discountType: item.discountType ?? "none",

    minPurchaseQuantity: item.minPurchaseQuantity ?? 1,
    freeQuantity: item.freeQuantity ?? 1,
    freeItemDescription: item.freeItemDescription ?? "",
  })),
});

/* Add to cart controller */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const sessionId = userId
      ? null
      : req.body.sessionId || req.headers["x-session-id"];

    const { product } = req.body;

    if (!product || !product.productId) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    // Normalize pricing
    const sellingPrice = Number(product.sellingPrice ?? 0);
    const discountedPrice = Number(product.discountedPrice ?? sellingPrice);
    const finalPrice =
      product.discountType === "free" ? sellingPrice : discountedPrice;
    const discountValue = Math.max(0, sellingPrice - finalPrice);

    // Find existing cart
    let cart = await Cart.findOne(userId ? { userId } : { sessionId });

    if (!cart) {
      const cartId = await getNextSequence("cartId");
      const orderId = await getNextSequence("orderId");

      cart = new Cart({
        cartId,
        userId,
        sessionId,
        orderId,
        items: [],
      });
    }

    // Check if product exists
    const existingItem = cart.items.find(
      (item) => item.productId === product.productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.totalPrice =
        existingItem.quantity * (existingItem.discountedPrice ?? 0);
    } else {
      const orderItemId = await getNextSequence("orderItemId");

      cart.items.push({
        orderItemId,
        productId: product.productId,
        name: product.name,
        image: product.image,
        sellingPrice,
        discountedPrice: finalPrice,
        discount: discountValue,
        discountType: product.discountType ?? "none",
        quantity: 1,
        totalPrice: finalPrice * 1,
        minPurchaseQuantity: product.minPurchaseQuantity ?? 1,
        freeQuantity: product.freeQuantity ?? 1,
        freeItemDescription: product.freeItemDescription ?? "",
      });
    }

    // Recalculate totals
    calculateTotals(cart);

    // Ensure valid numbers
    cart.items.forEach((item) => {
      if (!Number.isFinite(item.price)) item.price = 0;
      if (!Number.isFinite(item.discount)) item.discount = 0;
      if (!Number.isFinite(item.totalPrice)) item.totalPrice = 0;
    });

    await cart.save();

    // Send transformed cart
    res.status(200).json(transformCart(cart));
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Increase quantity */
export const increaseQuantity = async (req, res) => {
  try {
    const { cartId, orderItemId } = req.params;

    const cart = await Cart.findOne({
      cartId,
      $or: [{ userId: req.user?.userId }, { sessionId: req.sessionId }],
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.orderItemId === Number(orderItemId));

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity += 1;
    //item.totalPrice = item.quantity * item.price - item.discount;

    item.totalPrice = item.quantity * (item.discountedPrice ?? 0);

    calculateTotals(cart);
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Decrease quantity */
export const decreaseQuantity = async (req, res) => {
  try {
    const { cartId, orderItemId } = req.params;

    const cart = await Cart.findOne({
      cartId,
      $or: [{ userId: req.user?.userId }, { sessionId: req.sessionId }],
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.orderItemId === Number(orderItemId));

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.quantity > 1) {
      item.quantity -= 1;
      //item.totalPrice = item.quantity * item.price - item.discount;
      item.totalPrice = item.quantity * (item.discountedPrice ?? 0);
    }

    calculateTotals(cart);
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Remove item */
export const removeFromCart = async (req, res) => {
  try {
    const { cartId, orderItemId } = req.params;

    const cart = await Cart.findOne({
      cartId,
      $or: [{ userId: req.user?.userId }, { sessionId: req.sessionId }],
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.orderItemId !== Number(orderItemId),
    );

    calculateTotals(cart);
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Get cart */
export const getCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await Cart.findOne({ cartId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Get cart by userId */
export const getMyCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers["x-session-id"];

    let cart = null;

    if (userId) {
      cart = await Cart.findOne({ userId });
    }

    if (!cart && sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
