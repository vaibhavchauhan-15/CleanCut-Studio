import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadCard from './components/UploadCard';
import PreviewSplit from './components/PreviewSplit';
import ProcessingOverlay from './components/ProcessingOverlay';
import DownloadPanel from './components/DownloadPanel';
import RefineBrush from './components/RefineBrush';
import modelLoader from './ai/modelLoader';
import { loadImage, resizeImage, imageToTensor, applyMaskToImage } from './utils/imageProcessing';

function App() {
  const [view, setView] = useState('upload'); // 'upload', 'processing', 'editor', 'refine'
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [maskData, setMaskData] = useState(null);
  const [isWebGPUActive, setIsWebGPUActive] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('Loading Model');

  // Check WebGPU support on mount
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

  const handleImageSelect = async (imageDataUrl) => {
    setOriginalImage(imageDataUrl);
    setView('processing');
    
    try {
      // Load and process image
      const img = await loadImage(imageDataUrl);
      const resizedCanvas = await resizeImage(img, 1024);
      
      setProcessingProgress(20);
      setProcessingStage('Preprocessing');
      
      // Convert to tensor
      const tensorData = imageToTensor(resizedCanvas);
      
      setProcessingProgress(40);
      setProcessingStage('Inference');
      
      // For demo purposes, simulate processing
      // In production, this would use the actual ONNX model
      await simulateProcessing();
      
      setProcessingProgress(80);
      setProcessingStage('Postprocessing');
      
      // Create mock processed image (for demo)
      const processedUrl = await createMockProcessedImage(resizedCanvas);
      setProcessedImage(processedUrl);
      
      setProcessingProgress(100);
      setProcessingStage('Generating Result');
      
      // Wait a bit to show completion
      setTimeout(() => {
        setView('editor');
      }, 500);
      
    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process image. Please try again.');
      setView('upload');
    }
  };

  const simulateProcessing = () => {
    return new Promise(resolve => {
      let progress = 40;
      const interval = setInterval(() => {
        progress += 5;
        setProcessingProgress(progress);
        if (progress >= 75) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const createMockProcessedImage = async (canvas) => {
    // Create a simple mock by adding transparency
    // In production, this would use the actual mask from the model
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple edge detection for demo
    for (let i = 0; i < imageData.data.length; i += 4) {
      const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      if (brightness < 50) {
        imageData.data[i + 3] = 0; // Make dark areas transparent
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const handleDownload = async (options) => {
    const { format, backgroundColor } = options;
    
    // Create download link
    const link = document.createElement('a');
    link.download = `cleancut-${Date.now()}.${format.toLowerCase()}`;
    link.href = processedImage;
    link.click();
  };

  const handleBackToUpload = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setMaskData(null);
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="material-icons-round text-background-dark text-xl">auto_fix_high</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              CleanCut<span className="text-accent">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            {isWebGPUActive && (
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                WebGPU ACTIVE
              </div>
            )}
            <a 
              className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors" 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {view === 'upload' && (
          <div className="pt-32 pb-20 px-6 mesh-gradient overflow-hidden min-h-screen">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full radial-bg pointer-events-none"></div>
            <UploadCard onImageSelect={handleImageSelect} />
            
            {/* Features Section */}
            <section className="py-24 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div 
                    className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <div className="text-accent mb-4">
                      <span className="material-icons-round text-3xl">memory</span>
                    </div>
                    <h4 className="text-xl font-bold mb-3">WebGPU Accelerated</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Harness the full power of your local GPU hardware for instant AI inference. Experience speed that rivals cloud solutions without the latency.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    <div className="text-accent mb-4">
                      <span className="material-icons-round text-3xl">shield</span>
                    </div>
                    <h4 className="text-xl font-bold mb-3">100% Client-Side</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Privacy is our priority. Your photos never touch a server. All processing happens locally in your browser session for maximum security.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    <div className="text-accent mb-4">
                      <span className="material-icons-round text-3xl">payments</span>
                    </div>
                    <h4 className="text-xl font-bold mb-3">Zero Cost Forever</h4>
                    <p className="text-slate-400 leading-relaxed">
                      No subscriptions, no credits, no watermarks. Since we don't pay for server compute, you don't pay for the service. Completely free.
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'editor' && (
          <div className="h-screen flex flex-col overflow-hidden pt-16">
            <div className="flex-1 flex overflow-hidden">
              <section className="flex-1 relative bg-neutral-900 overflow-hidden flex items-center justify-center p-8">
                <PreviewSplit originalImage={originalImage} processedImage={processedImage} />
                
                {/* Canvas Zoom/Pan Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-xl">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-300">
                    <span className="material-icons-round text-xl">zoom_out</span>
                  </button>
                  <span className="text-xs font-medium px-4 border-x border-white/10 text-slate-300">100%</span>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-300">
                    <span className="material-icons-round text-xl">zoom_in</span>
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-300">
                    <span className="material-icons-round text-xl">fit_screen</span>
                  </button>
                </div>
              </section>

              <DownloadPanel 
                processedImage={processedImage}
                onDownload={handleDownload}
                onBackToUpload={handleBackToUpload}
              />
            </div>

            {/* Bottom Action Bar */}
            <footer className="h-20 border-t border-slate-800 bg-background-light dark:bg-background-dark flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center">
                <button 
                  onClick={handleBackToUpload}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-primary/20 rounded-lg transition-all font-medium"
                >
                  <span className="material-icons-round">arrow_back</span>
                  Back to Upload
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDownload}
                  className="h-11 px-8 bg-accent hover:bg-amber-600 text-background-dark font-bold rounded-lg shadow-lg shadow-accent/10 flex items-center gap-3 transition-all"
                >
                  Download Result
                  <span className="material-icons-round">download</span>
                </button>
              </div>
            </footer>
          </div>
        )}

        {view === 'refine' && (
          <div className="h-screen flex flex-col overflow-hidden pt-16">
            <RefineBrush maskData={maskData} onMaskUpdate={setMaskData} />
          </div>
        )}
      </main>

      {/* Processing Overlay */}
      <AnimatePresence>
        {view === 'processing' && (
          <ProcessingOverlay 
            progress={processingProgress} 
            stage={processingStage}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      {view === 'upload' && (
        <footer className="py-12 px-6 border-t border-primary/10 bg-background-light dark:bg-background-dark text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">CleanCut Studio v1.0.4</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span className="text-sm">Built with WebGPU & ONNX Runtime</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a className="hover:text-accent transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-accent transition-colors" href="#">Terms of Use</a>
              <a className="hover:text-accent transition-colors" href="#">Documentation</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
