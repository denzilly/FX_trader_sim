/**
 * Game Loop
 * Manages the market tick interval and coordinates updates to stores
 */

import { createMarketEngine } from './market';
import { createSpreadEngine, getSessionForHour } from './spread';
import { createPositionTracker, type Trade } from './position';
import { createVoiceRfqEngine, type VoiceRfq } from './voiceRfq';
import { createElectronicRfqEngine, type ElectronicRfq } from './electronicRfq';
import { createNewsEventsEngine } from './newsEvents';
import { marketMid, tierSpreads, tierPrices, volatilityFactor, position, pnl, trades, chatMessages, activeVoiceRfqs, electronicRfqs, eTierPrices, marketImpact, twapState, gameTime, newsHistory, upcomingRelease, priceHistory, currentSession } from '../stores/game';
import { settings } from '../stores/settings';
import { get } from 'svelte/store';
import { playNewsSound, playVoiceRfqSound, playTradeSound, preloadSounds } from '../utils/sound';

const PRICE_TICK_INTERVAL_MS = 100;
const SPREAD_TICK_INTERVAL_MS = 500; // Spreads update slower than price
const RFQ_TICK_INTERVAL_MS = 500; // Voice RFQ engine tick
const ELECTRONIC_RFQ_TICK_INTERVAL_MS = 200; // Electronic RFQ tick (faster for live prices)
const TWAP_TICK_INTERVAL_MS = 10000; // TWAP executes every 10 seconds
const CLOCK_TICK_INTERVAL_MS = 1000; // Clock ticks every 1 second (= 1 game minute)
const NEWS_TICK_INTERVAL_MS = 1000; // News checks once per game minute (synced with clock)

let priceIntervalId: ReturnType<typeof setInterval> | null = null;
let spreadIntervalId: ReturnType<typeof setInterval> | null = null;
let rfqIntervalId: ReturnType<typeof setInterval> | null = null;
let electronicRfqIntervalId: ReturnType<typeof setInterval> | null = null;
let twapIntervalId: ReturnType<typeof setInterval> | null = null;
let clockIntervalId: ReturnType<typeof setInterval> | null = null;
let newsIntervalId: ReturnType<typeof setInterval> | null = null;

// Game clock state - starts at 7:00 AM
let gameClockMinutes = 7 * 60; // 7:00 AM in minutes from midnight

// Engines - recreated on restart to pick up new settings
let marketEngine = createMarketEngine();
let spreadEngine = createSpreadEngine();
let positionTracker = createPositionTracker();
let voiceRfqEngine = createVoiceRfqEngine();
let electronicRfqEngine = createElectronicRfqEngine();
let newsEventsEngine = createNewsEventsEngine();

// Get current settings snapshot
function getSettings() {
  return get(settings);
}

// Recreate engines with current settings
function recreateEngines() {
  const s = getSettings();

  marketEngine = createMarketEngine(
    {
      initialMid: s.market.initialMid,
      volatility: s.market.volatility,
      drift: s.market.drift,
      baseSpread: s.market.baseSpread,
    },
    {
      halfLifeMs: s.impact.halfLifeMs,
      maxImpactPips: s.impact.maxImpactPips,
      sizeScaleFactor: s.impact.sizeScaleFactor,
      burstWindowMs: s.impact.burstWindowMs,
      burstMultiplierMax: s.impact.burstMultiplierMax,
    }
  );

  spreadEngine = createSpreadEngine();
  positionTracker = createPositionTracker();
  voiceRfqEngine = createVoiceRfqEngine();
  electronicRfqEngine = createElectronicRfqEngine();
  newsEventsEngine = createNewsEventsEngine({
    newsChancePerMinute: s.news.newsChancePerMinute,
    minNewsBetweenMinutes: s.news.minNewsBetweenMinutes,
    releasesPerDay: 1,
    releaseDelayMin: s.news.releaseDelayMin,
    releaseDelayMax: s.news.releaseDelayMax,
    newsEnabled: s.news.newsEnabled,
    releasesEnabled: s.news.releasesEnabled,
  });
}

