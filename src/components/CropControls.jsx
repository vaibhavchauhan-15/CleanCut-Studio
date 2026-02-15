import { motion } from 'framer-motion';

const CropControls = ({ 
  cropEnabled,
  setCropEnabled,
  cropAspectRatio,
  setCropAspectRatio,
  setCropArea,
  rotation,
  setRotation
}) => {
  // Standard aspect ratios
  const standardRatios = [
    { id: 'freeform', label: 'Free', ratio: null, icon: 'crop_free' },
    { id: '1:1', label: '1:1', ratio: 1, icon: 'crop_square', desc: 'Square' },
    { id: '4:5', label: '4:5', ratio: 0.8, icon: 'crop_portrait', desc: 'Portrait' },
    { id: '16:9', label: '16:9', ratio: 16/9, icon: 'crop_16_9', desc: 'Landscape' },
    { id: '9:16', label: '9:16', ratio: 9/16, icon: 'crop_portrait', desc: 'Story' },
    { id: '4:3', label: '4:3', ratio: 4/3, icon: 'crop_landscape', desc: 'Classic' },
    { id: '3:2', label: '3:2', ratio: 3/2, icon: 'crop_landscape', desc: 'DSLR' },
    { id: '21:9', label: '21:9', ratio: 21/9, icon: 'crop_landscape', desc: 'Banner' }
  ];

  const handleRatioSelect = (ratioId, ratioValue) => {
    setCropAspectRatio(ratioId);
    
    // Calculate crop area based on ratio
    if (ratioValue === null) {
      // Freeform
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
    } else if (ratioValue === 1) {
      // Square
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
    } else if (ratioValue > 1) {
      // Landscape
      const height = 80 / ratioValue;
      const y = (100 - height) / 2;
      setCropArea({ x: 10, y, width: 80, height });
    } else {
      // Portrait
      const width = 80 * ratioValue;
      const x = (100 - width) / 2;
      setCropArea({ x, y: 10, width, height: 80 });
    }
  };

  const quickRotate90 = (direction) => {
    if (direction === 'left') {
      setRotation((prev) => prev - 90);
    } else {
      setRotation((prev) => prev + 90);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="material-icons-round text-sm">crop</span> Crop & Rotate
        </h3>
        <button 
          onClick={() => setCropEnabled(!cropEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            cropEnabled ? 'bg-accent' : 'bg-slate-700'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            cropEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}></span>
        </button>
      </div>

      {cropEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          {/* Rotation Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">Rotation</label>
              <span className="text-xs text-accent font-semibold">{rotation}°</span>
            </div>
            <input 
              type="range" 
              min="-45" 
              max="45" 
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent mb-2" 
            />
            <div className="flex gap-2">
              <button
                onClick={() => quickRotate90('left')}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors text-xs font-medium text-slate-300"
              >
                <span className="material-icons-round text-sm">rotate_left</span>
                90° Left
              </button>
              <button
                onClick={() => quickRotate90('right')}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors text-xs font-medium text-slate-300"
              >
                <span className="material-icons-round text-sm">rotate_right</span>
                90° Right
              </button>
              <button
                onClick={() => setRotation(0)}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                title="Reset rotation"
              >
                <span className="material-icons-round text-sm text-slate-300">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Standard Ratios */}
          <div>
            <label className="text-xs text-slate-300 mb-2 block font-semibold">Standard Ratios</label>
            <div className="grid grid-cols-4 gap-2">
              {standardRatios.map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => handleRatioSelect(ratio.id, ratio.ratio)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                    cropAspectRatio === ratio.id
                      ? 'bg-accent/20 border-accent'
                      : 'hover:bg-slate-700/50 border-slate-700'
                  }`}
                  title={ratio.desc}
                >
                  <span className={`material-icons-round text-base ${
                    cropAspectRatio === ratio.id ? 'text-accent' : 'text-slate-400'
                  }`}>
                    {ratio.icon}
                  </span>
                  <span className={`text-[9px] font-medium ${
                    cropAspectRatio === ratio.id ? 'text-accent' : 'text-slate-400'
                  }`}>
                    {ratio.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-slate-300 bg-slate-700/30 border border-slate-700 p-2 rounded-lg flex items-start gap-2">
            <span className="material-icons-round text-sm text-slate-400">info</span>
            <span>Drag crop handles or corners to adjust. Use rotation for fine-tuning.</span>
          </div>

          {/* Done Button */}
          <button
            onClick={() => setCropEnabled(false)}
            className="w-full py-3 bg-accent hover:bg-amber-600 text-background-dark font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-icons-round">check_circle</span>
            Done Cropping
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CropControls;
