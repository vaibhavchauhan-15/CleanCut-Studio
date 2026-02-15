/**
 * Zoom Controls Component
 * Zoom in/out/reset controls for image editor
 */

const ZoomControls = ({ zoomLevel, onZoomIn, onZoomOut, onZoomReset, minZoom = 25, maxZoom = 400 }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-1.5 rounded-xl shadow-xl">
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
        disabled={zoomLevel <= minZoom}
      >
        <span className="material-icons-round text-xl">zoom_out</span>
      </button>
      <span className="text-xs font-medium px-4 border-x border-slate-700 text-slate-300 min-w-[48px] text-center">
        {zoomLevel}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
        disabled={zoomLevel >= maxZoom}
      >
        <span className="material-icons-round text-xl">zoom_in</span>
      </button>
      <div className="w-px h-6 bg-slate-700 mx-1"></div>
      <button
        onClick={onZoomReset}
        className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
        title="Reset zoom"
      >
        <span className="material-icons-round text-xl">fit_screen</span>
      </button>
    </div>
  );
};

export default ZoomControls;
