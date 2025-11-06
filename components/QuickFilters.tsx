interface QuickFiltersProps {
  activeFilter: 'due30' | 'due60' | 'due90' | 'fit80' | null;
  onFilterChange: (filter: 'due30' | 'due60' | 'due90' | 'fit80' | null) => void;
}

export default function QuickFilters({
  activeFilter,
  onFilterChange,
}: QuickFiltersProps) {
  const handleQuickFilter = (filter: 'due30' | 'due60' | 'due90' | 'fit80' | null) => {
    const newFilter = activeFilter === filter ? null : filter;
    onFilterChange(newFilter);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
        Quick Filters:
      </span>
      <button
        type="button"
        onClick={() => handleQuickFilter('due30')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          activeFilter === 'due30'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Due in 30 days
      </button>
      <button
        type="button"
        onClick={() => handleQuickFilter('due60')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          activeFilter === 'due60'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Due in 60 days
      </button>
      <button
        type="button"
        onClick={() => handleQuickFilter('due90')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          activeFilter === 'due90'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Due in 90 days
      </button>
      <button
        type="button"
        onClick={() => handleQuickFilter('fit80')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          activeFilter === 'fit80'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        ≥80 Fit Score
      </button>
      {activeFilter && (
        <button
          type="button"
          onClick={() => handleQuickFilter(null)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
        >
          Clear
        </button>
      )}
    </div>
  );
}

