import Like from "../models/Liked.js";
import Inventory from "../models/Inventory.js";
/* Like product */

export const toggleProductLike = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("This is the like user", req.user);
    const userId = req.user?.userId || null;
    const sessionId = userId ? null : req.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({
        message: "User or session required",
      });
    }

    const product = await Inventory.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const likeQuery = userId ? { productId, userId } : { productId, sessionId };

    const existingLike = await Like.findOne(likeQuery);

    let isLiked;

    if (existingLike) {
      await Like.deleteOne(likeQuery);
      product.totalLikes = Math.max(0, (product.totalLikes ?? 0) - 1);
      isLiked = false;
    } else {
      await Like.create({
        productId,
        userId,
        sessionId,
      });
      product.totalLikes = (product.totalLikes ?? 0) + 1;
      isLiked = true;
    }

    await product.save();

    res.json({
      productId,
      totalLikes: product.totalLikes,
      isLiked,
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Get users who liked a product */
export const getProductLikes = async (req, res) => {
  try {
    const { productId } = req.params;

    const likes = await Like.find({ productId });

    res.json({
      productId: Number(productId),
      totalLikes: likes.length,
      users: likes.map((like) => ({
        userId: like.userId,
        likedAt: like.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Get all liked products by user */
export const getUserLikedProducts = async (req, res) => {
  try {
    const { userId } = req.params;

    const likes = await Like.find({ userId });

    res.json({
      userId: Number(userId),
      totalLikedProducts: likes.length,
      products: likes.map((like) => ({
        productId: like.productId,
        likedAt: like.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserWishlistCount = async (req, res) => {
  try {
    console.log("Check user", req.user);
    const { userId } = req.params;

    console.log("Let us count wishlist");
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const count = await Like.countDocuments({ userId });

    return res.status(200).json({
      count,
    });
  } catch (error) {
    console.error("Wishlist count error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
