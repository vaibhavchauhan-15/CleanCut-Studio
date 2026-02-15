/**
 * Image Context - Global State Management
 * Manages image data, processing state, and export settings
 */

import { createContext, useState } from 'react';
import { VIEW_MODES, ZOOM_CONFIG } from '../config/constants';

export const ImageContext = createContext(null);

export const ImageProvider = ({ children }) => {
  // View state
  const [view, setView] = useState(VIEW_MODES.UPLOAD);

  // Image data
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [maskData, setMaskData] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });

  // Processing state
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('Loading Model');

  // Export settings
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [customBackgroundImage, setCustomBackgroundImage] = useState(null);
  const [outputFormat, setOutputFormat] = useState('PNG');

  // Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState(ZOOM_CONFIG.default);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // WebGPU status
  const [isWebGPUActive, setIsWebGPUActive] = useState(false);

  // Reset all state
  const resetState = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setMaskData(null);
    setView(VIEW_MODES.UPLOAD);
    setZoomLevel(ZOOM_CONFIG.default);
    setPanOffset({ x: 0, y: 0 });
  };

  const value = {
    // View
    view,
    setView,

    // Image data
    originalImage,
    setOriginalImage,
    processedImage,
    setProcessedImage,
    maskData,
    setMaskData,
    imageDimensions,
    setImageDimensions,

    // Processing
    processingProgress,
    setProcessingProgress,
    processingStage,
    setProcessingStage,

    // Export
    backgroundColor,
    setBackgroundColor,
    customColor,
    setCustomColor,
    customBackgroundImage,
    setCustomBackgroundImage,
    outputFormat,
    setOutputFormat,

    // Zoom & Pan
    zoomLevel,
    setZoomLevel,
    panOffset,
    setPanOffset,

    // WebGPU
    isWebGPUActive,
    setIsWebGPUActive,

    // Actions
    resetState,
  };

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
};
