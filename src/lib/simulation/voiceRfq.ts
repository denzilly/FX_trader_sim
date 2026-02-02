/**
 * Voice RFQ Engine
 * Manages voice quote requests from clients via salespeople
 */

import type { Client, TradeRequest } from './client';
import { SAMPLE_CLIENTS } from './client';

// Salesperson names for chat messages
const SALESPEOPLE = ['Sarah', 'Mike', 'Emma', 'James', 'Lisa'];

// RFQ request message templates
const BUY_TEMPLATES = [
  '{client} is looking to buy {size}m EURUSD, what\'s your offer?',
  'I need an offer in {size}m for {client}!',
  '{client} wants to buy {size}m EUR, give me an offer?',
  'Can I get an offer in {size}m EURUSD for {client}?',
];

const SELL_TEMPLATES = [
  '{client} is looking to sell {size}m EURUSD, what\'s your bid?',
  'I need a bid in {size}m for {client}!',
  '{client} wants to sell {size}m EUR, give me a bid?',
  'Can I get a bid in {size}m EURUSD for {client}?',
];

// Response templates
// Client BUY = we SELL to them = "MINE!" (sales claimed the trade for us)
const DONE_BUY_TEMPLATES = ['MINE!', 'MINE at {pips}!', 'Done! You sold {size}m at {price}'];
// Client SELL = we BUY from them = "YOURS!" (sales gave the trade to us)
const DONE_SELL_TEMPLATES = ['YOURS!', 'YOURS at {pips}!', 'Done! You bought {size}m at {price}'];
const REJECTED_TEMPLATES = ['Nothing there', 'Traded away', 'Off, thanks', 'No good'];
const EXPIRED_TEMPLATES = ['Too slow, they went elsewhere', 'Lost it, took too long'];
const CALLED_OFF_TEMPLATES = ['Ok, I\'ll tell them you\'re off', 'Noted, calling it off'];

export interface VoiceRfq extends TradeRequest {
  salesperson: string;
  playerQuote: number | null;
  decisionTime: number; // When the client will decide
  calledOff: boolean;
  banksAsked: number; // Number of banks being asked (for market impact)
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  sender: 'sales' | 'player';
  text: string;
  rfqId?: string; // Link to RFQ if relevant
}

export interface VoiceRfqConfig {
  minIntervalSeconds: number;
  maxIntervalSeconds: number;
  playerResponseTimeSeconds: number;
  maxSpreadFromMarketPips: number;
}

