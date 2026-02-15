/**
 * useBackgroundRemoval Hook
 * Handles the background removal process with progress tracking
 */

import { useCallback } from 'react';
import { useImageContext } from '../contexts/useImageContext';
import { VIEW_MODES, PROCESSING_STAGES } from '../config/constants';
import { processImageWithProgress } from '../utils/backgroundRemoval';

export const useBackgroundRemoval = () => {
  const {
    setView,
    setProcessedImage,
    setProcessingProgress,
    setProcessingStage,
  } = useImageContext();

  const processImage = useCallback(async (imageDataUrl) => {
    try {
      setView(VIEW_MODES.PROCESSING);
      setProcessingProgress(0);
      setProcessingStage(PROCESSING_STAGES.LOADING_MODEL);

      // Process image with progress callback
      const processedUrl = await processImageWithProgress(
        imageDataUrl,
        (progress) => {
          // Map library progress to our progress stages
          if (progress < 30) {
            setProcessingStage(PROCESSING_STAGES.LOADING_MODEL);
            setProcessingProgress(10 + (progress / 30) * 20);
          } else if (progress < 70) {
            setProcessingStage(PROCESSING_STAGES.INFERENCE);
            setProcessingProgress(30 + ((progress - 30) / 40) * 40);
          } else if (progress < 90) {
            setProcessingStage(PROCESSING_STAGES.POSTPROCESSING);
            setProcessingProgress(70 + ((progress - 70) / 20) * 20);
          } else {
            setProcessingStage(PROCESSING_STAGES.GENERATING_RESULT);
            setProcessingProgress(90 + ((progress - 90) / 10) * 10);
          }
        }
      );

      setProcessedImage(processedUrl);
      setProcessingProgress(100);
      setProcessingStage(PROCESSING_STAGES.COMPLETE);

      // Wait to show completion
      setTimeout(() => {
        setView(VIEW_MODES.EDITOR);
      }, 500);

      return processedUrl;
    } catch (error) {
      console.error('Processing error:', error);
      setView(VIEW_MODES.UPLOAD);
      throw error;
    }
  }, [setView, setProcessedImage, setProcessingProgress, setProcessingStage]);

  return { processImage };
};