// Reset game state stores
function resetGameState() {
  marketMid.set(getSettings().market.initialMid);
  position.set({ amount: 0, averagePrice: 0, currency: 'EUR' });
  pnl.set({ realized: 0, unrealized: 0, total: 0 });
  trades.set([]);
  chatMessages.set([]);
  activeVoiceRfqs.set([]);
  electronicRfqs.set([]);
  newsHistory.set([]);
  upcomingRelease.set(null);
  marketImpact.set(0);
  volatilityFactor.set(1);
  twapState.set({ active: false, side: 'buy', totalSize: 0, sizePerInterval: 0, filledSize: 0, startTime: 0 });
  priceHistory.set([]);
}

// Restart game with current settings
export function restartGame() {
  stopGame();
  resetGameState();
  recreateEngines();
  startGame();
}

export function startGame() {
  if (priceIntervalId !== null) {
    return; // Already running
  }

  // Preload sound effects
  preloadSounds();

  // Price tick - fast (100ms)
  priceIntervalId = setInterval(() => {
    const price = marketEngine.tick();
    marketMid.set(price.mid);

    // Update market impact (in pips for display)
    const impactPips = marketEngine.getCurrentImpact() / 0.0001;
    marketImpact.set(impactPips);

    // Update PnL with current market price
    updatePnL(price.mid);
  }, PRICE_TICK_INTERVAL_MS);

  // Spread tick - slower (500ms)
  spreadIntervalId = setInterval(() => {
    const spreads = spreadEngine.tick();
    tierSpreads.set(spreads);
  }, SPREAD_TICK_INTERVAL_MS);

  // Voice RFQ tick
  rfqIntervalId = setInterval(() => {
    const currentMid = get(marketMid);
    const currentVol = get(volatilityFactor);
    const { newMessages, completedRfqs } = voiceRfqEngine.tick(currentMid, currentVol);

    // Update stores
    if (newMessages.length > 0) {
      chatMessages.update(msgs => [...msgs, ...newMessages]);
    }
    activeVoiceRfqs.set(voiceRfqEngine.getActiveRfqs());
  }, RFQ_TICK_INTERVAL_MS);

  // Set up voice RFQ new request callback (plays horn sound)
  voiceRfqEngine.setOnNewRfq(() => {
    playVoiceRfqSound();
  });

  // Set up voice trade execution callback
  voiceRfqEngine.setOnTradeExecuted((rfq: VoiceRfq) => {
    executeVoiceTrade(rfq);
  });

  // Electronic RFQ tick
  electronicRfqIntervalId = setInterval(() => {
    const currentETierPrices = get(eTierPrices);
    electronicRfqEngine.tick(currentETierPrices);
    electronicRfqs.set(electronicRfqEngine.getAllRfqs());

    // Cleanup old RFQs periodically
    electronicRfqEngine.cleanupOldRfqs();
  }, ELECTRONIC_RFQ_TICK_INTERVAL_MS);

  // Set up electronic trade execution callback
  electronicRfqEngine.setOnTrade((rfq: ElectronicRfq, price: number) => {
    executeElectronicTrade(rfq, price);
  });

  // Clock tick - 1 real second = 1 game minute
  gameClockMinutes = 7 * 60; // Reset to 7:00 AM
  updateGameTime();
  clockIntervalId = setInterval(() => {
    gameClockMinutes += 1;
    updateGameTime();
  }, CLOCK_TICK_INTERVAL_MS);

  // News events setup
  newsEventsEngine.setOnMarketImpact((immediatePips, driftPips, driftMinutes) => {
    // Delay the market impact by 3-7 seconds (simulates market reaction time)
    const delayMs = 3000 + Math.random() * 4000;

    setTimeout(() => {
      // Apply immediate shock (convert pips to price)
      const immediateImpact = immediatePips * 0.0001;
      marketEngine.applyImpact(immediateImpact);

      // Apply drift over time (simplified: apply as additional impact spread over intervals)
      if (driftPips !== 0 && driftMinutes > 0) {
        const driftIntervals = Math.ceil(driftMinutes * (1000 / PRICE_TICK_INTERVAL_MS));
        const driftPerTick = (driftPips * 0.0001) / driftIntervals;
        let driftCount = 0;
        const driftInterval = setInterval(() => {
          marketEngine.applyImpact(driftPerTick);
          driftCount++;
          if (driftCount >= driftIntervals) {
            clearInterval(driftInterval);
          }
        }, PRICE_TICK_INTERVAL_MS);
      }
    }, delayMs);
  });

  newsEventsEngine.setOnVolatilityBoost((boost) => {
    // Temporarily increase volatility
    const currentVol = spreadEngine.getVolatilityFactor();
    const boostedVol = Math.min(2.0, currentVol + boost);
    spreadEngine.setVolatilityFactor(boostedVol);
    volatilityFactor.set(boostedVol);

    // Decay back to normal over 30 seconds
    const decayInterval = setInterval(() => {
      const vol = spreadEngine.getVolatilityFactor();
      const newVol = Math.max(1.0, vol - 0.05);
      spreadEngine.setVolatilityFactor(newVol);
      volatilityFactor.set(newVol);
      if (newVol <= 1.0) {
        clearInterval(decayInterval);
      }
    }, 1000);
  });

  newsEventsEngine.setOnNews((item) => {
    newsHistory.update(history => [item, ...history].slice(0, 50)); // Keep last 50 items
    playNewsSound();
  });

  // Initialize news engine with current game time
  newsEventsEngine.reset(gameClockMinutes);
  upcomingRelease.set(newsEventsEngine.getUpcomingRelease());

  // News tick - synced with clock
  newsIntervalId = setInterval(() => {
    newsEventsEngine.tick(gameClockMinutes);
    upcomingRelease.set(newsEventsEngine.getUpcomingRelease());
  }, NEWS_TICK_INTERVAL_MS);

  // Initial tick
  const initialPrice = marketEngine.tick();
  marketMid.set(initialPrice.mid);
  const initialSpreads = spreadEngine.tick();
  tierSpreads.set(initialSpreads);
}

