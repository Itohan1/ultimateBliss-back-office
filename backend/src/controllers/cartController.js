import Cart from "../models/Cart.js";
import Counter from "../models/Counter.js";
/* Utility */
const calculateTotals = (cart) => {
  let subTotal = 0;
  let totalDiscount = 0;

  cart.items.forEach((item) => {
    subTotal += item.price * item.quantity;
    totalDiscount += item.discount * item.quantity;
  });

  cart.subTotal = subTotal;
  cart.totalDiscount = totalDiscount;
  cart.grandTotal = subTotal - totalDiscount;
};

const getNextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

/* Add to cart */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const sessionId = userId ? null : req.sessionId;
    const { product } = req.body;

    if (!product || !product.productId) {
      return res.status(400).json({ message: "Invalid product data" });
    }

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

    /* 3️⃣ Check if product already exists in cart */
    const existingItem = cart.items.find(
      (item) => item.productId === product.productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.totalPrice =
        existingItem.quantity * existingItem.price -
        existingItem.discount * existingItem.quantity;
    } else {
      const orderItemId = await getNextSequence("orderItemId");

      cart.items.push({
        orderItemId,
        productId: product.productId,
        name: product.name,
        image: product.image,
        price: product.price,
        discount: product.discount ?? 0,
        discountType: product.discountType ?? "none",
        quantity: 1,
        totalPrice: product.price - (product.discount ?? 0),
      });
    }

    /* 4️⃣ Recalculate totals */
    calculateTotals(cart);

    await cart.save();

    res.status(200).json(cart);
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
    item.totalPrice = item.quantity * item.price - item.discount;

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
      item.totalPrice = item.quantity * item.price - item.discount;
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
