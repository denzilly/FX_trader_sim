/**
 * Market Price Engine
 * Simulates EUR/USD price movement with random walk + drift
 * Influenced by: trading impact, client quotes, news events
 */

export interface MarketPrice {
  mid: number;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
}

export interface MarketConfig {
  initialMid: number;
  volatility: number;
  drift: number;
  baseSpread: number;
}

const DEFAULT_CONFIG: MarketConfig = {
  initialMid: 1.0850,
  volatility: 0.00005,  // Max ±1.5 pips per tick for more visible movement
  drift: .0000,
  baseSpread: 0.00008, // 0.8 pips market spread (1 pip = 0.0001)
};

export function createMarketEngine(config: MarketConfig = DEFAULT_CONFIG) {
  let currentMid = config.initialMid;
  let currentSpread = config.baseSpread;

  function tick(): MarketPrice {
    // Random walk with drift
    const randomMove = (Math.random() - 0.5) * 2 * config.volatility;
    currentMid += randomMove + config.drift;

    const halfSpread = currentSpread / 2;

    return {
      mid: currentMid,
      bid: currentMid - halfSpread,
      ask: currentMid + halfSpread,
      spread: currentSpread,
      timestamp: Date.now(),
    };
  }

  function applyImpact(impact: number) {
    currentMid += impact;
  }

  function setSpread(spread: number) {
    currentSpread = spread;
  }

  return {
    tick,
    applyImpact,
    setSpread,
    getCurrentMid: () => currentMid,
    getCurrentSpread: () => currentSpread,
  };
}
