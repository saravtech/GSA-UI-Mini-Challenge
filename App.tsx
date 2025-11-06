import { useState, useEffect, useMemo, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import applicationsData from './data/applications.json';
import { Application, SearchFilters, SortConfig } from './types';
import ParameterPanel from './components/ParameterPanel';
import ProgressDashboard from './components/ProgressDashboard';
import ApplicationCard from './components/ApplicationCard';
import ApplicationTable from './components/ApplicationTable';
import DetailsDrawer from './components/DetailsDrawer';
import AIModal from './components/AIModal';
import QuickFilters from './components/QuickFilters';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import { filterApplications } from './utils/filterUtils';
import { saveFilters, loadFilters, saveViewMode, loadViewMode, saveDarkMode, loadDarkMode } from './utils/storageUtils';
import { urlParamsToFilters, updateUrl } from './utils/urlUtils';
import { exportToCSV } from './utils/exportUtils';
import toast from 'react-hot-toast';

function App() {
  const [applications, setApplications] = useState<Application[]>(applicationsData as Application[]);
  const [filters, setFilters] = useState<SearchFilters>({
    setAside: [],
    agencies: [],
    keywords: [],
  });
  const [filteredApplications, setFilteredApplications] = useState<Application[]>(applicationsData as Application[]);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [aiApplication, setAiApplication] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>(loadViewMode());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'dueDate', direction: 'asc' });
  const [quickFilter, setQuickFilter] = useState<'due30' | 'due60' | 'due90' | 'fit80' | null>(null);
  const [darkMode, setDarkMode] = useState(loadDarkMode());

  // Initialize dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Initialize from URL params and localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilters = urlParamsToFilters(urlParams);
    const savedFilters = loadFilters();

    const initialFilters: SearchFilters = {
      ...{
        setAside: [],
        agencies: [],
        keywords: [],
      },
      ...(Object.keys(urlFilters).length > 0 ? urlFilters : savedFilters),
    };

    setFilters(initialFilters);
    applyFilters(initialFilters);
  }, []);

  // Apply filters with delay simulation
  const applyFilters = async (filterSet: SearchFilters, quickFilterToApply?: typeof quickFilter) => {
    setIsApplying(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));

    let filtered = filterApplications(applications, filterSet);
    
    // Apply quick filter if active
    const activeQuickFilter = quickFilterToApply !== undefined ? quickFilterToApply : quickFilter;
    if (activeQuickFilter) {
      if (activeQuickFilter === 'due30') {
        filtered = filtered.filter((app) => {
          const days = Math.ceil((new Date(app.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return days >= 0 && days <= 30;
        });
      } else if (activeQuickFilter === 'due60') {
        filtered = filtered.filter((app) => {
          const days = Math.ceil((new Date(app.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return days >= 0 && days <= 60;
        });
      } else if (activeQuickFilter === 'due90') {
        filtered = filtered.filter((app) => {
          const days = Math.ceil((new Date(app.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return days >= 0 && days <= 90;
        });
      } else if (activeQuickFilter === 'fit80') {
        filtered = filtered.filter((app) => app.fitScore >= 80);
      }
    }

    setFilteredApplications(filtered);
    setIsApplying(false);
    saveFilters(filterSet);
    updateUrl(filterSet);
  };

  // Re-apply filters when quick filter changes (but not on initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (filters && Object.keys(filters).length > 0) {
      applyFilters(filters, quickFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickFilter]);

  const handleApply = () => {
    applyFilters(filters);
  };

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedApplications = useMemo(() => {
    const sorted = [...filteredApplications];
    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortConfig.field === 'dueDate') {
        aValue = new Date(a.dueDate).getTime();
        bValue = new Date(b.dueDate).getTime();
      } else if (sortConfig.field === 'percentComplete') {
        aValue = a.percentComplete;
        bValue = b.percentComplete;
      } else {
        aValue = a.fitScore;
        bValue = b.fitScore;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    return sorted;
  }, [filteredApplications, sortConfig]);

  const handleMarkSubmitted = (id: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'Submitted' as const } : app
      )
    );
    setFilteredApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'Submitted' as const } : app
      )
    );
    toast.success('Application marked as submitted');
  };

  const handleViewModeChange = (mode: 'card' | 'table') => {
    setViewMode(mode);
    saveViewMode(mode);
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(sortedApplications);
    toast.success('CSV exported successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              GSA Opportunity Search
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportCSV}
                className="btn-secondary text-sm"
                disabled={sortedApplications.length === 0}
              >
                Export CSV
              </button>
              <button
                onClick={handleDarkModeToggle}
                className="btn-secondary text-sm"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Parameter Panel */}
          <div className="lg:col-span-1">
            <ParameterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApply}
              isApplying={isApplying}
              applications={applications}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Progress Dashboard */}
            <ProgressDashboard applications={applications} />

            {/* Results Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Results ({sortedApplications.length})
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewModeChange('card')}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'card'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => handleViewModeChange('table')}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'table'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <QuickFilters
                activeFilter={quickFilter}
                onFilterChange={setQuickFilter}
              />

              {/* Results */}
              {isApplying ? (
                <LoadingSkeleton />
              ) : sortedApplications.length === 0 ? (
                <EmptyState />
              ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onClick={() => setSelectedApplication(app)}
                      onAskAI={() => setAiApplication(app)}
                    />
                  ))}
                </div>
              ) : (
                <ApplicationTable
                  applications={sortedApplications}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onRowClick={setSelectedApplication}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      <DetailsDrawer
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onMarkSubmitted={handleMarkSubmitted}
      />

      {/* AI Modal */}
      <AIModal
        application={aiApplication}
        onClose={() => setAiApplication(null)}
      />
    </div>
  );
}

export default App;

