/**
 * Game Loop
 * Manages the market tick interval and coordinates updates to stores
 */

import { createMarketEngine } from './market';
import { marketPrice } from '../stores/game';

const TICK_INTERVAL_MS = 100;

let intervalId: ReturnType<typeof setInterval> | null = null;
const marketEngine = createMarketEngine();

export function startGame() {
  if (intervalId !== null) {
    return; // Already running
  }

  intervalId = setInterval(() => {
    const price = marketEngine.tick();
    marketPrice.set(price);
  }, TICK_INTERVAL_MS);
}

export function stopGame() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function isGameRunning(): boolean {
  return intervalId !== null;
}

// Expose market engine for impact/spread adjustments
export function applyMarketImpact(impact: number) {
  marketEngine.applyImpact(impact);
}

export function setMarketSpread(spread: number) {
  marketEngine.setSpread(spread);
}
