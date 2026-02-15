/**
 * useWebGPU Hook
 * Handles WebGPU detection and status
 */

import { useEffect } from 'react';
import { useImageContext } from '../contexts/useImageContext';

export const useWebGPU = () => {
  const { isWebGPUActive, setIsWebGPUActive } = useImageContext();

  useEffect(() => {
    checkWebGPUSupport();
  }, []);

  const checkWebGPUSupport = async () => {
    try {
      if ('gpu' in navigator) {
        const adapter = await navigator.gpu?.requestAdapter();
        setIsWebGPUActive(!!adapter);
      }
    } catch (error) {
      console.warn('WebGPU check failed:', error);
      setIsWebGPUActive(false);
    }
  };

  return { isWebGPUActive, checkWebGPUSupport };
};
