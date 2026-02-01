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

export interface ImpactConfig {
  halfLifeMs: number;           // Time for impact to decay by half (ms)
  maxImpactPips: number;        // Maximum impact in pips
  sizeScaleFactor: number;      // How size affects impact (sqrt scaling)
  burstWindowMs: number;        // Window for detecting burst trading
  burstMultiplierMax: number;   // Maximum burst multiplier
}

export interface TradeImpact {
  timestamp: number;
  size: number;
  direction: 1 | -1;            // 1 = buy pressure (price up), -1 = sell pressure (price down)
  banksFactor: number;          // 0-1, how many banks were asked (0 = no impact, 1 = full impact)
}

const DEFAULT_CONFIG: MarketConfig = {
  initialMid: 1.0850,
  volatility: 0.00005,  // Max ±1.5 pips per tick for more visible movement
  drift: 0.0000,
  baseSpread: 0.00008, // 0.8 pips market spread (1 pip = 0.0001)
};

const DEFAULT_IMPACT_CONFIG: ImpactConfig = {
  halfLifeMs: 1000,            // 10 seconds half-life
  maxImpactPips: 3,             // Max 5 pips of impact
  sizeScaleFactor: 0.000005,        // sqrt(size) * this = base pips impact
  burstWindowMs: 5000,          // 5 second window for burst detection
  burstMultiplierMax: 3,        // Up to 3x multiplier for machine-gunning
};

export function createMarketEngine(
  config: MarketConfig = DEFAULT_CONFIG,
  impactConfig: ImpactConfig = DEFAULT_IMPACT_CONFIG
) {
  let currentMid = config.initialMid;
  let currentSpread = config.baseSpread;
  let impactHistory: TradeImpact[] = [];

  // Calculate the current impact drift based on recent trade history
  function calculateImpactDrift(): number {
    const now = Date.now();

    // Remove old impacts (older than 5 half-lives, effectively zero)
    const cutoff = now - impactConfig.halfLifeMs * 5;
    impactHistory = impactHistory.filter(i => i.timestamp > cutoff);

    if (impactHistory.length === 0) return 0;

    // Calculate time-weighted impact sum
    let totalImpact = 0;

    for (const impact of impactHistory) {
      const age = now - impact.timestamp;
      // Exponential decay: impact * 0.5^(age/halfLife)
      const decayFactor = Math.pow(0.5, age / impactConfig.halfLifeMs);

      // Base impact from size (sqrt scaling for diminishing returns)
      const sizeImpact = Math.sqrt(impact.size) * impactConfig.sizeScaleFactor;

      // Apply banks factor (0 = no impact from this trade)
      const adjustedImpact = sizeImpact * impact.banksFactor;

      // Apply decay and direction
      totalImpact += adjustedImpact * decayFactor * impact.direction;
    }

    // Calculate burst multiplier based on trade count in burst window
    const burstCutoff = now - impactConfig.burstWindowMs;
    const recentTrades = impactHistory.filter(i => i.timestamp > burstCutoff);
    const burstMultiplier = Math.min(
      impactConfig.burstMultiplierMax,
      1 + Math.log(Math.max(1, recentTrades.length)) * 0.5
    );

    // Apply burst multiplier
    totalImpact *= burstMultiplier;

    // Cap at max impact
    const maxImpact = impactConfig.maxImpactPips * 0.0001;
    totalImpact = Math.max(-maxImpact, Math.min(maxImpact, totalImpact));

    // Convert to per-tick drift (spread over multiple ticks for smooth movement)
    // Assuming ~100ms ticks, apply fraction of remaining impact
    return totalImpact * 0.1;
  }

  function tick(): MarketPrice {
    // Calculate impact-adjusted drift
    const impactDrift = calculateImpactDrift();

    // Random walk with drift + impact
    const randomMove = (Math.random() - 0.5) * 2 * config.volatility;
    currentMid += randomMove + config.drift + impactDrift;

    const halfSpread = currentSpread / 2;

    return {
      mid: currentMid,
      bid: currentMid - halfSpread,
      ask: currentMid + halfSpread,
      spread: currentSpread,
      timestamp: Date.now(),
    };
  }

  // Record a trade impact
  function recordImpact(params: {
    size: number;
    side: 'buy' | 'sell';
    banksAsked?: number;      // Number of banks asked (1-10), undefined for hedge trades
    maxBanks?: number;        // Maximum banks possible (default 10)
  }) {
    const { size, side, banksAsked, maxBanks = 10 } = params;

    // For hedge trades (no banksAsked), full impact
    // For client trades, scale by how many banks were asked
    let banksFactor: number;
    if (banksAsked === undefined) {
      // Hedge trade - full market impact
      banksFactor = 1;
    } else if (banksAsked <= 1) {
      // Only asking us - no market impact from this trade
      banksFactor = 0;
    } else {
      // Scale: (banksAsked - 1) / (maxBanks - 1)
      // banksAsked=2 gives small impact, banksAsked=10 gives full impact
      banksFactor = (banksAsked - 1) / (maxBanks - 1);
    }

    // Direction: buy = positive (price goes up), sell = negative (price goes down)
    const direction: 1 | -1 = side === 'buy' ? 1 : -1;

    impactHistory.push({
      timestamp: Date.now(),
      size,
      direction,
      banksFactor,
    });
  }

  function applyImpact(impact: number) {
    currentMid += impact;
  }

  function setSpread(spread: number) {
    currentSpread = spread;
  }

  // Get current impact pressure (for debugging/display)
  function getCurrentImpact(): number {
    return calculateImpactDrift() / 0.1; // Undo the per-tick scaling
  }

  return {
    tick,
    applyImpact,
    setSpread,
    recordImpact,
    getCurrentMid: () => currentMid,
    getCurrentSpread: () => currentSpread,
    getCurrentImpact,
    getImpactHistory: () => [...impactHistory],
  };
}
