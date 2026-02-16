/**
 * Image Processing Service (Optimized)
 * Lightweight utility functions for image handling
 */

/**
 * Load image from URL or data URL
 * @param {string} src - Image source
 * @returns {Promise<HTMLImageElement>} Loaded image
 */
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Convert blob to data URL
 * @param {Blob} blob - Image blob
 * @returns {Promise<string>} Data URL
 */
export const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert data URL to blob
 * @param {string} dataURL - Data URL
 * @returns {Promise<Blob>} Image blob
 */
export const dataURLToBlob = async (dataURL) => {
  const response = await fetch(dataURL);
  return response.blob();
};
