import Learn from "../models/Learn.js";

/* ================= CREATE ================= */
export const createLearn = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file?.filename;

    if (!title || !description || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const learn = await Learn.create({
      title,
      description,
      image,
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

    res.json({ message: "Learn content deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE ================= */
export const updateLearn = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file?.filename;

    const learn = await Learn.findById(req.params.id);
    if (!learn) return res.status(404).json({ error: "Not found" });

    learn.title = title ?? learn.title;
    learn.description = description ?? learn.description;
    if (image) learn.image = image;

    await learn.save();

    res.json(learn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
