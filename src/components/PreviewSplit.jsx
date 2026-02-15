import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const PreviewSplit = ({ originalImage, processedImage, backgroundColor = 'transparent', customColor = '#FFFFFF', customBackgroundImage = null, cropEnabled = false, cropArea = { x: 10, y: 10, width: 80, height: 80 }, setCropArea = () => {}, cropAspectRatio = 'original', rotation = 0, zoomLevel = 100, setZoomLevel = () => {}, panOffset = { x: 0, y: 0 }, setPanOffset = () => {}, imageDimensions = { width: 1, height: 1 } }) => {
  const [viewMode, setViewMode] = useState('processed'); // 'original', 'processed', 'compare'
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [cropDragState, setCropDragState] = useState(null); // { type: 'move' | 'resize', handle: 'nw' | 'ne' | 'sw' | 'se' | null }
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

  // Crop drag handlers
  const handleCropMouseDown = useCallback((e, dragType, handle = null) => {
    if (!cropEnabled) return;
    e.stopPropagation();
    setCropDragState({ type: dragType, handle, startX: e.clientX, startY: e.clientY, initialCrop: { ...cropArea } });
  }, [cropEnabled, cropArea]);

  const handleCropMouseMove = useCallback((e) => {
    if (!cropDragState || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - cropDragState.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - cropDragState.startY) / rect.height) * 100;
    
    const { initialCrop, type, handle } = cropDragState;
    let newCrop = { ...initialCrop };

    // Get aspect ratio for locking
    const getAspectRatio = () => {
      if (cropAspectRatio === 'freeform') return null;
      const ratioMap = {
        '1:1': 1,
        '4:5': 0.8,
        '16:9': 16/9,
        '9:16': 9/16,
        '4:3': 4/3,
        '3:2': 3/2,
        '21:9': 21/9
      };
      return ratioMap[cropAspectRatio] || null;
    };

    const aspectRatio = getAspectRatio();

    if (type === 'move') {
      // Move the entire crop area
      newCrop.x = Math.max(0, Math.min(100 - initialCrop.width, initialCrop.x + deltaX));
      newCrop.y = Math.max(0, Math.min(100 - initialCrop.height, initialCrop.y + deltaY));
    } else if (type === 'resize') {
      // Resize based on which handle is being dragged
      if (handle === 'nw') {
        const newX = Math.max(0, Math.min(initialCrop.x + initialCrop.width - 5, initialCrop.x + deltaX));
        const newY = Math.max(0, Math.min(initialCrop.y + initialCrop.height - 5, initialCrop.y + deltaY));
        newCrop.width = initialCrop.width + (initialCrop.x - newX);
        newCrop.height = initialCrop.height + (initialCrop.y - newY);
        newCrop.x = newX;
        newCrop.y = newY;
        
        if (aspectRatio) {
          const avgDelta = (newCrop.width / initialCrop.width + newCrop.height / initialCrop.height) / 2;
          newCrop.width = initialCrop.width * avgDelta;
          newCrop.height = newCrop.width / aspectRatio;
          newCrop.x = initialCrop.x + initialCrop.width - newCrop.width;
          newCrop.y = initialCrop.y + initialCrop.height - newCrop.height;
        }
      } else if (handle === 'ne') {
        const newY = Math.max(0, Math.min(initialCrop.y + initialCrop.height - 5, initialCrop.y + deltaY));
        newCrop.width = Math.max(5, Math.min(100 - initialCrop.x, initialCrop.width + deltaX));
        newCrop.height = initialCrop.height + (initialCrop.y - newY);
        newCrop.y = newY;
        
        if (aspectRatio) {
          newCrop.height = newCrop.width / aspectRatio;
          newCrop.y = initialCrop.y + initialCrop.height - newCrop.height;
        }
      } else if (handle === 'sw') {
        const newX = Math.max(0, Math.min(initialCrop.x + initialCrop.width - 5, initialCrop.x + deltaX));
        newCrop.width = initialCrop.width + (initialCrop.x - newX);
        newCrop.height = Math.max(5, Math.min(100 - initialCrop.y, initialCrop.height + deltaY));
        newCrop.x = newX;
        
        if (aspectRatio) {
          newCrop.height = newCrop.width / aspectRatio;
        }
      } else if (handle === 'se') {
        newCrop.width = Math.max(5, Math.min(100 - initialCrop.x, initialCrop.width + deltaX));
        newCrop.height = Math.max(5, Math.min(100 - initialCrop.y, initialCrop.height + deltaY));
        
        if (aspectRatio) {
          newCrop.height = newCrop.width / aspectRatio;
        }
      }
      
      // Edge handles
      if (handle === 'n') {
        const newY = Math.max(0, Math.min(initialCrop.y + initialCrop.height - 5, initialCrop.y + deltaY));
        newCrop.height = initialCrop.height + (initialCrop.y - newY);
        newCrop.y = newY;
        if (aspectRatio) {
          newCrop.width = newCrop.height * aspectRatio;
          newCrop.x = initialCrop.x + (initialCrop.width - newCrop.width) / 2;
        }
      } else if (handle === 's') {
        newCrop.height = Math.max(5, Math.min(100 - initialCrop.y, initialCrop.height + deltaY));
        if (aspectRatio) {
          newCrop.width = newCrop.height * aspectRatio;
          newCrop.x = initialCrop.x + (initialCrop.width - newCrop.width) / 2;
        }
      } else if (handle === 'w') {
        const newX = Math.max(0, Math.min(initialCrop.x + initialCrop.width - 5, initialCrop.x + deltaX));
        newCrop.width = initialCrop.width + (initialCrop.x - newX);
        newCrop.x = newX;
        if (aspectRatio) {
          newCrop.height = newCrop.width / aspectRatio;
          newCrop.y = initialCrop.y + (initialCrop.height - newCrop.height) / 2;
        }
      } else if (handle === 'e') {
        newCrop.width = Math.max(5, Math.min(100 - initialCrop.x, initialCrop.width + deltaX));
        if (aspectRatio) {
          newCrop.height = newCrop.width / aspectRatio;
          newCrop.y = initialCrop.y + (initialCrop.height - newCrop.height) / 2;
        }
      }
    }

    setCropArea(newCrop);
  }, [cropDragState, setCropArea, cropAspectRatio]);

  const handleCropMouseUp = useCallback(() => {
    setCropDragState(null);
  }, []);

  // Add crop drag listeners
  useEffect(() => {
    if (cropDragState) {
      window.addEventListener('mousemove', handleCropMouseMove);
      window.addEventListener('mouseup', handleCropMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCropMouseMove);
        window.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [cropDragState, handleCropMouseMove, handleCropMouseUp]);

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
    <div className="w-full max-w-4xl space-y-4">
      {/* View Mode Toggle Buttons */}
      <div className="flex gap-3 justify-center bg-surface-light/30 backdrop-blur-sm p-2 rounded-xl border border-white/10">
        <button
          onClick={() => setViewMode('original')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'original'
              ? 'bg-accent text-background-dark shadow-lg shadow-accent/30'
              : 'bg-surface-light/50 text-text-secondary hover:bg-surface-light hover:text-text-primary'
          }`}
        >
          <span className="material-icons-round text-lg">image</span>
          <span>Original</span>
        </button>
        <button
          onClick={() => setViewMode('processed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'processed'
              ? 'bg-accent text-background-dark shadow-lg shadow-accent/30'
              : 'bg-surface-light/50 text-text-secondary hover:bg-surface-light hover:text-text-primary'
          }`}
        >
          <span className="material-icons-round text-lg">auto_fix_high</span>
          <span>Processed</span>
        </button>
        <button
          onClick={() => setViewMode('compare')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'compare'
              ? 'bg-accent text-background-dark shadow-lg shadow-accent/30'
              : 'bg-surface-light/50 text-text-secondary hover:bg-surface-light hover:text-text-primary'
          }`}
        >
          <span className="material-icons-round text-lg">compare</span>
          <span>Compare</span>
        </button>
      </div>

      <motion.div 
        ref={containerRef}
        className={`relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 group select-none ${zoomLevel > 100 ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
          transform: `scale(${zoomLevel / 100}) translate(${panOffset.x / (zoomLevel / 100)}px, ${panOffset.y / (zoomLevel / 100)}px) rotate(${rotation}deg)`,
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

      {/* Crop Overlay */}
      {cropEnabled && (
        <>
          {/* Dark overlay outside crop area */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Top */}
            <div 
              className="absolute top-0 left-0 right-0 bg-black/60"
              style={{ height: `${cropArea.y}%` }}
            />
            {/* Bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-black/60"
              style={{ height: `${100 - cropArea.y - cropArea.height}%` }}
            />
            {/* Left */}
            <div 
              className="absolute bg-black/60"
              style={{ 
                top: `${cropArea.y}%`,
                height: `${cropArea.height}%`,
                left: 0,
                width: `${cropArea.x}%`
              }}
            />
            {/* Right */}
            <div 
              className="absolute bg-black/60"
              style={{ 
                top: `${cropArea.y}%`,
                height: `${cropArea.height}%`,
                right: 0,
                width: `${100 - cropArea.x - cropArea.width}%`
              }}
            />
          </div>

          {/* Crop boundary box */}
          <div 
            className="absolute z-40 border-2 border-accent pointer-events-none"
            style={{
              left: `${cropArea.x}%`,
              top: `${cropArea.y}%`,
              width: `${cropArea.width}%`,
              height: `${cropArea.height}%`
            }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-50 pointer-events-none">
              <div className="border-r border-b border-white/30"></div>
              <div className="border-r border-b border-white/30"></div>
              <div className="border-b border-white/30"></div>
              <div className="border-r border-b border-white/30"></div>
              <div className="border-r border-b border-white/30"></div>
              <div className="border-b border-white/30"></div>
              <div className="border-r border-white/30"></div>
              <div className="border-r border-white/30"></div>
              <div className=""></div>
            </div>

            {/* Corner resize handles */}
            <div 
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-nwse-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 'nw')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 'nw')}
            ></div>
            <div 
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-nesw-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 'ne')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 'ne')}
            ></div>
            <div 
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-nesw-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 'sw')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 'sw')}
            ></div>
            <div 
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-nwse-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 'se')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 'se')}
            ></div>

            {/* Edge handles */}
            <div 
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-ns-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 'n')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 'n')}
            ></div>
            <div 
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-ns-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 's')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 's')}
            ></div>
            <div 
              className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-ew-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 'w')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 'w')}
            ></div>
            <div 
              className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full border-2 border-white pointer-events-auto cursor-ew-resize z-10"
              onMouseDown={(e) => handleCropMouseDown(e, 'resize', 'e')}
              onTouchStart={(e) => handleCropMouseDown(e, 'resize', 'e')}
            ></div>
            
            {/* Central move handle */}
            <div
              className="absolute inset-0 cursor-move z-0"
              onMouseDown={(e) => handleCropMouseDown(e, 'move')}
              onTouchStart={(e) => handleCropMouseDown(e, 'move')}
            ></div>
          </div>
        </>
      )}      </div>
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
