/**
 * Export Service
 * Handles image export with different backgrounds and formats
 */

import { EXPORT_FORMATS } from '../config/constants';
import { loadImage as loadImageUtil } from './imageProcessingService';

/**
 * Apply background to processed image and export
 */
export const exportImage = async ({
  processedImage,
  originalImage,
  backgroundColor,
  customColor,
  customBackgroundImage,
  outputFormat,
}) => {
  try {
    // Create a canvas to apply the background
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Load the processed image
    const img = await loadImage(processedImage);

    // Set canvas to image dimensions
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply background based on selection
    await applyBackground(ctx, {
      canvas,
      img,
      backgroundColor,
      customColor,
      customBackgroundImage,
      originalImage,
    });

    // Convert to blob with selected format
    const blob = await canvasToBlob(canvas, outputFormat);

    // Download file
    downloadBlob(blob, outputFormat);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Use loadImage from imageProcessingService
const loadImage = loadImageUtil;

/**
 * Apply background to canvas
 */
const applyBackground = async (ctx, options) => {
  const { canvas, img, backgroundColor, customColor, customBackgroundImage, originalImage } = options;

  switch (backgroundColor) {
    case 'transparent':
      // Just draw the image with transparency
      ctx.drawImage(img, 0, 0);
      break;

    case 'solid':
      // Fill with solid color first
      {
        ctx.fillStyle = customColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      break;

    case 'gradient':
      // Apply gradient background
      {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      break;

    case 'custom':
      // Use custom uploaded image as background
      {
        if (customBackgroundImage) {
          const customImg = await loadImage(customBackgroundImage);
          // Draw custom image to fill canvas
          ctx.drawImage(customImg, 0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
      }
      break;

    case 'blur':
      // For blur, use original image as blurred background
      {
        const originalImg = await loadImage(originalImage);

        // Draw original image blurred
        ctx.filter = 'blur(20px)';
        ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Draw processed image on top
        ctx.drawImage(img, 0, 0);
      }
      break;

    default:
      ctx.drawImage(img, 0, 0);
  }
};

/**
 * Convert canvas to blob
 */
const canvasToBlob = (canvas, format) => {
  return new Promise((resolve) => {
    const mimeType = EXPORT_FORMATS[format] || EXPORT_FORMATS.PNG;
    const quality = format === 'JPG' || format === 'WEBP' ? 0.95 : undefined;

    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
};

/**
 * Download blob as file
 */
const downloadBlob = (blob, format) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `cleancut-${Date.now()}.${format.toLowerCase()}`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};
