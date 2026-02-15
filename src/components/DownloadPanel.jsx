import BackgroundSelector from './export/BackgroundSelector';
import FormatSelector from './export/FormatSelector';
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
  } = useImageContext();

  return (
    <aside className="w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-y-auto max-h-[calc(100vh-180px)] sticky top-24">
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
