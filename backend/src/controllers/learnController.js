import Learn from "../models/Learn.js";
import { deleteImageByPublicId, uploadImageBuffer } from "../services/media.js";

/* ================= CREATE ================= */
export const createLearn = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !description || !file) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const uploaded = await uploadImageBuffer(file, {
      folder: "ultimatebliss/learn",
      publicIdPrefix: "learn",
    });

    const learn = await Learn.create({
      title,
      description,
      image: uploaded.url,
      imagePublicId: uploaded.publicId,
    });

    res.status(201).json(learn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL ================= */
export const getAllLearn = async (_req, res) => {
  try {
    const learns = await Learn.find().sort({ createdAt: -1 });
    res.json(learns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET BY ID ================= */
export const getLearnById = async (req, res) => {
  try {
    const learn = await Learn.findById(req.params.id);
    if (!learn) return res.status(404).json({ error: "Not found" });

    res.json(learn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteLearn = async (req, res) => {
  try {
    const learn = await Learn.findByIdAndDelete(req.params.id);
    if (!learn) return res.status(404).json({ error: "Not found" });

    try {
      await deleteImageByPublicId(learn.imagePublicId);
    } catch (cloudinaryError) {
      console.warn("Cloudinary delete warning:", cloudinaryError?.message);
    }

    res.json({ message: "Learn content deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE ================= */
export const updateLearn = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    const learn = await Learn.findById(req.params.id);
    if (!learn) return res.status(404).json({ error: "Not found" });

    learn.title = title ?? learn.title;
    learn.description = description ?? learn.description;

    if (file) {
      const uploaded = await uploadImageBuffer(file, {
        folder: "ultimatebliss/learn",
        publicIdPrefix: "learn",
      });

      try {
        await deleteImageByPublicId(learn.imagePublicId);
      } catch (cloudinaryError) {
        console.warn("Cloudinary delete warning:", cloudinaryError?.message);
      }

      learn.image = uploaded.url;
      learn.imagePublicId = uploaded.publicId;
    }

    await learn.save();

    res.json(learn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
