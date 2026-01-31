/**
 * Formatting utilities for prices and spreads
 */

/**
 * Format a price to 4 decimal places (standard FX format)
 * e.g., 1.08503 -> "1.0850"
 */
export function formatPrice(price: number): string {
  return price.toFixed(4);
}

/**
 * Format a spread in pips (1 pip = 0.0001 for EUR/USD)
 * e.g., 0.0008 -> "0.8"
 */
export function formatSpreadPips(spread: number): string {
  const pips = spread / 0.0001;
  return pips.toFixed(1);
}

/**
 * Format a number in millions
 * e.g., 15000000 -> "15M"
 */
export function formatMillions(amount: number): string {
  return `${(amount / 1_000_000).toFixed(0)}M`;
}

/**
 * Format currency with sign
 * e.g., 12500 -> "$12,500", -3200 -> "-$3,200"
 */
export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);
  return `${sign}$${absAmount.toLocaleString()}`;
}
