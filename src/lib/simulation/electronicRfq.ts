/**
 * Electronic RFQ Engine
 * Manages electronic quote requests that use the e-pricing stream
 */

import type { Client } from './client';
import { SAMPLE_CLIENTS } from './client';

export interface ElectronicRfq {
  id: string;
  client: Client;
  side: 'buy' | 'sell';
  size: number;
  requestTime: number;
  expiryTime: number;
  status: 'quoting' | 'traded' | 'rejected' | 'expired' | 'passed';
  tradedPrice?: number;
  tradedTime?: number;
  banksAsked: number; // Number of banks being asked (for market impact)
}

export interface ElectronicRfqConfig {
  minIntervalSeconds: number;
  maxIntervalSeconds: number;
  maxActiveRfqs: number;
}

const DEFAULT_CONFIG: ElectronicRfqConfig = {
  minIntervalSeconds: 8,
  maxIntervalSeconds: 20,
  maxActiveRfqs: 5,
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

export function createElectronicRfqEngine(config: ElectronicRfqConfig = DEFAULT_CONFIG) {
  let activeRfqs: ElectronicRfq[] = [];
  let completedRfqs: ElectronicRfq[] = [];
  let nextRfqTime = Date.now() + randomBetween(config.minIntervalSeconds, config.maxIntervalSeconds) * 1000;

  // Callbacks
  let onTrade: ((rfq: ElectronicRfq, price: number) => void) | null = null;

  function generateRfq(): ElectronicRfq {
    const client = randomChoice(SAMPLE_CLIENTS);
    const side = client.direction === 'both'
      ? (Math.random() > 0.5 ? 'buy' : 'sell')
      : client.direction;
    const size = randomInt(client.sizeMin, client.sizeMax);
    const patience = randomBetween(client.patienceMin, client.patienceMax);
    const banksAsked = randomInt(client.banksAskedMin, client.banksAskedMax);

    const now = Date.now();

    return {
      id: crypto.randomUUID(),
      client,
      side,
      size,
      requestTime: now,
      expiryTime: now + patience * 1000,
      status: 'quoting',
      banksAsked,
    };
  }

  // Get the tier key for a given size
  function getTierForSize(size: number): '1' | '5' | '10' | '50' {
    if (size >= 50) return '50';
    if (size >= 10) return '10';
    if (size >= 5) return '5';
    return '1';
  }

  function tick(eTierPrices: Record<'1' | '5' | '10' | '50', { bid: number; ask: number }>): {
    newRfqs: ElectronicRfq[];
    tradedRfqs: ElectronicRfq[];
    expiredRfqs: ElectronicRfq[];
  } {
    const now = Date.now();
    const newRfqs: ElectronicRfq[] = [];
    const tradedRfqs: ElectronicRfq[] = [];
    const expiredRfqs: ElectronicRfq[] = [];

    // Check if it's time to generate a new RFQ
    const quotingCount = activeRfqs.filter(r => r.status === 'quoting').length;
    if (now >= nextRfqTime && quotingCount < config.maxActiveRfqs) {
      const rfq = generateRfq();
      activeRfqs.push(rfq);
      newRfqs.push(rfq);

      // Schedule next RFQ
      nextRfqTime = now + randomBetween(config.minIntervalSeconds, config.maxIntervalSeconds) * 1000;
    }

    // Process active RFQs
    for (const rfq of activeRfqs) {
      if (rfq.status !== 'quoting') continue;

      // Get the appropriate tier prices for this RFQ's size
      const tier = getTierForSize(rfq.size);
      const tierPrices = eTierPrices[tier];

      // Check for expiry
      if (now >= rfq.expiryTime) {
        // Evaluate if client trades before expiring
        const price = rfq.side === 'buy' ? tierPrices.ask : tierPrices.bid;
        const traded = evaluateTrade(rfq, price);

        if (traded) {
          rfq.status = 'traded';
          rfq.tradedPrice = price;
          rfq.tradedTime = now;
          tradedRfqs.push(rfq);
          if (onTrade) onTrade(rfq, price);
        } else {
          rfq.status = 'expired';
          expiredRfqs.push(rfq);
        }
      }
    }

    return { newRfqs, tradedRfqs, expiredRfqs };
  }

  function evaluateTrade(rfq: ElectronicRfq, price: number): boolean {
    // Use client competitiveness to determine if they trade
    // Higher competitiveness = more likely to trade
    // Also factor in how long they've been waiting (closer to expiry = more likely)

    const now = Date.now();
    const totalTime = rfq.expiryTime - rfq.requestTime;
    const elapsed = now - rfq.requestTime;
    const timeRatio = elapsed / totalTime; // 0 to 1

    // Base probability from competitiveness
    const baseProb = rfq.client.competitiveness;

    // Increase probability as time goes on (urgency)
    const urgencyBonus = timeRatio * 0.2;

    const finalProb = Math.min(1, baseProb + urgencyBonus);

    return Math.random() < finalProb;
  }

  function rejectRfq(rfqId: string): boolean {
    const rfq = activeRfqs.find(r => r.id === rfqId);
    if (!rfq || rfq.status !== 'quoting') {
      return false;
    }

    rfq.status = 'passed';
    return true;
  }

  function getActiveRfqs(): ElectronicRfq[] {
    return activeRfqs.filter(r => r.status === 'quoting' || r.status === 'traded');
  }

  function getAllRfqs(): ElectronicRfq[] {
    return [...activeRfqs];
  }

  function cleanupOldRfqs() {
    // Remove RFQs that have been completed for more than 60 seconds
    // Keep all statuses visible for a while so user can see what happened
    const cutoff = Date.now() - 60000;
    activeRfqs = activeRfqs.filter(r => {
      if (r.status === 'quoting') return true;
      // Keep completed RFQs (traded, passed, expired) for 60 seconds
      if (r.tradedTime && r.tradedTime > cutoff) return true;
      if (r.expiryTime > cutoff) return true;
      return false;
    });
  }

  return {
    tick,
    rejectRfq,
    getActiveRfqs,
    getAllRfqs,
    cleanupOldRfqs,
    setOnTrade: (cb: typeof onTrade) => { onTrade = cb; },
    getConfig: () => ({ ...config }),
    updateConfig: (newConfig: Partial<ElectronicRfqConfig>) => {
      Object.assign(config, newConfig);
    },
  };
}
