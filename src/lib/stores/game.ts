/**
 * Game State Store
 * Central state management using Svelte stores
 */

import { writable, derived } from 'svelte/store';
import type { MarketPrice } from '../simulation/market';
import type { Position, PnL, Trade } from '../simulation/position';
import type { TradeRequest } from '../simulation/client';

// Market state
export const marketPrice = writable<MarketPrice>({
  mid: 1.085,
  bid: 1.0846,
  ask: 1.0854,
  spread: 0.0008,
  timestamp: Date.now(),
});

// Player position
export const position = writable<Position>({
  amount: 0,
  averagePrice: 0,
  currency: 'EUR',
});

// PnL
export const pnl = writable<PnL>({
  realized: 0,
  unrealized: 0,
  total: 0,
});

// Trade history
export const trades = writable<Trade[]>([]);

// Active trade requests from clients
export const tradeRequests = writable<TradeRequest[]>([]);

// E-pricing configuration
export const ePricingConfig = writable({
  spreadPips: 12, // 1.2 pips displayed as 12 tenths
  skewPips: 0,
});

// Derived: e-pricing prices based on market + config
export const ePrices = derived(
  [marketPrice, ePricingConfig],
  ([$market, $config]) => {
    const spreadInPrice = $config.spreadPips * 0.0001;
    const skewInPrice = $config.skewPips * 0.0001;
    const halfSpread = spreadInPrice / 2;

    return {
      bid: $market.mid - halfSpread + skewInPrice,
      ask: $market.mid + halfSpread + skewInPrice,
      spread: spreadInPrice,
    };
  }
);

// Game clock
export const gameTime = writable<Date>(new Date());
export const isRunning = writable(false);
