export type ApplicationStatus = 'Draft' | 'Ready' | 'Submitted' | 'Awarded' | 'Lost';

export interface Application {
  id: string;
  title: string;
  agency: string;
  naics: string;
  naicsDescription?: string;
  setAside: string[];
  vehicle: string;
  dueDate: string;
  status: ApplicationStatus;
  percentComplete: number;
  fitScore: number;
  ceiling?: number | {
    min: number;
    max: number;
  };
  keywords?: string[];
  description?: string;
  stages?: {
    stage: string;
    completed: boolean;
    date?: string;
  }[];
}

export interface SearchFilters {
  naics?: string;
  setAside: string[];
  vehicle?: string;
  agencies: string[];
  period?: {
    type: 'range' | 'quick';
    startDate?: string;
    endDate?: string;
    quickDays?: number;
  };
  ceiling?: {
    min: number;
    max: number;
  };
  keywords: string[];
}

export type SortField = 'dueDate' | 'percentComplete' | 'fitScore';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface Preset {
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