function updateGameTime() {
  const hours = Math.floor(gameClockMinutes / 60) % 24;
  const minutes = gameClockMinutes % 60;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  gameTime.set(date);

  // Update trading session based on current hour
  const session = getSessionForHour(hours);
  currentSession.set(session);
  spreadEngine.setSessionMultiplier(session.spreadMultiplier);
}

export function stopGame() {
  if (priceIntervalId !== null) {
    clearInterval(priceIntervalId);
    priceIntervalId = null;
  }
  if (spreadIntervalId !== null) {
    clearInterval(spreadIntervalId);
    spreadIntervalId = null;
  }
  if (rfqIntervalId !== null) {
    clearInterval(rfqIntervalId);
    rfqIntervalId = null;
  }
  if (electronicRfqIntervalId !== null) {
    clearInterval(electronicRfqIntervalId);
    electronicRfqIntervalId = null;
  }
  if (twapIntervalId !== null) {
    clearInterval(twapIntervalId);
    twapIntervalId = null;
  }
  if (clockIntervalId !== null) {
    clearInterval(clockIntervalId);
    clockIntervalId = null;
  }
  if (newsIntervalId !== null) {
    clearInterval(newsIntervalId);
    newsIntervalId = null;
  }
}

export function isGameRunning(): boolean {
  return priceIntervalId !== null;
}

// Expose market engine for impact adjustments
export function applyMarketImpact(impact: number) {
  marketEngine.applyImpact(impact);
}

