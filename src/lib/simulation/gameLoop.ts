/**
 * Game Loop
 * Manages the market tick interval and coordinates updates to stores
 */

import { createMarketEngine } from './market';
import { createSpreadEngine } from './spread';
import { createPositionTracker, type Trade } from './position';
import { createVoiceRfqEngine, type VoiceRfq } from './voiceRfq';
import { createElectronicRfqEngine, type ElectronicRfq } from './electronicRfq';
import { marketMid, tierSpreads, tierPrices, volatilityFactor, position, pnl, trades, chatMessages, activeVoiceRfqs, electronicRfqs, eTierPrices, marketImpact, twapState, gameTime } from '../stores/game';
import { get } from 'svelte/store';

const PRICE_TICK_INTERVAL_MS = 100;
const SPREAD_TICK_INTERVAL_MS = 500; // Spreads update slower than price
const RFQ_TICK_INTERVAL_MS = 500; // Voice RFQ engine tick
const ELECTRONIC_RFQ_TICK_INTERVAL_MS = 200; // Electronic RFQ tick (faster for live prices)
const TWAP_TICK_INTERVAL_MS = 10000; // TWAP executes every 10 seconds
const CLOCK_TICK_INTERVAL_MS = 1000; // Clock ticks every 1 second (= 1 game minute)

let priceIntervalId: ReturnType<typeof setInterval> | null = null;
let spreadIntervalId: ReturnType<typeof setInterval> | null = null;
let rfqIntervalId: ReturnType<typeof setInterval> | null = null;
let electronicRfqIntervalId: ReturnType<typeof setInterval> | null = null;
let twapIntervalId: ReturnType<typeof setInterval> | null = null;
let clockIntervalId: ReturnType<typeof setInterval> | null = null;

// Game clock state - starts at 7:00 AM
let gameClockMinutes = 7 * 60; // 7:00 AM in minutes from midnight

const marketEngine = createMarketEngine();
const spreadEngine = createSpreadEngine();
const positionTracker = createPositionTracker();
const voiceRfqEngine = createVoiceRfqEngine();
const electronicRfqEngine = createElectronicRfqEngine();

export function startGame() {
  if (priceIntervalId !== null) {
    return; // Already running
  }

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
  marketEngine.recordImpact({
    size,
    side,
    // banksAsked undefined = full impact (we're hitting the market)
  });

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
  marketEngine.recordImpact({
    size: rfq.size,
    side: rfq.side, // Client's side - if client buys, market goes up
    banksAsked: rfq.banksAsked,
  });

  // Update stores
  position.set(positionTracker.getPosition());
  trades.update(t => [...t, trade]);

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
  marketEngine.recordImpact({
    size: rfq.size,
    side: rfq.side, // Client's side - if client buys, market goes up
    banksAsked: rfq.banksAsked,
  });

  // Update stores
  position.set(positionTracker.getPosition());
  trades.update(t => [...t, trade]);

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
  marketEngine.recordImpact({
    size: sliceSize,
    side: state.side,
  });

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
