/**
 * Background Selector Component
 * Select background type for export
 */

import { BACKGROUND_OPTIONS } from '../../config/constants';

const BackgroundSelector = ({
  backgroundColor,
  onBackgroundChange,
  customColor,
  onCustomColorChange,
  customBackgroundImage,
  onCustomBackgroundImageChange,
}) => {
  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCustomBackgroundImageChange(event.target.result);
        onBackgroundChange('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 border-b border-slate-700">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-icons-round text-sm">wallpaper</span> Background
      </h3>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {BACKGROUND_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onBackgroundChange(option.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
              backgroundColor === option.id
                ? 'bg-accent/20 border-accent text-accent'
                : 'hover:bg-slate-700/50 border-slate-700 text-slate-400'
            }`}
          >
            <span
              className={`material-icons-round text-xl ${
                backgroundColor === option.id ? 'text-accent' : 'text-slate-400'
              }`}
            >
              {option.icon}
            </span>
            <span
              className={`text-[10px] font-medium ${
                backgroundColor === option.id ? 'text-accent' : 'text-slate-400'
              }`}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {backgroundColor === 'solid' && (
        <div className="mt-4">
          <label className="text-xs text-slate-300 mb-2 block font-medium">Custom Color</label>
          <input
            type="color"
            value={customColor}
            onChange={(e) => onCustomColorChange(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer border border-slate-700 bg-slate-700"
          />
        </div>
      )}

      {backgroundColor === 'custom' && (
        <div className="mt-4">
          <label className="text-xs text-slate-300 mb-2 block font-medium">
            Upload Background Image
          </label>
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
              className="w-full h-24 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/10 transition-all"
            >
              {customBackgroundImage ? (
                <img
                  src={customBackgroundImage}
                  alt="Custom Background"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <span className="material-icons-round text-2xl text-slate-400 mb-1">
                    add_photo_alternate
                  </span>
                  <span className="text-xs text-slate-400">Click to upload</span>
                </>
              )}
            </label>
          </div>
          {customBackgroundImage && (
            <button
              onClick={() => onCustomBackgroundImageChange(null)}
              className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
            >
              <span className="material-icons-round text-sm">delete</span>
              Remove Image
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
