import { SearchFilters, Preset } from '../types';

const FILTERS_KEY = 'gsa-search-filters';
const PRESETS_KEY = 'gsa-search-presets';
const VIEW_MODE_KEY = 'gsa-view-mode';
const DARK_MODE_KEY = 'gsa-dark-mode';

export const saveFilters = (filters: SearchFilters): void => {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters:', error);
  }
};

export const loadFilters = (): SearchFilters | null => {
  try {
    const stored = localStorage.getItem(FILTERS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load filters:', error);
    return null;
  }
};

export const savePreset = (preset: Preset): void => {
  try {
    const presets = loadPresets();
    const updated = [...presets, preset];
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preset:', error);
  }
};

export const loadPresets = (): Preset[] => {
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load presets:', error);
    return [];
  }
};

export const getLastPreset = (): Preset | null => {
  const presets = loadPresets();
  if (presets.length === 0) return null;
  return presets.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
};

export const saveViewMode = (mode: 'card' | 'table'): void => {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch (error) {
    console.error('Failed to save view mode:', error);
  }
};

export const loadViewMode = (): 'card' | 'table' => {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    return (stored === 'card' || stored === 'table') ? stored : 'card';
  } catch (error) {
    return 'card';
  }
};

export const saveDarkMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(DARK_MODE_KEY, String(enabled));
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (error) {
    console.error('Failed to save dark mode:', error);
  }
};

export const loadDarkMode = (): boolean => {
  try {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored === null) {
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    const enabled = stored === 'true';
    if (enabled) {
      document.documentElement.classList.add('dark');
    }
    return enabled;
  } catch (error) {
    return false;
  }
};

