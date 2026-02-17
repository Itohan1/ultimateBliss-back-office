import Cart from "../models/Cart.js";
import Counter from "../models/Counter.js";

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeDiscountType = (type) => {
  if (type === "percentage" || type === "flat" || type === "free") return type;
  if (type === "promotion") return "percentage";
  return "none";
};

const normalizeItemPrices = (item) => {
  const legacyPrice = toNumber(item.price, 0);
  const legacyDiscount = toNumber(item.discount, 0);

  const sellingPrice = toNumber(item.sellingPrice, legacyPrice);
  let discountedPrice = toNumber(
    item.discountedPrice,
    Math.max(0, sellingPrice - legacyDiscount),
  );

  const discountType = normalizeDiscountType(item.discountType);
  if (discountType === "free") {
    discountedPrice = sellingPrice;
  }

  item.sellingPrice = sellingPrice;
  item.discountedPrice = discountedPrice;
  item.discountType = discountType;

  return { sellingPrice, discountedPrice, discountType };
};

const calculateTotals = (cart) => {
  let subTotal = 0;
  let totalDiscount = 0;

  cart.items.forEach((item) => {
    const { sellingPrice, discountedPrice } = normalizeItemPrices(item);
    const qty = toNumber(item.quantity, 0);

    let freeQty = 0;
    if (item.discountType === "free" && item.minPurchaseQuantity > 0) {
      freeQty =
        Math.floor(qty / item.minPurchaseQuantity) * (item.freeQuantity ?? 0);
    }

    const payableQty = qty;
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
  cart.grandTotal = Number(subTotal || 0);
};

const getNextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

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

export const adminAddToCart = async (req, res) => {
  try {
    const userId = req.user?.adminId || null;
    const sessionId = userId ? null : req.sessionId;
    const { product } = req.body;

    if (!product || !product.productId) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const sellingPrice = toNumber(product.sellingPrice, toNumber(product.price, 0));
    const discountType = normalizeDiscountType(product.discountType);
    const discountedPrice = toNumber(
      product.discountedPrice,
      Math.max(0, sellingPrice - toNumber(product.discount, 0)),
    );
    const finalPrice =
      discountType === "free" ? sellingPrice : discountedPrice;
    const discountValue = Math.max(0, sellingPrice - finalPrice);

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

    const existingItem = cart.items.find(
      (item) => item.productId === product.productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
      const { discountedPrice } = normalizeItemPrices(existingItem);
      existingItem.totalPrice = existingItem.quantity * discountedPrice;
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
        discountType,
        quantity: 1,
        totalPrice: finalPrice,
        minPurchaseQuantity: product.minPurchaseQuantity ?? 1,
        freeQuantity: product.freeQuantity ?? 1,
        freeItemDescription: product.freeItemDescription ?? "",
      });
    }

    calculateTotals(cart);
    await cart.save();

    res.status(200).json(transformCart(cart));
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminIncreaseQuantity = async (req, res) => {
  try {
    const { cartId, orderItemId } = req.params;
    const cart = await Cart.findOne({
      cartId,
      $or: [{ userId: req.user?.adminId }, { sessionId: req.sessionId }],
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.orderItemId === Number(orderItemId));
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity += 1;
    const { discountedPrice } = normalizeItemPrices(item);
    item.totalPrice = item.quantity * discountedPrice;

    calculateTotals(cart);
    await cart.save();

    res.json(transformCart(cart));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminDecreaseQuantity = async (req, res) => {
  try {
    const { cartId, orderItemId } = req.params;
    const cart = await Cart.findOne({
      cartId,
      $or: [{ userId: req.user?.adminId }, { sessionId: req.sessionId }],
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.orderItemId === Number(orderItemId));
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.quantity > 1) {
      item.quantity -= 1;
      const { discountedPrice } = normalizeItemPrices(item);
      item.totalPrice = item.quantity * discountedPrice;
    }

    calculateTotals(cart);
    await cart.save();

    res.json(transformCart(cart));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminRemoveFromCart = async (req, res) => {
  try {
    const { cartId, orderItemId } = req.params;
    const cart = await Cart.findOne({
      cartId,
      $or: [{ userId: req.user?.adminId }, { sessionId: req.sessionId }],
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.orderItemId !== Number(orderItemId),
    );

    calculateTotals(cart);
    await cart.save();

    res.json(transformCart(cart));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await Cart.findOne({ cartId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(transformCart(cart));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminGetMyCart = async (req, res) => {
  try {
    const userId = req.user?.adminId;
    const sessionId = req.headers["x-session-id"];

    let cart = null;
    if (userId) cart = await Cart.findOne({ userId });
    if (!cart && sessionId) cart = await Cart.findOne({ sessionId });

    if (!cart) return res.json({ items: [] });
    res.json(transformCart(cart));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
