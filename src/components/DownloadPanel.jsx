import { motion } from 'framer-motion';
import CropControls from './CropControls';

const DownloadPanel = ({ 
  processedImage, 
  featherRadius,
  setFeatherRadius,
  hairSmoothing,
  setHairSmoothing,
  backgroundColor,
  setBackgroundColor,
  customColor,
  setCustomColor,
  customBackgroundImage,
  setCustomBackgroundImage,
  cropEnabled,
  setCropEnabled,
  cropAspectRatio,
  setCropAspectRatio,
  cropArea,
  setCropArea,
  rotation,
  setRotation,
  outputFormat,
  setOutputFormat,
  onDownload, 
  onBackToUpload 
}) => {
  const backgroundOptions = [
    { id: 'transparent', label: 'Transparent', icon: 'blur_on' },
    { id: 'solid', label: 'Solid', icon: 'palette' },
    { id: 'gradient', label: 'Gradient', icon: 'gradient' },
    { id: 'blur', label: 'Blur', icon: 'image' },
    { id: 'custom', label: 'Custom', icon: 'add_photo_alternate' }
  ];

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBackgroundImage(event.target.result);
        setBackgroundColor('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-80 border-l border-slate-800 bg-background-light dark:bg-background-dark flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
      {/* Refine Section */}
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-icons-round text-sm">auto_fix_high</span> Refine Edge
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Feathering</label>
              <span className="text-xs text-accent">{featherRadius.toFixed(1)}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.1"
              value={featherRadius}
              onChange={(e) => setFeatherRadius(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent" 
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Hair Smoothing</label>
            <button 
              onClick={() => setHairSmoothing(!hairSmoothing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hairSmoothing ? 'bg-accent' : 'bg-slate-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                hairSmoothing ? 'translate-x-6' : 'translate-x-1'
              }`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Background Section */}
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-icons-round text-sm">wallpaper</span> Background
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {backgroundOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setBackgroundColor(option.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                backgroundColor === option.id
                  ? 'bg-primary border-accent'
                  : 'hover:bg-primary/30 border-transparent'
              }`}
            >
              <span className={`material-icons-round text-xl ${
                backgroundColor === option.id ? 'text-accent' : 'text-slate-400'
              }`}>
                {option.icon}
              </span>
              <span className={`text-[10px] font-medium ${
                backgroundColor === option.id ? 'text-accent' : 'text-slate-400'
              }`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
        
        {backgroundColor === 'solid' && (
          <div className="mt-4">
            <label className="text-xs text-slate-500 mb-2 block">Custom Color</label>
            <input 
              type="color" 
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        )}
        
        {backgroundColor === 'custom' && (
          <div className="mt-4">
            <label className="text-xs text-slate-500 mb-2 block">Upload Background Image</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleCustomImageUpload}
                className="hidden"
                id="custom-bg-upload"
              />
              <label 
                htmlFor="custom-bg-upload"
                className="w-full h-24 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-primary/20 transition-all"
              >
                {customBackgroundImage ? (
                  <img 
                    src={customBackgroundImage} 
                    alt="Custom Background" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <span className="material-icons-round text-2xl text-slate-500 mb-1">add_photo_alternate</span>
                    <span className="text-xs text-slate-500">Click to upload</span>
                  </>
                )}
              </label>
            </div>
            {customBackgroundImage && (
              <button
                onClick={() => setCustomBackgroundImage(null)}
                className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <span className="material-icons-round text-sm">delete</span>
                Remove Image
              </button>
            )}
          </div>
        )}
      </div>

      {/* Crop Section */}
      <div className="p-6 border-b border-slate-800">
        <CropControls
          cropEnabled={cropEnabled}
          setCropEnabled={setCropEnabled}
          cropAspectRatio={cropAspectRatio}
          setCropAspectRatio={setCropAspectRatio}
          setCropArea={setCropArea}
          rotation={rotation}
          setRotation={setRotation}
        />
      </div>

      {/* Format Selection */}
      <div className="p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-icons-round text-sm">file_download</span> Export Format
        </h3>
        <div className="flex items-center bg-primary/30 border border-slate-700 rounded-lg p-1">
          <button 
            onClick={() => setOutputFormat('PNG')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium ${
              outputFormat === 'PNG' ? 'bg-primary text-white' : 'hover:text-white text-slate-400'
            }`}
          >
            PNG
          </button>
          <button 
            onClick={() => setOutputFormat('JPG')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium ${
              outputFormat === 'JPG' ? 'bg-primary text-white' : 'hover:text-white text-slate-400'
            }`}
          >
            JPG
          </button>
          <button 
            onClick={() => setOutputFormat('WEBP')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium ${
              outputFormat === 'WEBP' ? 'bg-primary text-white' : 'hover:text-white text-slate-400'
            }`}
          >
            WebP
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DownloadPanel;