// Set volatility factor (affects spread widening)
export function setVolatility(factor: number) {
  spreadEngine.setVolatilityFactor(factor);
  volatilityFactor.set(factor);
}

export function getVolatility(): number {
  return spreadEngine.getVolatilityFactor();
}

// Update PnL stores based on current market price
function updatePnL(currentMid: number) {
  const currentPnL = positionTracker.getPnL(currentMid);
  pnl.set(currentPnL);
}

// Record market impact if enabled
function recordImpactIfEnabled(params: { size: number; side: 'buy' | 'sell'; banksAsked?: number }) {
  if (getSettings().impact.enabled) {
    marketEngine.recordImpact(params);
  }
}

// Execute a hedge trade
export function executeHedgeTrade(side: 'buy' | 'sell', size: number, price: number): Trade {
  const trade = positionTracker.executeTrade({
    side,
    size,
    price,
    clientName: 'Market',
    type: 'hedge',
  });

  // Record market impact (hedge trades have full impact, no banksAsked)
  recordImpactIfEnabled({ size, side });

  // Update stores
  position.set(positionTracker.getPosition());
  trades.update(t => [...t, trade]);

  // Update PnL immediately
  const currentMid = get(marketMid);
  updatePnL(currentMid);

  return trade;
}

// Execute a voice trade (from RFQ)
function executeVoiceTrade(rfq: VoiceRfq): Trade {
  // Voice trade: if client is buying, we are selling (and vice versa)
  const ourSide = rfq.side === 'buy' ? 'sell' : 'buy';

  const trade = positionTracker.executeTrade({
    side: ourSide,
    size: rfq.size,
    price: rfq.playerQuote!,
    clientId: rfq.client.id,
    clientName: rfq.client.name,
    type: 'voice',
  });

  // Record market impact (based on how many banks client asked)
  // Client side determines market impact direction
  recordImpactIfEnabled({
    size: rfq.size,
    side: rfq.side, // Client's side - if client buys, market goes up
    banksAsked: rfq.banksAsked,
  });

  // Update stores
  position.set(positionTracker.getPosition());
  trades.update(t => [...t, trade]);

  // Play trade sound for client trades
  playTradeSound();

  // Update PnL immediately
  const currentMid = get(marketMid);
  updatePnL(currentMid);

  return trade;
}

// Handle player chat input for voice RFQs
export function handlePlayerChatInput(input: string): { success: boolean; message?: string } {
  const currentMid = get(marketMid);
  const parsed = voiceRfqEngine.parsePlayerInput(input, currentMid);

  if (parsed.type === 'invalid') {
    return { success: false, message: 'Invalid input' };
  }

  const activeRfq = voiceRfqEngine.getMostRecentActiveRfq();
  if (!activeRfq) {
    return { success: false, message: 'No active RFQ to respond to' };
  }

  if (parsed.type === 'calloff') {
    const result = voiceRfqEngine.callOff(activeRfq.id);
    if (result.success && result.message) {
      chatMessages.update(msgs => [...msgs, {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sender: 'player',
        text: input,
        rfqId: activeRfq.id,
      }, result.message]);
    }
    activeVoiceRfqs.set(voiceRfqEngine.getActiveRfqs());
    return { success: true };
  }

  if (parsed.type === 'quote' && parsed.price !== undefined) {
    // Check if price is within bounds
    const config = voiceRfqEngine.getConfig();
    const spreadPips = Math.abs(parsed.price - currentMid) / 0.0001;

    if (spreadPips > config.maxSpreadFromMarketPips) {
      return { success: false, message: `Price too far from market (${spreadPips.toFixed(1)} pips)` };
    }

    const result = voiceRfqEngine.submitQuote(activeRfq.id, parsed.price);
    if (result.success && result.message) {
      chatMessages.update(msgs => [...msgs, result.message!]);
    }
    activeVoiceRfqs.set(voiceRfqEngine.getActiveRfqs());
    return { success: true };
  }

  return { success: false, message: 'Unknown error' };
}

