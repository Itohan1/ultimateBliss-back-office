import Inventory from "../models/Inventory.js";

const DISCOUNT_TYPES = new Set(["none", "percentage", "flat", "free"]);

const buildTargetQuery = ({ target, productIds, category, subcategory }) => {
  if (target === "all") return {};

  if (target === "selected") {
    const ids = Array.isArray(productIds)
      ? productIds.map(Number).filter((id) => Number.isFinite(id))
      : [];
    return { productId: { $in: ids } };
  }

  if (target === "category") {
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    return query;
  }

  return null;
};

const validateApplyPayload = (payload) => {
  const { discountType, discount = 0, freeOffer = {} } = payload;

  if (!DISCOUNT_TYPES.has(discountType) || discountType === "none") {
    return "Invalid discount type";
  }

  const numericDiscount = Number(discount);
  if (!Number.isFinite(numericDiscount) || numericDiscount < 0) {
    return "Discount must be a valid non-negative number";
  }

  if (
    (discountType === "percentage" || discountType === "flat") &&
    numericDiscount <= 0
  ) {
    return "Discount must be greater than 0 for percentage or flat type";
  }

  if (discountType === "percentage" && numericDiscount > 100) {
    return "Percentage discount cannot exceed 100%";
  }

  if (discountType === "free") {
    const minQty = Number(freeOffer.minQuantityOfPurchase ?? 0);
    const freeQty = Number(freeOffer.freeItemQuantity ?? 0);
    if (minQty <= 0 || freeQty <= 0) {
      return "Free offer quantities must be greater than 0";
    }
  }

  return null;
};

const getUpdatedPricing = (item, payload) => {
  const sellingPrice = Number(item.pricing?.sellingPrice ?? 0);
  const discountType = payload.discountType;
  const discount = Number(payload.discount ?? 0);

  let discountedPrice = sellingPrice;
  let isDiscounted = false;

  if (discountType === "percentage" && discount > 0) {
    discountedPrice = Math.max(
      0,
      Math.round(sellingPrice - (sellingPrice * discount) / 100),
    );
    isDiscounted = discountedPrice < sellingPrice;
  } else if (discountType === "flat" && discount > 0) {
    discountedPrice = Math.max(0, Math.round(sellingPrice - discount));
    isDiscounted = discountedPrice < sellingPrice;
  } else if (discountType === "free") {
    discountedPrice = sellingPrice;
    isDiscounted = Number(payload.freeOffer?.freeItemQuantity ?? 0) > 0;
  }

  return {
    "pricing.discountType": discountType,
    "pricing.discount": discountType === "free" ? 0 : discount,
    "pricing.discountedPrice": discountedPrice,
    "pricing.isDiscounted": isDiscounted,
    "pricing.freeOffer.minQuantityOfPurchase":
      discountType === "free"
        ? Number(payload.freeOffer?.minQuantityOfPurchase ?? 0)
        : 0,
    "pricing.freeOffer.freeItemQuantity":
      discountType === "free" ? Number(payload.freeOffer?.freeItemQuantity ?? 0) : 0,
    "pricing.freeOffer.freeItemDescription":
      discountType === "free" ? payload.freeOffer?.freeItemDescription ?? "" : "",
  };
};

export const getDiscountedItems = async (_req, res) => {
  try {
    const items = await Inventory.find({
      $or: [
        {
          $and: [
            { "pricing.discountType": "percentage" },
            { "pricing.discount": { $gt: 0 } },
          ],
        },
        {
          $and: [{ "pricing.discountType": "flat" }, { "pricing.discount": { $gt: 0 } }],
        },
        {
          $and: [
            { "pricing.discountType": "free" },
            { "pricing.freeOffer.freeItemQuantity": { $gt: 0 } },
          ],
        },
      ],
    }).sort({ updatedAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    console.error("Get discounted items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const applyDiscount = async (req, res) => {
  try {
    const { target, productIds, category, subcategory, discountType, discount, freeOffer } =
      req.body;

    const query = buildTargetQuery({ target, productIds, category, subcategory });
    if (!query) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    const validationError = validateApplyPayload({
      discountType,
      discount,
      freeOffer,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const items = await Inventory.find(query).select("productId pricing");
    if (!items.length) {
      return res.status(404).json({ message: "No items found for selected target" });
    }

    const operations = items.map((item) => ({
      updateOne: {
        filter: { productId: item.productId },
        update: {
          $set: getUpdatedPricing(item, { discountType, discount, freeOffer }),
        },
      },
    }));

    const result = await Inventory.bulkWrite(operations);

    res.status(200).json({
      message: "Discount applied successfully",
      matchedCount: result.matchedCount ?? items.length,
      modifiedCount: result.modifiedCount ?? 0,
    });
  } catch (error) {
    console.error("Apply discount error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeDiscount = async (req, res) => {
  try {
    const { target, productIds, category, subcategory } = req.body;

    const query = buildTargetQuery({ target, productIds, category, subcategory });
    if (!query) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    const items = await Inventory.find(query).select("productId pricing.sellingPrice");
    if (!items.length) {
      return res.status(404).json({ message: "No items found for selected target" });
    }

    const operations = items.map((item) => ({
      updateOne: {
        filter: { productId: item.productId },
        update: {
          $set: {
            "pricing.discountType": "none",
            "pricing.discount": 0,
            "pricing.discountedPrice": Number(item.pricing?.sellingPrice ?? 0),
            "pricing.isDiscounted": false,
            "pricing.freeOffer.minQuantityOfPurchase": 0,
            "pricing.freeOffer.freeItemQuantity": 0,
            "pricing.freeOffer.freeItemDescription": "",
          },
        },
      },
    }));

    const result = await Inventory.bulkWrite(operations);

    res.status(200).json({
      message: "Discount removed successfully",
      matchedCount: result.matchedCount ?? items.length,
      modifiedCount: result.modifiedCount ?? 0,
    });
  } catch (error) {
    console.error("Remove discount error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
