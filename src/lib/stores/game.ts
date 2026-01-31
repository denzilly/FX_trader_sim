/**
 * Game State Store
 * Central state management using Svelte stores
 */

import { writable, derived } from 'svelte/store';
import type { MarketPrice } from '../simulation/market';
import type { Position, PnL, Trade } from '../simulation/position';
import type { TradeRequest } from '../simulation/client';
import type { TierSpreads } from '../simulation/spread';
import type { ChatMessage, VoiceRfq } from '../simulation/voiceRfq';
import type { ElectronicRfq } from '../simulation/electronicRfq';

// Market mid price (spread-independent)
export const marketMid = writable<number>(1.0850);

// Tier spreads (updated by spread engine)
export const tierSpreads = writable<TierSpreads>({
  '1': 0.00005,   // 0.5 pips
  '5': 0.00008,   // 0.8 pips
  '10': 0.00011,  // 1.1 pips
  '50': 0.00017,  // 1.7 pips
});

// Volatility factor (0 = calm, higher = more volatile, affects spreads)
export const volatilityFactor = writable<number>(0);

// Derived: tier prices (bid/ask for each tier)
export const tierPrices = derived(
  [marketMid, tierSpreads],
  ([$mid, $spreads]) => {
    const tiers = ['1', '5', '10', '50'] as const;
    const prices: Record<string, { bid: number; ask: number; spread: number }> = {};

    for (const tier of tiers) {
      const halfSpread = $spreads[tier] / 2;
      prices[tier] = {
        bid: $mid - halfSpread,
        ask: $mid + halfSpread,
        spread: $spreads[tier],
      };
    }

    return prices as Record<'1' | '5' | '10' | '50', { bid: number; ask: number; spread: number }>;
  }
);

// Legacy market state (uses 1M spread for backwards compatibility)
export const marketPrice = derived(
  [marketMid, tierSpreads],
  ([$mid, $spreads]) => {
    const spread = $spreads['1'];
    const halfSpread = spread / 2;
    return {
      mid: $mid,
      bid: $mid - halfSpread,
      ask: $mid + halfSpread,
      spread: spread,
      timestamp: Date.now(),
    } as MarketPrice;
  }
);

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

// E-pricing configuration (all values in whole pips)
export const ePricingConfig = writable({
  spreadPips: 2,  // 2 pips spread
  skewPips: 0,    // 0 pips skew (positive = skew bid up, negative = skew bid down)
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

// Voice RFQ chat messages
export const chatMessages = writable<ChatMessage[]>([]);

// Active voice RFQs
export const activeVoiceRfqs = writable<VoiceRfq[]>([]);

// Electronic RFQs (for e-pricing blotter)
export const electronicRfqs = writable<ElectronicRfq[]>([]);
