import { v2 as cloudinary } from "cloudinary";

const clean = (value) =>
  typeof value === "string" ? value.trim().replace(/^"(.*)"$/, "$1") : value;

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(clean(process.env.CLOUDINARY_URL));
} else {
  cloudinary.config({
    cloud_name: clean(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: clean(process.env.CLOUDINARY_API_KEY),
    api_secret: clean(process.env.CLOUDINARY_API_SECRET),
  });
}

export default cloudinary;
