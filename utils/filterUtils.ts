import { Application, SearchFilters } from '../types';
import { isDateInRange, isDateInQuickRange } from './dateUtils';

export const filterApplications = (
  applications: Application[],
  filters: SearchFilters
): Application[] => {
  return applications.filter((app) => {
    // NAICS filter
    if (filters.naics && app.naics !== filters.naics) return false;
    
    // Set-Aside filter (multi-select)
    if (filters.setAside.length > 0) {
      const hasMatchingSetAside = filters.setAside.some((sa) => app.setAside.includes(sa));
      if (!hasMatchingSetAside) return false;
    }
    
    // Vehicle filter
    if (filters.vehicle && app.vehicle !== filters.vehicle) return false;
    
    // Agency filter (multi-select)
    if (filters.agencies.length > 0 && !filters.agencies.includes(app.agency)) return false;
    
    // Period filter
    if (filters.period) {
      if (filters.period.type === 'range') {
        if (!isDateInRange(app.dueDate, filters.period.startDate, filters.period.endDate)) {
          return false;
        }
      } else if (filters.period.type === 'quick' && filters.period.quickDays) {
        if (!isDateInQuickRange(app.dueDate, filters.period.quickDays)) {
          return false;
        }
      }
    }
    
    // Ceiling filter - show applications where ceiling range overlaps with filter range
    if (filters.ceiling && app.ceiling) {
      const { min, max } = filters.ceiling;
      // Handle both number and object formats for app.ceiling
      const appMin = typeof app.ceiling === 'number' ? app.ceiling : app.ceiling.min;
      const appMax = typeof app.ceiling === 'number' ? app.ceiling : app.ceiling.max;
      // Check if ranges overlap: app.min <= filter.max && app.max >= filter.min
      if (appMin > max || appMax < min) return false;
    }
    
    // Keywords filter
    if (filters.keywords.length > 0) {
      const appText = `${app.title} ${app.description || ''} ${app.keywords?.join(' ') || ''}`.toLowerCase();
      const hasKeyword = filters.keywords.some((keyword) =>
        appText.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    
    return true;
  });
};

export const getQuickFilteredApplications = (
  applications: Application[],
  quickFilter: 'due30' | 'due60' | 'due90' | 'fit80' | null
): Application[] => {
  if (!quickFilter) return applications;
  
  if (quickFilter === 'due30') {
    return applications.filter((app) => isDateInQuickRange(app.dueDate, 30));
  }
  if (quickFilter === 'due60') {
    return applications.filter((app) => isDateInQuickRange(app.dueDate, 60));
  }
  if (quickFilter === 'due90') {
    return applications.filter((app) => isDateInQuickRange(app.dueDate, 90));
  }
  if (quickFilter === 'fit80') {
    return applications.filter((app) => app.fitScore >= 80);
  }
  
  return applications;
};

