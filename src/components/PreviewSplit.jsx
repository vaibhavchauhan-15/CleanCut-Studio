import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useImageContext } from '../contexts/useImageContext';

const PreviewSplit = () => {
  const {
    originalImage,
    processedImage,
    backgroundColor,
    customColor,
    customBackgroundImage,
    zoomLevel,
    setZoomLevel,
    panOffset,
    setPanOffset,
    imageDimensions,
    viewMode,
  } = useImageContext();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageContainerRef = useRef(null);
  const rafRef = useRef(null);
  const pendingPositionRef = useRef(null);

  const updateSliderPosition = useCallback((clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Store the pending position
    pendingPositionRef.current = clampedPercentage;

    // Use RAF for smooth updates
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingPositionRef.current !== null) {
          setSliderPosition(pendingPositionRef.current);
          pendingPositionRef.current = null;
        }
        rafRef.current = null;
      });
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    updateSliderPosition(e.clientX);
  }, [isDragging, updateSliderPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !e.touches[0]) return;
    e.preventDefault();
    updateSliderPosition(e.touches[0].clientX);
  }, [isDragging, updateSliderPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pan handlers for zoomed images
  const handlePanStart = useCallback((e) => {
    if (zoomLevel <= 100) return; // Only pan when zoomed in
    if (e.target.closest('.zoom-slider-handle')) return; // Don't pan when dragging slider
    
    e.preventDefault();
    setIsPanning(true);
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    setPanStart({ x: clientX - panOffset.x, y: clientY - panOffset.y });
  }, [zoomLevel, panOffset]);

  const handlePanMove = useCallback((e) => {
    if (!isPanning) return;
    e.preventDefault();
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    setPanOffset({
      x: clientX - panStart.x,
      y: clientY - panStart.y
    });
  }, [isPanning, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -25 : 25;
    setZoomLevel(prev => Math.max(25, Math.min(400, prev + delta)));
  }, [setZoomLevel]);

  // Global event listeners for smooth dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Global event listeners for panning
  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handlePanMove);
      window.addEventListener('mouseup', handlePanEnd);
      window.addEventListener('touchmove', handlePanMove, { passive: false });
      window.addEventListener('touchend', handlePanEnd);

      return () => {
        window.removeEventListener('mousemove', handlePanMove);
        window.removeEventListener('mouseup', handlePanEnd);
        window.removeEventListener('touchmove', handlePanMove);
        window.removeEventListener('touchend', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Reset pan when zoom is set to 100% or less
  useEffect(() => {
    if (zoomLevel <= 100) {
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Render background based on selection
  const renderBackground = () => {
    if (backgroundColor === 'transparent') {
      return 'checkerboard';
    } else if (backgroundColor === 'solid') {
      return '';
    } else if (backgroundColor === 'gradient') {
      return '';
    } else if (backgroundColor === 'blur') {
      return '';
    } else if (backgroundColor === 'custom') {
      return '';
    }
    return 'checkerboard';
  };

  const getBackgroundStyle = () => {
    if (backgroundColor === 'solid') {
      return { backgroundColor: customColor };
    } else if (backgroundColor === 'gradient') {
      return { background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' };
    }
    return {};
  };

  // Calculate aspect ratio - always use original image ratio
  // Canvas stays fixed size during cropping, only changes to cropped ratio after crop is applied
  const aspectRatio = imageDimensions.width / imageDimensions.height;
  const aspectRatioStyle = { aspectRatio: `${aspectRatio}` };

  return (
    <div className="w-full max-w-[500px]">
      <motion.div 
        ref={containerRef}
        className={`relative w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-700 group select-none ${zoomLevel > 100 ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={aspectRatioStyle}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onWheel={handleWheel}
        onMouseDown={(e) => {
          if (!e.target.closest('.zoom-slider-handle')) {
            handlePanStart(e);
          }
        }}
        onTouchStart={(e) => {
          if (!e.target.closest('.zoom-slider-handle')) {
            handlePanStart(e);
          }
        }}
      >
      {/* Zoomable/Pannable/Rotatable Container */}
      <div
        ref={imageContainerRef}
        className="absolute inset-0 transition-transform duration-150 ease-out"
        style={{
          transform: `scale(${zoomLevel / 100}) translate(${panOffset.x / (zoomLevel / 100)}px, ${panOffset.y / (zoomLevel / 100)}px)`,
          pointerEvents: zoomLevel > 100 && isPanning ? 'none' : 'auto'
        }}
      >
      {/* Background Layer (Processed/Transparent Side) */}
      <div className={`absolute inset-0 ${renderBackground()} pointer-events-none`} style={getBackgroundStyle()}>
        {backgroundColor === 'blur' && (
          <img 
            src={originalImage}
            alt="Blurred Background" 
            className="w-full h-full object-cover filter blur-[20px] scale-110 select-none"
            draggable="false"
          />
        )}
        {backgroundColor === 'custom' && customBackgroundImage && (
          <img 
            src={customBackgroundImage}
            alt="Custom Background" 
            className="w-full h-full object-cover select-none"
            draggable="false"
          />
        )}
        <img 
          src={processedImage || originalImage}
          alt="Processed" 
          className="w-full h-full object-contain filter drop-shadow-2xl select-none"
          draggable="false"
          style={{ position: (backgroundColor === 'blur' || backgroundColor === 'custom') ? 'absolute' : 'relative', top: 0, left: 0 }}
        />
      </div>

      {/* Foreground Layer (Original Side - Clipped) - Only in Compare Mode */}
      {viewMode === 'compare' && (
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none" 
          style={{ 
            width: `${sliderPosition}%`,
            willChange: isDragging ? 'width' : 'auto'
          }}
        >
          <img 
            src={originalImage}
            alt="Original" 
            className="absolute inset-0 h-full max-w-none object-contain select-none" 
            style={{ width: `${(100 / sliderPosition) * 100}%` }}
            draggable="false"
          />
        </div>
      )}

      {/* Original View Only - Full Original Image */}
      {viewMode === 'original' && (
        <div className="absolute inset-0">
          <img 
            src={originalImage}
            alt="Original" 
            className="w-full h-full object-contain select-none"
            draggable="false"
          />
        </div>
      )}

      {/* Slider Handle - Only in Compare Mode */}
      {viewMode === 'compare' && (
        <div 
          className="zoom-slider-handle absolute top-0 bottom-0 w-1 bg-accent cursor-ew-resize z-20 transition-shadow"
          style={{ 
            left: `${sliderPosition}%`,
            willChange: isDragging ? 'left' : 'auto'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-full shadow-lg flex items-center justify-center transition-transform ${isDragging ? 'scale-110' : 'hover:scale-110'}`}>
            <span className="material-icons-round text-background-dark">unfold_more</span>
          </div>
        </div>
      )}

      </div>
      {/* End of Zoomable Container */}
      
      {/* Labels - Only in Compare Mode */}
      {viewMode === 'compare' && (
        <>
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-bold text-white uppercase tracking-widest border border-white/10 pointer-events-none">
            Original
          </div>
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-bold text-white uppercase tracking-widest border border-white/10 pointer-events-none">
            Processed
          </div>
        </>
      )}

      {/* View Mode Label - For Original/Processed Views */}
      {viewMode !== 'compare' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg text-sm font-bold text-white uppercase tracking-widest border border-white/10 pointer-events-none flex items-center gap-2">
          <span className="material-icons-round text-base">
            {viewMode === 'original' ? 'image' : 'auto_fix_high'}
          </span>
          {viewMode === 'original' ? 'Original Image' : 'Processed Image'}
        </div>
      )}
    </motion.div>
    </div>
  );
};

export default PreviewSplit;