const DEFAULT_CONFIG: VoiceRfqConfig = {
  minIntervalSeconds: 15,
  maxIntervalSeconds: 45,
  playerResponseTimeSeconds: 30,
  maxSpreadFromMarketPips: 30,
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTemplate(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

export function createVoiceRfqEngine(config: VoiceRfqConfig = DEFAULT_CONFIG) {
  let activeRfqs: VoiceRfq[] = [];
  let chatMessages: ChatMessage[] = [];
  let nextRfqTime = Date.now() + randomBetween(config.minIntervalSeconds, config.maxIntervalSeconds) * 1000;

  // Callbacks
  let onNewRfq: ((rfq: VoiceRfq, message: ChatMessage) => void) | null = null;
  let onRfqUpdate: ((rfq: VoiceRfq, message: ChatMessage) => void) | null = null;
  let onTradeExecuted: ((rfq: VoiceRfq) => void) | null = null;

  function generateRfq(): VoiceRfq {
    const client = randomChoice(SAMPLE_CLIENTS);
    const side = client.direction === 'both'
      ? (Math.random() > 0.5 ? 'buy' : 'sell')
      : client.direction;
    const size = randomInt(client.sizeMin, client.sizeMax);
    const salesperson = randomChoice(SALESPEOPLE);
    const patience = randomBetween(client.patienceMin, client.patienceMax);
    const banksAsked = randomInt(client.banksAskedMin, client.banksAskedMax);

    const now = Date.now();

    return {
      id: crypto.randomUUID(),
      client,
      side,
      size,
      requestTime: now,
      expiryTime: now + config.playerResponseTimeSeconds * 1000,
      status: 'pending',
      type: 'voice',
      salesperson,
      playerQuote: null,
      decisionTime: now + patience * 1000,
      calledOff: false,
      banksAsked,
    };
  }

  function createRfqMessage(rfq: VoiceRfq): ChatMessage {
    const templates = rfq.side === 'buy' ? BUY_TEMPLATES : SELL_TEMPLATES;
    const template = randomChoice(templates);
    const text = formatTemplate(template, {
      client: rfq.client.name,
      size: rfq.size,
    });

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sender: 'sales',
      text: `[${rfq.salesperson}] ${text}`,
      rfqId: rfq.id,
    };
  }

  function tick(currentMid: number, volatilityFactor: number): { newMessages: ChatMessage[], completedRfqs: VoiceRfq[] } {
    const now = Date.now();
    const newMessages: ChatMessage[] = [];
    const completedRfqs: VoiceRfq[] = [];

    // Check if it's time to generate a new RFQ (max 1 at a time)
    if (now >= nextRfqTime && activeRfqs.length === 0) {
      const rfq = generateRfq();
      const message = createRfqMessage(rfq);

      activeRfqs.push(rfq);
      chatMessages.push(message);
      newMessages.push(message);

      if (onNewRfq) onNewRfq(rfq, message);

      // Schedule next RFQ
      nextRfqTime = now + randomBetween(config.minIntervalSeconds, config.maxIntervalSeconds) * 1000;
    }

    // Process active RFQs
    for (const rfq of activeRfqs) {
      if (rfq.status !== 'pending' && rfq.status !== 'quoted') continue;

      // Check for expiry (player didn't quote in time)
      if (rfq.status === 'pending' && now >= rfq.expiryTime) {
        rfq.status = 'expired';
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          timestamp: now,
          sender: 'sales',
          text: `[${rfq.salesperson}] ${randomChoice(EXPIRED_TEMPLATES)}`,
          rfqId: rfq.id,
        };
        chatMessages.push(message);
        newMessages.push(message);
        completedRfqs.push(rfq);
        continue;
      }

      // Check if called off
      if (rfq.calledOff) {
        rfq.status = 'rejected';
        completedRfqs.push(rfq);
        continue;
      }

      // Check for client decision time (only if quoted)
      if (rfq.status === 'quoted' && rfq.playerQuote !== null && now >= rfq.decisionTime) {
        const accepted = evaluateQuote(rfq, currentMid, volatilityFactor);

        if (accepted) {
          rfq.status = 'done';
          const templates = rfq.side === 'buy' ? DONE_BUY_TEMPLATES : DONE_SELL_TEMPLATES;
          const pips = Math.round(rfq.playerQuote * 10000) % 100;
          const message: ChatMessage = {
            id: crypto.randomUUID(),
            timestamp: now,
            sender: 'sales',
            text: `[${rfq.salesperson}] ${formatTemplate(randomChoice(templates), {
              price: rfq.playerQuote.toFixed(4),
              pips: pips.toString().padStart(2, '0'),
              size: rfq.size,
            })}`,
            rfqId: rfq.id,
          };
          chatMessages.push(message);
          newMessages.push(message);

          if (onTradeExecuted) onTradeExecuted(rfq);
        } else {
          rfq.status = 'rejected';
          const message: ChatMessage = {
            id: crypto.randomUUID(),
            timestamp: now,
            sender: 'sales',
            text: `[${rfq.salesperson}] ${randomChoice(REJECTED_TEMPLATES)}`,
            rfqId: rfq.id,
          };
          chatMessages.push(message);
          newMessages.push(message);
        }

        completedRfqs.push(rfq);
      }
    }

    // Remove completed RFQs
    activeRfqs = activeRfqs.filter(rfq => !completedRfqs.includes(rfq));

    return { newMessages, completedRfqs };
  }

  function evaluateQuote(rfq: VoiceRfq, currentMid: number, volatilityFactor: number): boolean {
    if (rfq.playerQuote === null) return false;

    // Calculate spread offered (in pips)
    const spreadPips = rfq.side === 'buy'
      ? (rfq.playerQuote - currentMid) / 0.0001  // Offer - player is selling to client who buys
      : (currentMid - rfq.playerQuote) / 0.0001; // Bid - player is buying from client who sells

    // Reject if too far from market
    if (spreadPips > config.maxSpreadFromMarketPips) {
      return false;
    }

    // Base acceptance probability from client competitiveness
    // competitiveness 0.9 = willing to accept wider spreads
    // competitiveness 0.4 = very price sensitive
    const baseProb = rfq.client.competitiveness;

    // Adjust for spread (tighter spread = higher acceptance)
    // At 0 spread, full base probability
    // At max spread, reduced probability
    const spreadFactor = 1 - (spreadPips / config.maxSpreadFromMarketPips) * 0.5;

    // Volatility makes clients more willing to pay (they want certainty)
    const volBonus = volatilityFactor * 0.2;

    const finalProb = Math.min(1, baseProb * spreadFactor + volBonus);

    return Math.random() < finalProb;
  }

  function submitQuote(rfqId: string, price: number): { success: boolean; message: ChatMessage | null } {
    const rfq = activeRfqs.find(r => r.id === rfqId);
    if (!rfq || rfq.status !== 'pending' && rfq.status !== 'quoted') {
      return { success: false, message: null };
    }

    rfq.playerQuote = price;
    rfq.status = 'quoted';

    // Keep original decision time - client decides when patience timer expires

    const priceStr = price.toFixed(4);
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sender: 'player',
      text: priceStr,
      rfqId: rfq.id,
    };
    chatMessages.push(message);

    return { success: true, message };
  }

  function callOff(rfqId: string): { success: boolean; message: ChatMessage | null } {
    const rfq = activeRfqs.find(r => r.id === rfqId);
    if (!rfq || rfq.status !== 'pending' && rfq.status !== 'quoted') {
      return { success: false, message: null };
    }

    rfq.calledOff = true;

    const salesMessage: ChatMessage = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sender: 'sales',
      text: `[${rfq.salesperson}] ${randomChoice(CALLED_OFF_TEMPLATES)}`,
      rfqId: rfq.id,
    };
    chatMessages.push(salesMessage);

    return { success: true, message: salesMessage };
  }

  function parsePlayerInput(input: string, currentMid: number): { type: 'quote' | 'calloff' | 'invalid'; price?: number } {
    const trimmed = input.trim().toLowerCase();

    // Check for call-off commands
    if (trimmed === 'care' || trimmed === 'ref' || /^e+$/.test(trimmed)) {
      return { type: 'calloff' };
    }

    // Try to parse as full price (e.g., "1.0850")
    const fullPriceMatch = trimmed.match(/^(\d+\.\d{4})$/);
    if (fullPriceMatch) {
      return { type: 'quote', price: parseFloat(fullPriceMatch[1]) };
    }

    // Accept just pips (1-2 digits) - updates only the pip portion based on current market
    // e.g., if mid is 1.0845 and player types "52", result is 1.0852
    // e.g., if mid is 1.0845 and player types "5", result is 1.0855
    const pipsOnlyMatch = trimmed.match(/^(\d{1,2})$/);
    if (pipsOnlyMatch) {
      const bigFigure = Math.floor(currentMid * 100) / 100; // e.g., 1.08
      const pipsInput = pipsOnlyMatch[1].padStart(2, '0');
      const price = bigFigure + parseInt(pipsInput) / 10000;
      return { type: 'quote', price };
    }

    // Accept 3-4 digits as full pip specification (e.g., "0852" or "852" for 1.0852)
    const fullPipsMatch = trimmed.match(/^(\d{3,4})$/);
    if (fullPipsMatch) {
      const pips = fullPipsMatch[1].padStart(4, '0');
      const price = 1 + parseInt(pips.slice(0, 2)) / 100 + parseInt(pips.slice(2)) / 10000;
      return { type: 'quote', price };
    }

    return { type: 'invalid' };
  }

  return {
    tick,
    submitQuote,
    callOff,
    parsePlayerInput,
    getActiveRfqs: () => [...activeRfqs],
    getChatMessages: () => [...chatMessages],
    getMostRecentActiveRfq: () => activeRfqs.find(r => r.status === 'pending' || r.status === 'quoted') || null,
    setOnNewRfq: (cb: typeof onNewRfq) => { onNewRfq = cb; },
    setOnRfqUpdate: (cb: typeof onRfqUpdate) => { onRfqUpdate = cb; },
    setOnTradeExecuted: (cb: typeof onTradeExecuted) => { onTradeExecuted = cb; },
    getConfig: () => ({ ...config }),
    updateConfig: (newConfig: Partial<VoiceRfqConfig>) => {
      Object.assign(config, newConfig);
    },
  };
}
