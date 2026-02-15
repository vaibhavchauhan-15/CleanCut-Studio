/**
 * View Mode Toggle Component
 * Toggle between original, processed, and compare views
 */

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  const modes = [
    { id: 'original', label: 'Original', icon: 'image' },
    { id: 'processed', label: 'Processed', icon: 'auto_fix_high' },
    { id: 'compare', label: 'Compare', icon: 'compare' },
  ];

  return (
    <div className="flex gap-3 justify-center bg-slate-800/80 backdrop-blur-sm p-2 rounded-xl border border-slate-700 shadow-xl">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onViewModeChange(mode.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === mode.id
              ? 'bg-accent text-background-dark shadow-lg'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <span className="material-icons-round text-lg">{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewModeToggle;
