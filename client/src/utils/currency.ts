/**
 * Currency formatting utilities
 */

/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format(cents / 100);
}

/**
 * Format currency without symbol (for display)
 */
export function formatCurrencyAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

