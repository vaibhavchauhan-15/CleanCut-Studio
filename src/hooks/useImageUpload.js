/**
 * useImageUpload Hook
 * Handles image file upload, validation, and preview
 */

import { useCallback } from 'react';
import { useImageContext } from '../contexts/useImageContext';
import { UPLOAD_CONFIG } from '../config/constants';
import { loadImage as loadImageUtil } from '../services/imageProcessingService';

export const useImageUpload = () => {
  const { setOriginalImage, setImageDimensions } = useImageContext();

  const validateFile = useCallback((file) => {
    // Validate file type
    if (!UPLOAD_CONFIG.acceptedFormats.includes(file.type)) {
      throw new Error('Please upload an image file (PNG, JPG, WEBP)');
    }

    // Validate file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      throw new Error('File size must be less than 10MB');
    }

    return true;
  }, []);

  const loadFileAsDataURL = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    try {
      validateFile(file);
      const dataUrl = await loadFileAsDataURL(file);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = dataUrl;
      
      setOriginalImage(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }, [validateFile, loadFileAsDataURL, setOriginalImage, setImageDimensions]);

  const handleImageSelect = useCallback(async (imageSource) => {
    // If it's a file object
    if (imageSource instanceof File) {
      return await handleFileUpload(imageSource);
    }
    
    // If it's already a data URL or external URL
    const img = await loadImageUtil(imageSource);
    setImageDimensions({ width: img.width, height: img.height });
    
    setOriginalImage(imageSource);
    return imageSource;
  }, [handleFileUpload, setOriginalImage, setImageDimensions]);

  return {
    handleFileUpload,
    handleImageSelect,
    validateFile,
  };
};
