import BackgroundSelector from './export/BackgroundSelector';
import FormatSelector from './export/FormatSelector';
import ViewModeToggle from './editor/ViewModeToggle';
import { useImageContext } from '../contexts/useImageContext';

const DownloadPanel = () => {
  const {
    backgroundColor,
    setBackgroundColor,
    customColor,
    setCustomColor,
    customBackgroundImage,
    setCustomBackgroundImage,
    outputFormat,
    setOutputFormat,
    viewMode,
    setViewMode,
  } = useImageContext();

  return (
    <aside className="w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-y-auto max-h-[calc(100vh-180px)] sticky top-24">
      {/* View Mode Section */}
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-icons-round text-sm">visibility</span> View Mode
        </h3>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <BackgroundSelector
        backgroundColor={backgroundColor}
        onBackgroundChange={setBackgroundColor}
        customColor={customColor}
        onCustomColorChange={setCustomColor}
        customBackgroundImage={customBackgroundImage}
        onCustomBackgroundImageChange={setCustomBackgroundImage}
      />
      <FormatSelector
        outputFormat={outputFormat}
        onFormatChange={setOutputFormat}
      />
    </aside>
  );
};

export default DownloadPanel;
