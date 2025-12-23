/**
 * Date formatting utilities
 */

import { format, formatDistance, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format time for display
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`;
  }
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${formatTime(dateObj)}`;
  }
  if (isYesterday(dateObj)) {
    return `Yesterday at ${formatTime(dateObj)}`;
  }
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Get time until date
 */
export function getTimeUntil(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diff = dateObj.getTime() - now.getTime();
  
  if (diff < 0) {
    return 'Past';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

/**
 * Format currency
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
