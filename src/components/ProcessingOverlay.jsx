import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProcessingOverlay = ({ progress = 0, stage = 'Loading Model' }) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const timer = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < progress) {
          return Math.min(prev + 1, progress);
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [progress]);

  const stages = {
    'Loading Model': 'LOADING_MODEL',
    'Preprocessing': 'PREPROCESSING_IMAGE',
    'Inference': 'RUNNING_INFERENCE',
    'Postprocessing': 'REFINING_MASK',
    'Generating Result': 'COMPOSITING_RESULT'
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[60] bg-background-dark/95 flex flex-col items-center justify-center p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-md">
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.span 
              className="material-icons-round text-4xl text-accent"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              biotech
            </motion.span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Analyzing Image...</h3>
          <p className="text-slate-400">Running AI model locally via WebGPU</p>
        </motion.div>

        <div className="w-full bg-primary/20 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-accent h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-4 flex justify-between text-xs font-mono text-accent">
          <span>{stages[stage] || 'PROCESSING'}</span>
          <span>{displayProgress}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessingOverlay;
