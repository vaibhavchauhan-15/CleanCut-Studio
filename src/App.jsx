/**
 * Main App Component - Optimized
 * Lazy loading for better performance
 */

import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ImageProvider } from './contexts/ImageContext';
import { useImageContext } from './contexts/useImageContext';
import { useWebGPU } from './hooks/useWebGPU';
import { useImageExport } from './hooks/useImageExport';
import { useZoomPan } from './hooks/useZoomPan';

// Critical components (loaded immediately)
import Navigation from './components/layout/Navigation';
import UploadCard from './components/UploadCard';

// Lazy loaded components (loaded on demand)
const Footer = lazy(() => import('./components/layout/Footer'));
const FeaturesSection = lazy(() => import('./components/layout/FeaturesSection'));
const PreviewSplit = lazy(() => import('./components/PreviewSplit'));
const ProcessingOverlay = lazy(() => import('./components/ProcessingOverlay'));
const DownloadPanel = lazy(() => import('./components/DownloadPanel'));
const RefineBrush = lazy(() => import('./components/RefineBrush'));
const ZoomControls = lazy(() => import('./components/editor/ZoomControls'));

import { VIEW_MODES, ZOOM_CONFIG } from './config/constants';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
  </div>
);

// Main App Content (uses context)
const AppContent = () => {
  const {
    view,
    processingProgress,
    processingStage,
    maskData,
    setMaskData,
    resetState,
  } = useImageContext();

  // Initialize WebGPU detection
  useWebGPU();

  // Export hook
  const { handleDownload } = useImageExport();

  // Zoom & Pan controls
  const {
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  } = useZoomPan();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <Navigation />

      <main className="relative">
        {/* Upload View */}
        {view === VIEW_MODES.UPLOAD && (
          <div className="pt-32 pb-20 px-6 mesh-gradient overflow-hidden min-h-screen">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full radial-bg pointer-events-none"></div>
            <UploadCard />
            <Suspense fallback={<LoadingFallback />}>
              <FeaturesSection />
            </Suspense>
          </div>
        )}

        {/* Editor View */}
        {view === VIEW_MODES.EDITOR && (
          <div className="min-h-screen bg-neutral-900 flex flex-col pt-16">
            <div className="flex-1 flex justify-center items-start gap-8 px-8 py-10 max-w-[1600px] mx-auto w-full">
              <section className="flex-1 flex flex-col items-center justify-start space-y-6">
                <Suspense fallback={<LoadingFallback />}>
                  <PreviewSplit />

                  {/* Canvas Zoom/Pan Controls */}
                  <ZoomControls
                    zoomLevel={zoomLevel}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onZoomReset={handleZoomReset}
                    minZoom={ZOOM_CONFIG.min}
                    maxZoom={ZOOM_CONFIG.max}
                  />
                </Suspense>
              </section>

              {/* Right Side Panel */}
              <aside className="w-[380px] shrink-0">
                <Suspense fallback={<LoadingFallback />}>
                  <DownloadPanel />
                </Suspense>
              </aside>
            </div>

            {/* Bottom Action Bar */}
            <footer className="sticky bottom-0 h-16 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between px-8 shadow-lg z-20">
              <div className="flex items-center">
                <button
                  onClick={resetState}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all font-medium"
                >
                  <span className="material-icons-round">arrow_back</span>
                  Back to Upload
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownload}
                  className="h-11 px-8 bg-accent hover:bg-amber-600 text-background-dark font-bold rounded-lg shadow-lg flex items-center gap-3 transition-all"
                >
                  Download Result
                  <span className="material-icons-round">download</span>
                </button>
              </div>
            </footer>
          </div>
        )}

        {/* Refine View */}
        {view === VIEW_MODES.REFINE && (
          <div className="h-screen flex flex-col overflow-hidden pt-16">
            <Suspense fallback={<LoadingFallback />}>
              <RefineBrush maskData={maskData} onMaskUpdate={setMaskData} />
            </Suspense>
          </div>
        )}
      </main>

      {/* Processing Overlay */}
      <AnimatePresence>
        {view === VIEW_MODES.PROCESSING && (
          <Suspense fallback={null}>
            <ProcessingOverlay progress={processingProgress} stage={processingStage} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Footer */}
      {view === VIEW_MODES.UPLOAD && (
        <Suspense fallback={<LoadingFallback />}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
};

// Main App with Provider
function App() {
  return (
    <ImageProvider>
      <AppContent />
    </ImageProvider>
  );
}

export default App;