// Get the current active RFQ (for UI display)
export function getActiveVoiceRfq() {
  return voiceRfqEngine.getMostRecentActiveRfq();
}

// Execute an electronic trade (from e-pricing RFQ)
function executeElectronicTrade(rfq: ElectronicRfq, price: number): Trade {
  // Electronic trade: if client is buying, we are selling (and vice versa)
  const ourSide = rfq.side === 'buy' ? 'sell' : 'buy';

  const trade = positionTracker.executeTrade({
    side: ourSide,
    size: rfq.size,
    price: price,
    clientId: rfq.client.id,
    clientName: rfq.client.name,
    type: 'electronic',
  });

  // Record market impact (based on how many banks client asked)
  // Client side determines market impact direction
  recordImpactIfEnabled({
    size: rfq.size,
    side: rfq.side, // Client's side - if client buys, market goes up
    banksAsked: rfq.banksAsked,
  });

  // Update stores
  position.set(positionTracker.getPosition());
  trades.update(t => [...t, trade]);

  // Play trade sound for client trades
  playTradeSound();

  // Update PnL immediately
  const currentMid = get(marketMid);
  updatePnL(currentMid);

  return trade;
}

// Reject/pass on an electronic RFQ
export function rejectElectronicRfq(rfqId: string): boolean {
  const result = electronicRfqEngine.rejectRfq(rfqId);
  if (result) {
    electronicRfqs.set(electronicRfqEngine.getAllRfqs());
  }
  return result;
}

// TWAP Algo Trading
function executeTwapSlice() {
  const state = get(twapState);
  if (!state.active) return;

  const remainingSize = state.totalSize - state.filledSize;
  if (remainingSize <= 0) {
    // TWAP complete
    stopTwap();
    return;
  }

  // Execute a slice
  const sliceSize = Math.min(state.sizePerInterval, remainingSize);
  const currentTierPrices = get(tierPrices);

  // Get the price for this slice size
  const tier = sliceSize >= 50 ? '50' : sliceSize >= 10 ? '10' : sliceSize >= 5 ? '5' : '1';
  const price = state.side === 'buy' ? currentTierPrices[tier].ask : currentTierPrices[tier].bid;

  const trade = positionTracker.executeTrade({
    side: state.side,
    size: sliceSize,
    price,
    clientName: 'TWAP Algo',
    type: 'algo',
  });

  // Record market impact
  recordImpactIfEnabled({ size: sliceSize, side: state.side });

  // Update stores
  position.set(positionTracker.getPosition());
  trades.update(t => [...t, trade]);

  // Update TWAP state
  twapState.update(s => ({
    ...s,
    filledSize: s.filledSize + sliceSize,
  }));

  // Check if complete after this slice
  if (state.filledSize + sliceSize >= state.totalSize) {
    stopTwap();
  }

  // Update PnL immediately
  const currentMid = get(marketMid);
  updatePnL(currentMid);
}

export function startTwap(side: 'buy' | 'sell', totalSize: number, sizePerInterval: number) {
  // Stop any existing TWAP
  if (twapIntervalId !== null) {
    clearInterval(twapIntervalId);
  }

  // Initialize TWAP state
  twapState.set({
    active: true,
    side,
    totalSize,
    sizePerInterval,
    filledSize: 0,
    startTime: Date.now(),
  });

  // Execute first slice immediately
  executeTwapSlice();

  // Set up interval for subsequent slices
  twapIntervalId = setInterval(() => {
    executeTwapSlice();
  }, TWAP_TICK_INTERVAL_MS);
}

export function stopTwap() {
  if (twapIntervalId !== null) {
    clearInterval(twapIntervalId);
    twapIntervalId = null;
  }

  twapState.update(s => ({
    ...s,
    active: false,
  }));
}
