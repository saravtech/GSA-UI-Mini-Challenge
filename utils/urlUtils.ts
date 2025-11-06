import { SearchFilters } from '../types';

export const filtersToUrlParams = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filters.naics) params.set('naics', filters.naics);
  if (filters.setAside.length > 0) params.set('setAside', filters.setAside.join(','));
  if (filters.vehicle) params.set('vehicle', filters.vehicle);
  if (filters.agencies.length > 0) params.set('agencies', filters.agencies.join(','));
  if (filters.period) {
    if (filters.period.type === 'range' && filters.period.startDate && filters.period.endDate) {
      params.set('periodStart', filters.period.startDate);
      params.set('periodEnd', filters.period.endDate);
    } else if (filters.period.type === 'quick' && filters.period.quickDays) {
      params.set('periodDays', String(filters.period.quickDays));
    }
  }
  if (filters.ceiling) {
    params.set('ceilingMin', String(filters.ceiling.min));
    params.set('ceilingMax', String(filters.ceiling.max));
  }
  if (filters.keywords.length > 0) params.set('keywords', filters.keywords.join(','));
  
  return params;
};

export const urlParamsToFilters = (params: URLSearchParams): Partial<SearchFilters> => {
  const filters: Partial<SearchFilters> = {
    setAside: [],
    agencies: [],
    keywords: [],
  };
  
  const naics = params.get('naics');
  if (naics) filters.naics = naics;
  
  const setAside = params.get('setAside');
  if (setAside) filters.setAside = setAside.split(',').filter(Boolean);
  
  const vehicle = params.get('vehicle');
  if (vehicle) filters.vehicle = vehicle;
  
  const agencies = params.get('agencies');
  if (agencies) filters.agencies = agencies.split(',').filter(Boolean);
  
  const periodStart = params.get('periodStart');
  const periodEnd = params.get('periodEnd');
  const periodDays = params.get('periodDays');
  if (periodStart && periodEnd) {
    filters.period = {
      type: 'range',
      startDate: periodStart,
      endDate: periodEnd,
    };
  } else if (periodDays) {
    filters.period = {
      type: 'quick',
      quickDays: parseInt(periodDays, 10),
    };
  }
  
  const ceilingMin = params.get('ceilingMin');
  const ceilingMax = params.get('ceilingMax');
  if (ceilingMin && ceilingMax) {
    filters.ceiling = {
      min: parseInt(ceilingMin, 10),
      max: parseInt(ceilingMax, 10),
    };
  }
  
  const keywords = params.get('keywords');
  if (keywords) filters.keywords = keywords.split(',').filter(Boolean);
  
  return filters;
};

export const updateUrl = (filters: SearchFilters): void => {
  const params = filtersToUrlParams(filters);
  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.pushState({}, '', newUrl);
};

