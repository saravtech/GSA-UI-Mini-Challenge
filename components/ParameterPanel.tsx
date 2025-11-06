import { useState, useEffect, useMemo } from 'react';
import { SearchFilters, Application } from '../types';
import { savePreset, getLastPreset } from '../utils/storageUtils';
import toast from 'react-hot-toast';

interface ParameterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApply: () => void;
  isApplying: boolean;
  applications: Application[];
}

// NAICS descriptions will be extracted from application titles in the data

// Set-Aside options will be extracted from data

export default function ParameterPanel({
  filters,
  onFiltersChange,
  onApply,
  isApplying,
  applications,
}: ParameterPanelProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [agencySearch, setAgencySearch] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  // Extract unique values from applications data
  const naicsOptions = useMemo(() => {
    const uniqueNaics = Array.from(new Set(applications.map((app) => app.naics))).sort();
    return uniqueNaics.map((naics) => {
      // Get the first application title that uses this NAICS code as the description
      const firstApp = applications.find((app) => app.naics === naics);
      const description = firstApp?.title || 'Unknown';
      return {
        value: naics,
        label: `${naics} - ${description}`,
      };
    });
  }, [applications]);

  const vehicleOptions = useMemo(() => {
    return Array.from(new Set(applications.map((app) => app.vehicle))).sort();
  }, [applications]);

  const agencyOptions = useMemo(() => {
    return Array.from(new Set(applications.map((app) => app.agency))).sort();
  }, [applications]);

  const setAsideOptions = useMemo(() => {
    const allSetAsides = applications.flatMap((app) => app.setAside);
    return Array.from(new Set(allSetAsides)).sort();
  }, [applications]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSetAsideToggle = (value: string) => {
    const newSetAside = localFilters.setAside.includes(value)
      ? localFilters.setAside.filter((sa) => sa !== value)
      : [...localFilters.setAside, value];
    updateFilter({ setAside: newSetAside });
  };

  const handleAgencyToggle = (agency: string) => {
    const newAgencies = localFilters.agencies.includes(agency)
      ? localFilters.agencies.filter((a) => a !== agency)
      : [...localFilters.agencies, agency];
    updateFilter({ agencies: newAgencies });
  };

  const handleKeywordAdd = () => {
    if (keywordInput.trim() && !localFilters.keywords.includes(keywordInput.trim())) {
      updateFilter({ keywords: [...localFilters.keywords, keywordInput.trim()] });
      setKeywordInput('');
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    updateFilter({
      keywords: localFilters.keywords.filter((k) => k !== keyword),
    });
  };

  const handleSavePreset = () => {
    const preset = {
      name: `Preset ${new Date().toLocaleString()}`,
      filters: localFilters,
      createdAt: new Date().toISOString(),
    };
    savePreset(preset);
    toast.success('Preset saved successfully');
  };

  const handleLoadPreset = () => {
    const lastPreset = getLastPreset();
    if (lastPreset) {
      setLocalFilters(lastPreset.filters);
      onFiltersChange(lastPreset.filters);
      toast.success('Preset loaded successfully');
    } else {
      toast.error('No preset found');
    }
  };

  const handleResetFilters = () => {
    const resetFilters: SearchFilters = {
      setAside: [],
      agencies: [],
      keywords: [],
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setAgencySearch('');
    setKeywordInput('');
    toast.success('Filters reset');
  };

  const handlePeriodQuickSelect = (days: number) => {
    updateFilter({
      period: {
        type: 'quick',
        quickDays: days,
      },
    });
  };

  const filteredAgencies = agencyOptions.filter((agency) =>
    agency.toLowerCase().includes(agencySearch.toLowerCase())
  );

  const ceilingMinError =
    localFilters.ceiling &&
    localFilters.ceiling.min > localFilters.ceiling.max
      ? 'Min must be less than or equal to max'
      : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Search Parameters
      </h2>

      {/* NAICS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          NAICS
        </label>
        <select
          className="input-field"
          value={localFilters.naics || ''}
          onChange={(e) => updateFilter({ naics: e.target.value || undefined })}
        >
          <option value="">All NAICS</option>
          {naicsOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Set-Aside */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Set-Aside
        </label>
        <div className="flex flex-wrap gap-2">
          {setAsideOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSetAsideToggle(option)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                localFilters.setAside.includes(option)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Vehicle
        </label>
        <select
          className="input-field"
          value={localFilters.vehicle || ''}
          onChange={(e) => updateFilter({ vehicle: e.target.value || undefined })}
        >
          <option value="">All Vehicles</option>
          {vehicleOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Agency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Agency
        </label>
        <input
          type="text"
          className="input-field mb-2"
          placeholder="Search agencies..."
          value={agencySearch}
          onChange={(e) => setAgencySearch(e.target.value)}
        />
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filteredAgencies.map((agency) => (
            <label
              key={agency}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={localFilters.agencies.includes(agency)}
                onChange={() => handleAgencyToggle(agency)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{agency}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Period */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Period
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => handlePeriodQuickSelect(30)}
            className={`px-3 py-1 rounded text-sm ${
              localFilters.period?.type === 'quick' && localFilters.period.quickDays === 30
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Next 30 days
          </button>
          <button
            type="button"
            onClick={() => handlePeriodQuickSelect(60)}
            className={`px-3 py-1 rounded text-sm ${
              localFilters.period?.type === 'quick' && localFilters.period.quickDays === 60
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Next 60 days
          </button>
          <button
            type="button"
            onClick={() => handlePeriodQuickSelect(90)}
            className={`px-3 py-1 rounded text-sm ${
              localFilters.period?.type === 'quick' && localFilters.period.quickDays === 90
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Next 90 days
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            className="input-field"
            value={localFilters.period?.startDate || ''}
            onChange={(e) =>
              updateFilter({
                period: {
                  type: 'range',
                  startDate: e.target.value || undefined,
                  endDate: localFilters.period?.endDate,
                },
              })
            }
          />
          <input
            type="date"
            className="input-field"
            value={localFilters.period?.endDate || ''}
            onChange={(e) =>
              updateFilter({
                period: {
                  type: 'range',
                  startDate: localFilters.period?.startDate,
                  endDate: e.target.value || undefined,
                },
              })
            }
          />
        </div>
      </div>

      {/* Ceiling */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ceiling
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              className={`input-field ${ceilingMinError ? 'border-red-500' : ''}`}
              placeholder="Min"
              value={localFilters.ceiling?.min || ''}
              onChange={(e) =>
                updateFilter({
                  ceiling: {
                    min: parseInt(e.target.value, 10) || 0,
                    max: localFilters.ceiling?.max || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <input
              type="number"
              className={`input-field ${ceilingMinError ? 'border-red-500' : ''}`}
              placeholder="Max"
              value={localFilters.ceiling?.max || ''}
              onChange={(e) =>
                updateFilter({
                  ceiling: {
                    min: localFilters.ceiling?.min || 0,
                    max: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
            />
          </div>
        </div>
        {ceilingMinError && (
          <p className="text-red-500 text-sm mt-1">{ceilingMinError}</p>
        )}
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Keywords
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Enter keyword..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleKeywordAdd();
              }
            }}
          />
          <button
            type="button"
            onClick={handleKeywordAdd}
            className="btn-secondary"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localFilters.keywords.map((keyword) => (
            <span
              key={keyword}
              className="chip flex items-center gap-1"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleKeywordRemove(keyword)}
                className="hover:text-primary-600"
                aria-label={`Remove ${keyword}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying || !!ceilingMinError}
          className="btn-primary w-full"
        >
          {isApplying ? 'Applying...' : 'Apply Filters'}
        </button>
        <button
          type="button"
          onClick={handleResetFilters}
          className="btn-secondary w-full"
          disabled={isApplying}
        >
          Reset Filters
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSavePreset}
            className="btn-secondary"
          >
            Save Preset
          </button>
          <button
            type="button"
            onClick={handleLoadPreset}
            className="btn-secondary"
          >
            Load Preset
          </button>
        </div>
      </div>
    </div>
  );
}

