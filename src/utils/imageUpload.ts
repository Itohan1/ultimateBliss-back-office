export type CompressImageOptions = {
  maxBytes?: number;
  maxDimension?: number;
  initialQuality?: number;
  minQuality?: number;
  qualityStep?: number;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create compressed blob"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });

export const compressImageFile = async (
  file: File,
  {
    maxBytes = 2 * 1024 * 1024,
    maxDimension = 1600,
    initialQuality = 0.9,
    minQuality = 0.55,
    qualityStep = 0.1,
  }: CompressImageOptions = {},
): Promise<File> => {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= maxBytes) return file;

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? file.type
      : "image/jpeg";

  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > maxBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - qualityStep);
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  if (blob.size >= file.size) return file;

  const extension = outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
};
