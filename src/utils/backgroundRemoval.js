/**
 * Background Removal Utility using @imgly/background-removal
 * Optimized for speed and accuracy with adaptive settings
 */

import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import { blobToDataURL, dataURLToBlob } from '../services/imageProcessingService';

let isInitialized = false;
const RESULT_CACHE = new Map();
const MAX_CACHE_SIZE = 5; // Cache last 5 processed images

/**
 * Generate cache key from image data
 * @param {Blob} blob - Image blob
 * @returns {Promise<string>} Cache key
 */
const generateCacheKey = async (blob) => {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
};

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
 * Get optimal image dimensions
 * @param {HTMLImageElement|Blob} imageSource - Image source
 * @returns {Object} Width and height info
 */
const getImageDimensions = async (imageSource) => {
  if (imageSource instanceof HTMLImageElement) {
    return { width: imageSource.width, height: imageSource.height };
  }
  
  if (imageSource instanceof Blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageSource);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  
  return { width: 1024, height: 1024 }; // Default fallback
};

/**
 * Adaptive model selection based on image size
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Model name
 */
const selectModel = (width, height) => {
  const pixels = width * height;
  
  // Small model: Fast, good for <= 1MP images
  if (pixels <= 1048576) return 'small';
  
  // Medium model: Balanced for 1-4MP images
  if (pixels <= 4194304) return 'medium';
  
  // Large model only for very high-res images
  return 'medium'; // Cap at medium for web performance
};

/**
 * Remove background from image (optimized)
 * @param {string|Blob|HTMLImageElement} imageSource - Image to process
 * @param {Object} options - Processing options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob>} Processed image blob
 */
export const removeBackground = async (imageSource, options = {}, onProgress = null) => {
  try {
    console.log('Starting optimized background removal...');
    
    // Get image dimensions for adaptive processing
    const dims = await getImageDimensions(imageSource);
    const selectedModel = options.model || selectModel(dims.width, dims.height);
    
    console.log(`Image: ${dims.width}x${dims.height}px, Model: ${selectedModel}`);
    
    const config = {
      debug: false,
      model: selectedModel,
      proxyToWorker: true, // Web worker for non-blocking processing
      output: {
        format: 'image/png',
        quality: 0.85, // Balanced quality/performance
        type: 'foreground',
      },
      progress: onProgress ? (key, current, total) => {
        onProgress(key, current, total);
      } : undefined,
      ...options
    };

    const result = await imglyRemoveBackground(imageSource, config);
    console.log('Background removal complete');
    return result;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error(`Background removal failed: ${error.message}`);
  }
};

/**
 * Optimize image size before processing
 * @param {Blob} blob - Image blob
 * @param {number} maxSize - Maximum dimension
 * @returns {Promise<Blob>} Optimized blob
 */
const optimizeImageSize = async (blob, maxSize = 2048) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { width, height } = img;
      
      // Only resize if exceeds max size
      if (width <= maxSize && height <= maxSize) {
        resolve(blob);
        return;
      }
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext('2d', { alpha: true });
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((optimizedBlob) => {
        resolve(optimizedBlob || blob);
      }, 'image/png', 0.95);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Process image with progress tracking (optimized with caching)
 * @param {string} imageDataURL - Image data URL
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Processed image data URL
 */
export const processImageWithProgress = async (imageDataURL, onProgress) => {
  try {
    console.log('Starting optimized image processing...');
    
    // Convert data URL to blob
    const blob = await dataURLToBlob(imageDataURL);
    console.log('Original image size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Check cache
    const cacheKey = await generateCacheKey(blob);
    if (RESULT_CACHE.has(cacheKey)) {
      console.log('Using cached result');
      if (onProgress) {
        onProgress(50, 'Loading from cache');
        setTimeout(() => onProgress(100, 'Complete'), 100);
      }
      return RESULT_CACHE.get(cacheKey);
    }
    
    if (onProgress) onProgress(5, 'Optimizing');
    
    // Optimize image size for faster processing
    const optimizedBlob = await optimizeImageSize(blob, 2048);
    console.log('Optimized image size:', (optimizedBlob.size / 1024 / 1024).toFixed(2), 'MB');
    
    if (onProgress) onProgress(10, 'Processing');
    
    // Remove background with adaptive settings
    const resultBlob = await removeBackground(optimizedBlob, {}, (key, current, total) => {
      // Map library progress to 10-95 range
      if (total > 0) {
        const percentage = 10 + Math.round((current / total) * 85);
        if (onProgress) {
          onProgress(Math.min(percentage, 95), key);
        }
      }
    });
    
    console.log('Background removed, result size:', (resultBlob.size / 1024 / 1024).toFixed(2), 'MB');
    
    if (onProgress) onProgress(97, 'Finalizing');
    
    // Convert result back to data URL
    const resultDataURL = await blobToDataURL(resultBlob);
    
    // Cache result
    if (RESULT_CACHE.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = RESULT_CACHE.keys().next().value;
      RESULT_CACHE.delete(firstKey);
    }
    RESULT_CACHE.set(cacheKey, resultDataURL);
    
    if (onProgress) onProgress(100, 'Complete');
    
    console.log('Processing complete');
    return resultDataURL;
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  }
};
