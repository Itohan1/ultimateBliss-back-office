import Inventory from "../models/Inventory.js";
import Counter from "../models/Counter.js";
import Like from "../models/Liked.js";
import User from "../models/User.js";
import {
  deleteImageByPublicId,
  uploadImageBuffer,
  uploadImageDataUri,
} from "../services/media.js";

const isDataImageUri = (value) =>
  typeof value === "string" && value.startsWith("data:image/");

const isHttpUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value);

const parseRequestPayload = (req) => {
  if (typeof req.body?.payload === "string") {
    try {
      return JSON.parse(req.body.payload);
    } catch {
      return null;
    }
  }
  return req.body ?? {};
};

const getNextProductId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "productId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

export const createInventoryItem = async (req, res) => {
  let uploadedImage = null;

  try {
    const payload = parseRequestPayload(req);

    if (!payload) {
      return res.status(400).json({ message: "Invalid payload JSON" });
    }

    const {
      productName,
      sku,
      category,
      subcategory,
      description,
      brandName,
      manufacturer,
      unitOfMeasure,
      inventory = {},
      pricing = {},
      productImage,
    } = payload;

    if (!productName || !sku || !category) {
      return res.status(400).json({
        message: "productName, sku and category are required",
      });
    }

    const productId = await getNextProductId();

    if (req.file) {
      uploadedImage = await uploadImageBuffer(req.file, {
        folder: "ultimatebliss/inventory",
        publicIdPrefix: `product_${sku}`,
      });
    } else if (productImage) {
      if (isDataImageUri(productImage)) {
        uploadedImage = await uploadImageDataUri(productImage, {
          folder: "ultimatebliss/inventory",
          publicIdPrefix: `product_${sku}`,
        });
      } else if (!isHttpUrl(productImage)) {
        return res.status(400).json({
          message:
            "productImage must be a valid image data URI or an absolute URL",
        });
      }
    }

    const item = await Inventory.create({
      productId,
      productName,
      sku,
      category,
      subcategory,
      description: description ?? "",
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
        freeOffer: {
          minQuantityOfPurchase: pricing.freeOffer?.minQuantityOfPurchase ?? 1,
          freeItemQuantity: pricing.freeOffer?.freeItemQuantity ?? 1,
          freeItemDescription: pricing.freeOffer?.freeItemDescription ?? "",
        },
      },
      productImage: uploadedImage?.url ?? productImage ?? null,
      productImagePublicId: uploadedImage?.publicId ?? null,
    });

    res.status(201).json({
      message: "Inventory item created successfully",
      product: item,
    });
  } catch (err) {
    if (uploadedImage?.publicId) {
      try {
        await deleteImageByPublicId(uploadedImage.publicId);
      } catch (cloudinaryError) {
        console.warn("Cloudinary delete warning:", cloudinaryError?.message);
      }
    }

    console.error("Create inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

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

export const updateInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const parsedPayload = parseRequestPayload(req);
    if (!parsedPayload) {
      return res.status(400).json({ message: "Invalid payload JSON" });
    }

    const payload = { ...parsedPayload };
    const item = await Inventory.findOne({ productId: Number(productId) });

    if (!item) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (payload.pricing) {
      payload.pricing.freeOffer = {
        minQuantityOfPurchase:
          payload.pricing.freeOffer?.minQuantityOfPurchase ?? 0,
        freeItemQuantity: payload.pricing.freeOffer?.freeItemQuantity ?? 0,
        freeItemDescription:
          payload.pricing.freeOffer?.freeItemDescription ?? "",
      };
    }

    if (req.file) {
      const uploaded = await uploadImageBuffer(req.file, {
        folder: "ultimatebliss/inventory",
        publicIdPrefix: `product_${item.sku}`,
      });

      payload.productImage = uploaded.url;
      payload.productImagePublicId = uploaded.publicId;

      try {
        await deleteImageByPublicId(item.productImagePublicId);
      } catch (cloudinaryError) {
        console.warn("Cloudinary delete warning:", cloudinaryError?.message);
      }
    } else if (Object.prototype.hasOwnProperty.call(payload, "productImage")) {
      const incomingImage = payload.productImage;

      if (!incomingImage) {
        payload.productImage = null;
        payload.productImagePublicId = null;

        try {
          await deleteImageByPublicId(item.productImagePublicId);
        } catch (cloudinaryError) {
          console.warn("Cloudinary delete warning:", cloudinaryError?.message);
        }
      } else if (isDataImageUri(incomingImage)) {
        const uploaded = await uploadImageDataUri(incomingImage, {
          folder: "ultimatebliss/inventory",
          publicIdPrefix: `product_${item.sku}`,
        });

        payload.productImage = uploaded.url;
        payload.productImagePublicId = uploaded.publicId;

        try {
          await deleteImageByPublicId(item.productImagePublicId);
        } catch (cloudinaryError) {
          console.warn("Cloudinary delete warning:", cloudinaryError?.message);
        }
      } else if (isHttpUrl(incomingImage)) {
        payload.productImage = incomingImage;

        if (item.productImagePublicId) {
          try {
            await deleteImageByPublicId(item.productImagePublicId);
          } catch (cloudinaryError) {
            console.warn("Cloudinary delete warning:", cloudinaryError?.message);
          }
          payload.productImagePublicId = null;
        }
      } else {
        return res.status(400).json({
          message:
            "productImage must be a valid image data URI, an absolute URL, or null",
        });
      }
    }

    const updatedItem = await Inventory.findOneAndUpdate(
      { productId: Number(productId) },
      { $set: payload },
      { new: true, runValidators: true },
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Inventory item updated successfully",
      product: updatedItem,
    });
  } catch (err) {
    console.error("Update inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const deletedItem = await Inventory.findOneAndDelete({
      productId: Number(productId),
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      await deleteImageByPublicId(deletedItem.productImagePublicId);
    } catch (cloudinaryError) {
      console.warn("Cloudinary delete warning:", cloudinaryError?.message);
    }

    res.status(200).json({
      message: "Inventory item deleted successfully",
    });
  } catch (err) {
    console.error("Delete inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBestOffers = async (req, res) => {
  try {
    const limit = Math.max(Number(req.query.limit) || 5, 1);

    const userId = req.user?.userId || null;
    const sessionId = userId ? null : req.sessionId;

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
                  {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$pricing.discountType", "free"] },
                          { $gt: ["$pricing.freeOffer.freeItemQuantity", 0] },
                        ],
                      },
                      999,
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

    let items = await Inventory.aggregate([
      {
        $match: {
          $or: [
            { "pricing.discount": { $gt: 0 } },
            {
              $and: [
                { "pricing.discountType": "free" },
                { "pricing.freeOffer.freeItemQuantity": { $gt: 0 } },
              ],
            },
          ],
        },
      },
      ...basePipeline,
      { $limit: limit },
    ]);

    let mode = "discounted";
    if (items.length === 0) {
      items = await Inventory.aggregate([...basePipeline, { $limit: limit }]);
      mode = "all";
    }

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
      mode,
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

    if (!comment || comment.trim() === "")
      return res.status(400).json({ error: "Comment cannot be empty" });

    const product = await Inventory.findOne({
      productId: Number(productId),
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    const existingReview = product.reviews.find(
      (r) => r.userId.toString() === userId,
    );

    if (existingReview)
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });

    product.reviews.push({
      userId,
      rating,
      comment,
      createdAt: new Date(),
    });

    product.totalReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.totalReviews;

    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      reviews: product.reviews,
    });
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
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    const reviewerIds = [
      ...new Set(
        product.reviews
          .map((r) => r.userId)
          .filter((id) => typeof id === "string" && id.trim() !== ""),
      ),
    ];

    const reviewers = await User.find({ userId: { $in: reviewerIds } }).select(
      "userId firstname lastname email",
    );

    const reviewerMap = new Map(reviewers.map((u) => [u.userId, u]));

    res.json({
      reviews: product.reviews.map((r) => ({
        userId: r.userId,
        reviewer: reviewerMap.get(r.userId)
          ? {
              firstname: reviewerMap.get(r.userId).firstname,
              lastname: reviewerMap.get(r.userId).lastname,
              email: reviewerMap.get(r.userId).email,
            }
          : null,
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
