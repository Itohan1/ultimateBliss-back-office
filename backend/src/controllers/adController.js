import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "ads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

let textAds = [];

let imageAds = [];

let textAdId = 1;
let imageAdId = 1;

export const getTextAds = (req, res) => {
  res.json(textAds);
};

export const createTextAd = (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });

  const newAd = {
    id: textAdId++,
    text,
  };
  textAds.push(newAd);
  res.status(201).json(newAd);
};

export const deleteTextAd = (req, res) => {
  const { id } = req.params;
  const index = textAds.findIndex((ad) => ad.id == id);
  if (index === -1)
    return res.status(404).json({ message: "Text ad not found" });

  textAds.splice(index, 1);
  res.json({ message: "Text ad deleted successfully" });
};

export const getImageAds = (req, res) => {
  res.json(imageAds);
};

export const createImageAd = (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "Image file is required" });

  const newAd = {
    id: imageAdId++,
    filename: req.file.filename,
    url: `/uploads/ads/${req.file.filename}`,
  };
  imageAds.push(newAd);
  res.status(201).json(newAd);
};

export const deleteImageAd = (req, res) => {
  const { id } = req.params;
  const index = imageAds.findIndex((ad) => ad.id == id);
  if (index === -1)
    return res.status(404).json({ message: "Image ad not found" });

  const filePath = path.join(UPLOAD_DIR, imageAds[index].filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  imageAds.splice(index, 1);
  res.json({ message: "Image ad deleted successfully" });
};
