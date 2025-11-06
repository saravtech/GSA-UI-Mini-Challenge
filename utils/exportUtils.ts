import { Application } from '../types';
import { formatDate } from './dateUtils';

export const exportToCSV = (applications: Application[]): void => {
  const headers = [
    'Title',
    'Agency',
    'NAICS',
    'Set-Aside',
    'Vehicle',
    'Due Date',
    'Status',
    '% Complete',
    'Fit Score',
    'Ceiling Min',
    'Ceiling Max',
  ];
  
  const rows = applications.map((app) => [
    app.title,
    app.agency,
    app.naics,
    app.setAside.join('; '),
    app.vehicle,
    formatDate(app.dueDate),
    app.status,
    String(app.percentComplete),
    String(app.fitScore),
    app.ceiling 
      ? (typeof app.ceiling === 'number' ? String(app.ceiling) : String(app.ceiling.min))
      : '',
    app.ceiling 
      ? (typeof app.ceiling === 'number' ? String(app.ceiling) : String(app.ceiling.max))
      : '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `gsa-applications-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

