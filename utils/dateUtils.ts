import { format, formatDistanceToNow, isAfter, isBefore, addDays, parseISO } from 'date-fns';

export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), 'MMM d, yyyy');
};

export const formatRelativeDate = (dateString: string): string => {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
};

export const isDateInRange = (dateString: string, startDate?: string, endDate?: string): boolean => {
  const date = parseISO(dateString);
  if (startDate && isBefore(date, parseISO(startDate))) return false;
  if (endDate && isAfter(date, parseISO(endDate))) return false;
  return true;
};

export const isDateInQuickRange = (dateString: string, days: number): boolean => {
  const date = parseISO(dateString);
  const today = new Date();
  const futureDate = addDays(today, days);
  return isAfter(date, today) && isBefore(date, futureDate);
};

export const getQuickRangeDates = (days: number): { start: Date; end: Date } => {
  const start = new Date();
  const end = addDays(start, days);
  return { start, end };
};

