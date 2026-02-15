/**
 * Image Processing Service
 * Refactored and improved from utils/imageProcessing.js
 * Handles image resizing, normalization, and canvas operations
 */

/**
 * Resize image to max dimension while maintaining aspect ratio
 * @param {HTMLImageElement} img - Source image
 * @param {number} maxSize - Maximum dimension (default 1024px)
 * @returns {Promise<HTMLCanvasElement>} Resized image canvas
 */
export const resizeImage = (img, maxSize = 1024) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let { width, height } = img;

    // Calculate new dimensions
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    resolve(canvas);
  });
};

/**
 * Convert image to tensor format for ONNX model
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {Object} Tensor data with shape
 */
export const imageToTensor = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Normalize to [-1, 1] range and convert to CHW format
  const tensorData = new Float32Array(3 * width * height);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;

    // Normalize and convert to CHW format (Channel-Height-Width)
    tensorData[i] = (r - 0.485) / 0.229; // R channel
    tensorData[width * height + i] = (g - 0.456) / 0.224; // G channel
    tensorData[width * height * 2 + i] = (b - 0.406) / 0.225; // B channel
  }

  return {
    data: tensorData,
    dims: [1, 3, height, width],
  };
};

/**
 * Apply mask to image and create transparent PNG
 * @param {HTMLCanvasElement} originalCanvas - Original image canvas
 * @param {Float32Array} mask - Mask data from model
 * @param {number} width - Mask width
 * @param {number} height - Mask height
 * @param {Object} options - Processing options (feather, threshold)
 * @returns {Promise<string>} Data URL of processed image
 */
export const applyMaskToImage = async (
  originalCanvas,
  mask,
  width,
  height,
  options = {}
) => {
  const { feather = 1.2, threshold = 0.5 } = options;

  // Create temporary canvas for mask
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d');

  // Convert mask to ImageData
  const maskImageData = maskCtx.createImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    const value = mask[i] > threshold ? 255 : 0;
    maskImageData.data[i * 4] = value;
    maskImageData.data[i * 4 + 1] = value;
    maskImageData.data[i * 4 + 2] = value;
    maskImageData.data[i * 4 + 3] = 255;
  }
  maskCtx.putImageData(maskImageData, 0, 0);

  // Apply feathering (Gaussian blur simulation)
  if (feather > 0) {
    maskCtx.filter = `blur(${feather}px)`;
    maskCtx.drawImage(maskCanvas, 0, 0);
    maskCtx.filter = 'none';
  }

  // Create output canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = originalCanvas.width;
  outputCanvas.height = originalCanvas.height;
  const outputCtx = outputCanvas.getContext('2d');

  // Draw original image
  outputCtx.drawImage(originalCanvas, 0, 0);

  // Apply mask using composite operation
  outputCtx.globalCompositeOperation = 'destination-in';
  outputCtx.drawImage(maskCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

  return outputCanvas.toDataURL('image/png');
};

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
