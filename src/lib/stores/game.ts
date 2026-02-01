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
import type { NewsItem, ScheduledRelease } from '../simulation/newsEvents';

// Market mid price (spread-independent)
export const marketMid = writable<number>(1.0850);

// Price history for chart
export interface PricePoint {
  time: number;
  mid: number;
}
export const priceHistory = writable<PricePoint[]>([]);

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
// baseSpreadPips is the 1M spread and applies to ALL tiers
// tierAdditionalPips are extra pips on top of base for larger sizes
export const ePricingConfig = writable({
  baseSpreadPips: 1,    // Base spread (1M tier) - affects all tiers
  tierAdditionalPips: {
    '5': 0,    // +0 pips additional for 5M (total = base + 0)
    '10': 1,   // +1 pip additional for 10M (total = base + 1)
    '50': 2,   // +2 pips additional for 50M (total = base + 2)
  } as Record<'5' | '10' | '50', number>,
  skewPips: 0,    // 0 pips skew (positive = skew bid up, negative = skew bid down)
});

// Derived: e-pricing prices per tier based on market + config
export const eTierPrices = derived(
  [marketMid, tierSpreads, ePricingConfig],
  ([$mid, $spreads, $config]) => {
    const tiers = ['1', '5', '10', '50'] as const;
    const prices: Record<string, { bid: number; ask: number; spread: number; addOnPips: number; additionalPips: number }> = {};
    const skewInPrice = $config.skewPips * 0.0001;

    for (const tier of tiers) {
      // Market spread + base spread + tier-specific additional spread
      const marketSpread = $spreads[tier];
      const baseSpread = $config.baseSpreadPips * 0.0001;
      const additionalPips = tier === '1' ? 0 : $config.tierAdditionalPips[tier as '5' | '10' | '50'];
      const additionalSpread = additionalPips * 0.0001;
      const totalAddOnPips = $config.baseSpreadPips + additionalPips;
      const totalSpread = marketSpread + baseSpread + additionalSpread;
      const halfSpread = totalSpread / 2;

      prices[tier] = {
        bid: $mid - halfSpread + skewInPrice,
        ask: $mid + halfSpread + skewInPrice,
        spread: totalSpread,
        addOnPips: totalAddOnPips,
        additionalPips: additionalPips,
      };
    }

    return prices as Record<'1' | '5' | '10' | '50', { bid: number; ask: number; spread: number; addOnPips: number; additionalPips: number }>;
  }
);

// Legacy: single e-prices for backwards compatibility (uses 1M tier)
export const ePrices = derived(
  [eTierPrices],
  ([$tierPrices]) => {
    return {
      bid: $tierPrices['1'].bid,
      ask: $tierPrices['1'].ask,
      spread: $tierPrices['1'].spread,
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

// Market impact pressure (in pips, for debugging)
export const marketImpact = writable<number>(0);

// TWAP Algo state
export interface TwapState {
  active: boolean;
  side: 'buy' | 'sell';
  totalSize: number;      // Total size in millions
  sizePerInterval: number; // Size per 10 seconds in millions
  filledSize: number;     // How much has been filled
  startTime: number | null;
}

export const twapState = writable<TwapState>({
  active: false,
  side: 'buy',
  totalSize: 0,
  sizePerInterval: 1,
  filledSize: 0,
  startTime: null,
});

// News & Events
export const newsHistory = writable<NewsItem[]>([]);
export const upcomingRelease = writable<ScheduledRelease | null>(null);
