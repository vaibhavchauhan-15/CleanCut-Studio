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
    <div className="flex flex-col gap-2">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onViewModeChange(mode.id)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${
            viewMode === mode.id
              ? 'bg-accent text-background-dark shadow-lg'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <span className="material-icons-round text-lg">{mode.icon}</span>
          <span className="flex-1 text-left">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewModeToggle;
