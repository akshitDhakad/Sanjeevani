import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, formatStr = 'PP'): string {
  return format(new Date(date), formatStr);
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

