import { useState } from 'react';
import { motion } from 'framer-motion';

const DownloadPanel = ({ processedImage, onDownload, onBackToUpload }) => {
  const [outputFormat, setOutputFormat] = useState('PNG');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [customColor, setCustomColor] = useState('#FFFFFF');

  const backgroundOptions = [
    { id: 'transparent', label: 'Transparent', icon: 'blur_on' },
    { id: 'solid', label: 'Solid', icon: 'palette' },
    { id: 'gradient', label: 'Gradient', icon: 'gradient' },
    { id: 'blur', label: 'Blur', icon: 'image' }
  ];

  const handleDownload = () => {
    onDownload({
      format: outputFormat,
      backgroundColor: backgroundColor === 'solid' ? customColor : backgroundColor
    });
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
              <span className="text-xs text-accent">1.2px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.1"
              defaultValue="1.2"
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent" 
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Hair Smoothing</label>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent">
              <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition"></span>
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
      </div>

      {/* Format Selection */}
      <div className="p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-icons-round text-sm">file_download</span> Export Format
        </h3>
        <div className="flex items-center bg-primary/30 border border-slate-700 rounded-lg p-1">
          <button 
            onClick={() => setOutputFormat('PNG')}
            className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium ${
              outputFormat === 'PNG' ? 'bg-primary text-white' : 'hover:text-white text-slate-400'
            }`}
          >
            PNG
          </button>
          <button 
            onClick={() => setOutputFormat('JPG')}
            className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium ${
              outputFormat === 'JPG' ? 'bg-primary text-white' : 'hover:text-white text-slate-400'
            }`}
          >
            JPG
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DownloadPanel;
