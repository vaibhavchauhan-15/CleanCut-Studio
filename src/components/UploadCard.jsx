import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const UploadCard = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelect(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSampleClick = (sampleUrl) => {
    onImageSelect(sampleUrl);
  };

  return (
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.h1 
        className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Remove Background in Seconds — <span className="text-accent">100% Private</span>
      </motion.h1>
      
      <motion.p 
        className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        No images ever leave your device. Powered by WebGPU for lightning-fast, professional-grade processing entirely in your browser.
      </motion.p>

      {/* Upload Zone */}
      <motion.div 
        className="relative group"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div 
          className={`relative bg-white dark:bg-slate-card border-2 border-dashed ${
            isDragging ? 'border-accent' : 'border-primary/20 dark:border-primary/40'
          } rounded-xl p-12 transition-all hover:border-accent/50 glow-effect`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Icon Set */}
            <div className="flex gap-4 mb-2">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-accent">
                <span className="material-icons-round">lock</span>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-accent">
                <span className="material-icons-round">bolt</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Drop image here</h3>
              <p className="text-slate-400 text-sm">Supports PNG, JPG, WEBP (up to 10MB)</p>
            </div>

            <label htmlFor="file-upload" className="cursor-pointer">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
              <div className="bg-accent hover:bg-amber-600 text-background-dark font-bold py-4 px-10 rounded-lg flex items-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-accent/20">
                <span className="material-icons-round">upload_file</span>
                Upload Image
              </div>
            </label>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">
              <span>No Cloud</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span>No Limits</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span>Zero Cost</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sample Images */}
      <motion.div 
        className="mt-12 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wider">No image? Try one of these:</p>
        <div className="flex gap-4">
          <button 
            onClick={() => handleSampleClick('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800')}
            className="w-16 h-16 rounded-lg overflow-hidden border border-primary/30 hover:border-accent transition-all ring-accent/30 ring-offset-2 ring-offset-background-dark hover:ring-2"
          >
            <img 
              alt="Sample portrait" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" 
            />
          </button>
          <button 
            onClick={() => handleSampleClick('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800')}
            className="w-16 h-16 rounded-lg overflow-hidden border border-primary/30 hover:border-accent transition-all ring-accent/30 ring-offset-2 ring-offset-background-dark hover:ring-2"
          >
            <img 
              alt="Sample product" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" 
            />
          </button>
          <button 
            onClick={() => handleSampleClick('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800')}
            className="w-16 h-16 rounded-lg overflow-hidden border border-primary/30 hover:border-accent transition-all ring-accent/30 ring-offset-2 ring-offset-background-dark hover:ring-2"
          >
            <img 
              alt="Sample sneaker" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" 
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadCard;
