/**
 * Format Selector Component
 * Select output format for export (PNG, JPG, WEBP)
 */

const FormatSelector = ({ outputFormat, onFormatChange }) => {
  const formats = ['PNG', 'JPG', 'WEBP'];

  return (
    <div className="p-6">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-icons-round text-sm">file_download</span> Export Format
      </h3>
      <div className="flex items-center bg-slate-700/50 border border-slate-700 rounded-lg p-1">
        {formats.map((format) => (
          <button
            key={format}
            onClick={() => onFormatChange(format)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              outputFormat === format
                ? 'bg-slate-800 text-white shadow-sm'
                : 'hover:text-white text-slate-400'
            }`}
          >
            {format}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormatSelector;
