import cloudinary from "../config/cloudinary.js";

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET),
  );

const ensureCloudinaryConfig = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
};

export const uploadImageBuffer = async (
  file,
  { folder, publicIdPrefix = "image" } = {},
) => {
  ensureCloudinaryConfig();

  if (!file?.buffer) {
    throw new Error("No file buffer provided for upload.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: `${publicIdPrefix}_${Date.now()}`,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(file.buffer);
  });
};

export const uploadImageDataUri = async (
  dataUri,
  { folder, publicIdPrefix = "image" } = {},
) => {
  ensureCloudinaryConfig();

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    public_id: `${publicIdPrefix}_${Date.now()}`,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteImageByPublicId = async (publicId) => {
  ensureCloudinaryConfig();

  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};
