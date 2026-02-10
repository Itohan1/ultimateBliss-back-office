import Inventory from "../models/Inventory.js";
import Counter from "../models/Counter.js";
import Like from "../models/Liked.js";

/* ================================
   Helpers
================================ */

const parseProductId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

const getNextProductId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "productId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

/* ================================
   CREATE INVENTORY ITEM
================================ */
export const createInventoryItem = async (req, res) => {
  try {
    const {
      productName,
      sku,
      category,
      subcategory,
      brandName,
      manufacturer,
      unitOfMeasure,
      inventory = {},
      pricing = {},
      productImage,
    } = req.body;

    if (!productName || !sku || !category) {
      return res.status(400).json({
        message: "productName, sku and category are required",
      });
    }

    const productId = await getNextProductId();

    const item = await Inventory.create({
      productId,
      productName,
      sku,
      category,
      subcategory,
      brandName,
      manufacturer,
      unitOfMeasure,

      inventory: {
        stockNumber: inventory.stockNumber ?? 0,
        lowStockThreshold: inventory.lowStockThreshold ?? 0,
        expiryDate: inventory.expiryDate ?? null,
      },

      pricing: {
        costPrice: pricing.costPrice ?? 0,
        sellingPrice: pricing.sellingPrice ?? 0,
        discount: pricing.discount ?? 0,
        discountType: pricing.discountType ?? "none",

        // 🔥 NEW
        freeOffer: {
          minQuantityOfPurchase: pricing.freeOffer?.minQuantityOfPurchase ?? 0,
          freeItemQuantity: pricing.freeOffer?.freeItemQuantity ?? 0,
          freeItemDescription: pricing.freeOffer?.freeItemDescription ?? "",
        },
      },

      productImage: productImage ?? null,
    });

    res.status(201).json({
      message: "Inventory item created successfully",
      product: item,
    });
  } catch (err) {
    console.error("Create inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   GET ALL INVENTORY (GUEST OK)
================================ */
export const getInventoryItems = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const sessionId = userId ? null : req.sessionId;

    const items = await Inventory.find().lean();

    let likedProductIds = new Set();

    if (userId || sessionId) {
      const likes = await Like.find(userId ? { userId } : { sessionId }).select(
        "productId",
      );

      likedProductIds = new Set(likes.map((l) => l.productId));
    }

    const response = items.map((item) => ({
      ...item,
      isLiked: likedProductIds.has(item.productId),
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Fetch inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   GET SINGLE INVENTORY ITEM
================================ */
export const getInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.userId || null;
    const sessionId = req.headers["x-session-id"] || null;

    const item = await Inventory.findOne({
      productId: Number(productId),
    }).lean();

    if (!item) {
      return res.status(404).json({ message: "Product not found" });
    }

    let isLiked = false;

    if (userId || sessionId) {
      const liked = await Like.findOne(
        userId
          ? { userId, productId: Number(productId) }
          : { sessionId, productId: Number(productId) },
      );
      isLiked = Boolean(liked);
    }

    res.status(200).json({
      ...item,
      isLiked,
    });
  } catch (err) {
    console.error("Fetch product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   UPDATE INVENTORY ITEM
================================ */
export const updateInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const payload = { ...req.body };

    if (payload.pricing) {
      payload.pricing.freeOffer = {
        minQuantityOfPurchase:
          payload.pricing.freeOffer?.minQuantityOfPurchase ?? 0,
        freeItemQuantity: payload.pricing.freeOffer?.freeItemQuantity ?? 0,
        freeItemDescription:
          payload.pricing.freeOffer?.freeItemDescription ?? "",
      };
    }

    const updatedItem = await Inventory.findOneAndUpdate(
      { productId: Number(productId) },
      { $set: payload },
      { new: true, runValidators: true },
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    await updatedItem.save();

    res.status(200).json({
      message: "Inventory item updated successfully",
      product: updatedItem,
    });
  } catch (err) {
    console.error("Update inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   DELETE INVENTORY ITEM
================================ */
export const deleteInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const deletedItem = await Inventory.findOneAndDelete({
      productId: Number(productId),
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Inventory item deleted successfully",
    });
  } catch (err) {
    console.error("Delete inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   GET BEST OFFERS (TOP DISCOUNTS)
   Pagination: 5 per page
================================ */
export const getBestOffers = async (req, res) => {
  try {
    const limit = Math.max(Number(req.query.limit) || 5, 1);

    const userId = req.user?.userId || null;
    const sessionId = userId ? null : req.sessionId;

    /* -----------------------------
       Build base aggregation
    ------------------------------*/
    const basePipeline = [
      {
        $addFields: {
          effectiveDiscount: {
            $cond: [
              { $eq: ["$pricing.discountType", "percentage"] },
              "$pricing.discount",

              {
                $cond: [
                  { $eq: ["$pricing.discountType", "flat"] },
                  {
                    $multiply: [
                      {
                        $divide: ["$pricing.discount", "$pricing.sellingPrice"],
                      },
                      100,
                    ],
                  },

                  // 🔥 FREE PROMO BOOST
                  {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$pricing.discountType", "free"] },
                          { $gt: ["$pricing.freeOffer.freeItemQuantity", 0] },
                        ],
                      },
                      999, // always rank top
                      0,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    ];

    /* -----------------------------
       Try discounted products first
    ------------------------------*/
    let items = await Inventory.aggregate([
      { $match: { "pricing.discount": { $gt: 0 } } },
      ...basePipeline,
      { $limit: limit },
    ]);

    let mode = "discounted";

    /* -----------------------------
       Fallback: no discounts at all
    ------------------------------*/
    if (items.length === 0) {
      items = await Inventory.aggregate([...basePipeline, { $limit: limit }]);
      mode = "all";
    }

    /* -----------------------------
       Likes
    ------------------------------*/
    let likedProductIds = new Set();

    if (userId || sessionId) {
      const likes = await Like.find(userId ? { userId } : { sessionId }).select(
        "productId",
      );

      likedProductIds = new Set(likes.map((l) => l.productId));
    }

    const response = items.map((item) => ({
      ...item,
      isLiked: likedProductIds.has(item.productId),
    }));

    res.status(200).json({
      mode, // "discounted" | "all"
      limit,
      count: response.length,
      items: response,
    });
  } catch (err) {
    console.error("Fetch best offers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating must be between 1 and 5" });

    const product = await Inventory.findOne({ productId: Number(productId) });

    const existingReview = product.reviews.find(
      (r) => r.userId.toString() === userId,
    );
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    if (!product) return res.status(404).json({ error: "Product not found" });

    // Add review
    product.reviews.push({ userId, rating, comment });

    // Update totalReviews & averageRating
    product.totalReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.totalReviews;

    await product.save();

    res
      .status(201)
      .json({ message: "Review added successfully", reviews: product.reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add review" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Inventory.findOne({
      productId: Number(productId),
    }).populate({
      path: "reviews.userId",
      select: "firstname lastname email", // optional: show user info
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({
      reviews: product.reviews.map((r) => ({
        userId: r.userId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};
