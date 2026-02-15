/**
 * Background Removal Utility using @imgly/background-removal
 * This library runs entirely in the browser and automatically downloads required models
 */

import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

let isInitialized = false;

/**
 * Initialize background removal (preload models)
 */
export const initBackgroundRemoval = async () => {
  if (isInitialized) return true;
  
  try {
    // The library will auto-download models on first use
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize background removal:', error);
    return false;
  }
};

/**
 * Remove background from image
 * @param {string|Blob|HTMLImageElement} imageSource - Image to process
 * @param {Object} options - Processing options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob>} Processed image blob
 */
export const removeBackground = async (imageSource, options = {}, onProgress = null) => {
  try {
    console.log('Starting background removal...');
    
    const config = {
      debug: false, // Disable debug for better performance
      model: 'small', // Use small model for faster processing (~5-10x faster)
      proxyToWorker: true, // Enable web worker for better performance
      output: {
        format: 'image/png',
        quality: 0.8, // Slightly reduce quality for faster processing
        type: 'foreground',
      },
      progress: onProgress ? (key, current, total) => {
        console.log(`Progress: ${key} - ${current}/${total}`);
        onProgress(key, current, total);
      } : undefined,
      ...options
    };

    console.log('Starting background removal with optimized config...');
    const result = await imglyRemoveBackground(imageSource, config);
    console.log('Background removal complete');
    return result;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error(`Background removal failed: ${error.message}`);
  }
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

/**
 * Process image with progress tracking
 * @param {string} imageDataURL - Image data URL
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Processed image data URL
 */
export const processImageWithProgress = async (imageDataURL, onProgress) => {
  try {
    console.log('Starting image processing...');
    
    // Convert data URL to blob
    const blob = await dataURLToBlob(imageDataURL);
    console.log('Image converted to blob, size:', blob.size);
    
    // Track overall progress
    if (onProgress) onProgress(5, 'Loading');
    
    // Remove background with progress tracking
    const resultBlob = await removeBackground(blob, {
      model: 'medium', // Better quality
      output: {
        format: 'image/png',
        quality: 1.0
      }
    }, (key, current, total) => {
      // Track progress from the library
      console.log(`Library progress: ${key}, ${current}/${total}`);
      if (total > 0) {
        const percentage = Math.round((current / total) * 100);
        if (onProgress) {
          onProgress(percentage, key);
        }
      } else if (current > 0) {
        // If total is 0, just use current as percentage
        if (onProgress) {
          onProgress(Math.min(current, 100), key);
        }
      }
    });
    
    console.log('Background removed, result size:', resultBlob.size);
    
    if (onProgress) onProgress(95, 'Finalizing');
    
    // Convert result back to data URL
    const resultDataURL = await blobToDataURL(resultBlob);
    
    if (onProgress) onProgress(100, 'Complete');
    
    console.log('Processing complete');
    return resultDataURL;
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  }
};
