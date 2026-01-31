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

/**
 * Extract big figure from price (first 2 decimal places)
 * e.g., 1.08567 -> "1.08"
 */
export function getBigFigure(price: number): string {
  return price.toFixed(2);
}

/**
 * Extract pips from price (4th and 5th decimal as integer)
 * e.g., 1.08567 -> "67"
 */
export function getPips(price: number): string {
  const pips = Math.floor((price * 10000) % 100);
  return pips.toString().padStart(2, '0');
}

/**
 * Extract fractional pip (5th decimal)
 * e.g., 1.08567 -> "7"
 */
export function getFractionalPip(price: number): string {
  const frac = Math.floor((price * 100000) % 10);
  return frac.toString();
}
