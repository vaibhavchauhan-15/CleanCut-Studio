/**
 * useZoomPan Hook
 * Handles zoom and pan operations for the image editor
 */

import { useCallback } from 'react';
import { useImageContext } from '../contexts/useImageContext';
import { ZOOM_CONFIG } from '../config/constants';

export const useZoomPan = () => {
  const { zoomLevel, setZoomLevel, panOffset, setPanOffset } = useImageContext();

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + ZOOM_CONFIG.step, ZOOM_CONFIG.max));
  }, [setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - ZOOM_CONFIG.step, ZOOM_CONFIG.min));
  }, [setZoomLevel]);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(ZOOM_CONFIG.default);
    setPanOffset({ x: 0, y: 0 });
  }, [setZoomLevel, setPanOffset]);

  const handleZoomChange = useCallback((newZoom) => {
    const clampedZoom = Math.max(
      ZOOM_CONFIG.min,
      Math.min(ZOOM_CONFIG.max, newZoom)
    );
    setZoomLevel(clampedZoom);
  }, [setZoomLevel]);

  const handlePan = useCallback((deltaX, deltaY) => {
    setPanOffset((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, [setPanOffset]);

  const resetPan = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [setPanOffset]);

  return {
    zoomLevel,
    panOffset,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleZoomChange,
    handlePan,
    resetPan,
  };
};
