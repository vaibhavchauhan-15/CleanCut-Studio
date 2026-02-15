/**
 * useImageExport Hook
 * Handles image export with different backgrounds and formats
 */

import { useCallback } from 'react';
import { useImageContext } from '../contexts/useImageContext';
import { exportImage } from '../services/exportService';

export const useImageExport = () => {
  const {
    processedImage,
    originalImage,
    backgroundColor,
    customColor,
    customBackgroundImage,
    outputFormat,
  } = useImageContext();

  const handleDownload = useCallback(async () => {
    try {
      await exportImage({
        processedImage,
        originalImage,
        backgroundColor,
        customColor,
        customBackgroundImage,
        outputFormat,
      });
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download image. Please try again.');
    }
  }, [
    processedImage,
    originalImage,
    backgroundColor,
    customColor,
    customBackgroundImage,
    outputFormat,
  ]);

  return { handleDownload };
};
