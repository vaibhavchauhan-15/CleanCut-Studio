import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const PreviewSplit = ({ originalImage, processedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <motion.div 
      ref={containerRef}
      className="relative w-full max-w-4xl aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50 group cursor-ew-resize"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Layer (Processed/Transparent Side) */}
      <div className="absolute inset-0 checkerboard">
        <img 
          src={processedImage || originalImage}
          alt="Processed" 
          className="w-full h-full object-contain filter drop-shadow-2xl" 
        />
      </div>

      {/* Foreground Layer (Original Side - Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={originalImage}
          alt="Original" 
          className="absolute inset-0 h-full max-w-none object-contain" 
          style={{ width: `${(100 / sliderPosition) * 100}%` }}
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-accent cursor-ew-resize z-20"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-full shadow-lg flex items-center justify-center">
          <span className="material-icons-round text-background-dark">unfold_more</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-bold text-white uppercase tracking-widest border border-white/10">
        Original
      </div>
      <div className="absolute bottom-4 right-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-bold text-white uppercase tracking-widest border border-white/10">
        Processed
      </div>
    </motion.div>
  );
};

export default PreviewSplit;
