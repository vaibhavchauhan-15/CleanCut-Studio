import { useState, useRef, useEffect } from 'react';

const RefineBrush = ({ maskData, onMaskUpdate }) => {
  const [brushSize, setBrushSize] = useState(24);
  const [brushHardness, setBrushHardness] = useState(60);
  const [brushMode, setBrushMode] = useState('erase'); // 'erase' or 'restore'
  const [zoom, setZoom] = useState(250);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    draw(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = brushMode === 'erase' ? 'destination-out' : 'source-over';
    ctx.fillStyle = brushMode === 'erase' ? 'rgba(255, 77, 77, 0.45)' : 'transparent';
    
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Notify parent of mask update
    if (onMaskUpdate) {
      onMaskUpdate(canvas.toDataURL());
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden flex items-center justify-center canvas-checkerboard">
      {/* Zoomed-in Image with Mask Overlay */}
      <div className="relative max-w-4xl w-full h-[80vh] flex items-center justify-center" style={{ transform: `scale(${zoom / 100})` }}>
        <div className="relative shadow-2xl border border-white/5">
          <canvas
            ref={canvasRef}
            className="max-h-[70vh] w-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Tool Controls (Left) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        <div className="bg-primary/90 backdrop-blur-xl border border-white/10 p-2 rounded-xl shadow-2xl flex flex-col gap-2">
          <button 
            onClick={() => setBrushMode('restore')}
            className={`w-12 h-12 flex items-center justify-center rounded-lg ${
              brushMode === 'restore' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-white/60'
            } shadow-inner transition-colors relative`}
            title="Restore (B)"
          >
            <span className="material-icons-round">brush</span>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-primary text-[10px] flex items-center justify-center">+</span>
          </button>
          <button 
            onClick={() => setBrushMode('erase')}
            className={`w-12 h-12 flex items-center justify-center rounded-lg ${
              brushMode === 'erase' ? 'bg-red-600 text-white' : 'hover:bg-white/5 text-white/60'
            } transition-colors relative`}
            title="Erase (E)"
          >
            <span className="material-icons-round">auto_fix_normal</span>
            <span className="absolute -bottom-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-primary text-[10px] flex items-center justify-center">-</span>
          </button>
        </div>

        {/* Brush Settings */}
        <div className="bg-primary/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl w-48">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Brush Settings</span>
            <span className="text-[11px] font-mono text-blue-400">{brushSize}px</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-white/60">Size</label>
                <span className="text-[10px] text-white/30 text-xs">[ / ]</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/60">Hardness</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={brushHardness}
                onChange={(e) => setBrushHardness(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Control */}
      <div className="absolute right-6 bottom-6 flex items-center gap-2 bg-primary/90 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-lg shadow-2xl">
        <button 
          onClick={() => setZoom(Math.max(50, zoom - 25))}
          className="text-white/60 hover:text-white transition-colors"
        >
          <span className="material-icons-round text-lg">zoom_out</span>
        </button>
        <span className="text-[11px] font-mono w-12 text-center text-white/80">{zoom}%</span>
        <button 
          onClick={() => setZoom(Math.min(400, zoom + 25))}
          className="text-white/60 hover:text-white transition-colors"
        >
          <span className="material-icons-round text-lg">zoom_in</span>
        </button>
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button 
          onClick={() => setZoom(100)}
          className="text-white/60 hover:text-white transition-colors" 
          title="Fit Screen"
        >
          <span className="material-icons-round text-lg">fullscreen</span>
        </button>
      </div>

      {/* Helper Tooltip */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background-dark/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full">
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/80">Space</kbd>
          <span>Pan</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/80">Ctrl</kbd>
          <span>+ Scroll Zoom</span>
        </div>
      </div>
    </div>
  );
};

export default RefineBrush;
