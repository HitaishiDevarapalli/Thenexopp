import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Process and optimize uploaded image buffer using Sharp
 * - Resizes max width to 1920px maintaining aspect ratio
 * - Converts to WebP format at 80% quality
 * - Generates high-efficiency thumbnail version (400px width)
 */
export const optimizeAndSaveImage = async (base64Data, originalFileName, uploadDir) => {
  const cleanBase64 = base64Data.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  const baseName = `${Date.now()}_${(originalFileName || 'image').replace(/[^a-zA-Z0-9._-]/g, '').split('.')[0]}`;
  const webpFileName = `${baseName}.webp`;
  const thumbFileName = `${baseName}_thumb.webp`;

  const webpPath = path.join(uploadDir, webpFileName);
  const thumbPath = path.join(uploadDir, thumbFileName);

  // 1. Optimize Main Image (WebP, max 1920px width, 80% quality)
  await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(webpPath);

  // 2. Generate Thumbnail Image (WebP, 400px width, 75% quality)
  await sharp(buffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(thumbPath);

  return {
    fileName: webpFileName,
    thumbFileName: thumbFileName,
  };
};
