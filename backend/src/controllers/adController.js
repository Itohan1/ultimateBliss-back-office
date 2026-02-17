import Ad from "../models/Ad.js";
import { deleteImageByPublicId, uploadImageBuffer } from "../services/media.js";

export const createTextAd = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please sign in to continue" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Advertisement text is required" });
  }

  console.log(req.user);
  try {
    const ad = await Ad.create({
      type: "text",
      text,
      createdBy: req.user.adminId,
    });

    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTextAds = async (req, res) => {
  try {
    const ads = await Ad.find({ type: "text" }).sort({ createdOn: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Text Ad (AUTHORIZED USERS ONLY)
 */
export const deleteTextAd = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please sign in to continue" });
  }

  try {
    const ad = await Ad.findOneAndDelete({
      _id: req.params.id,
      type: "text",
    });

    if (!ad) {
      return res.status(404).json({ message: "Text advertisement not found" });
    }

    res.json({ message: "Text advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * =========================
 * IMAGE ADVERTISEMENTS
 * =========================
 */

/**
 * Create Image Ad (AUTHORIZED USERS ONLY)
 */
export const createImageAd = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please sign in to continue" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  try {
    const uploaded = await uploadImageBuffer(req.file, {
      folder: "ultimatebliss/ads",
      publicIdPrefix: "ad",
    });

    const ad = await Ad.create({
      type: "image",
      filename: uploaded.publicId,
      url: uploaded.url,
      createdBy: req.user.adminId,
    });

    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Image Ads
 */
export const getImageAds = async (req, res) => {
  try {
    const ads = await Ad.find({ type: "image" }).sort({ createdOn: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Image Ad (AUTHORIZED USERS ONLY)
 */
export const deleteImageAd = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please sign in to continue" });
  }

  try {
    const ad = await Ad.findOneAndDelete({
      _id: req.params.id,
      type: "image",
    });

    if (!ad) {
      return res.status(404).json({ message: "Image advertisement not found" });
    }

    try {
      await deleteImageByPublicId(ad.filename);
    } catch (cloudinaryError) {
      console.warn("Cloudinary delete warning:", cloudinaryError?.message);
    }

    res.json({ message: "Image advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
