/**
 * Spread Engine
 * Manages dynamic spread fluctuation with tier-based pricing
 */

export interface TierSpreads {
  '1': number;
  '5': number;
  '10': number;
  '50': number;
}

export interface SpreadConfig {
  baseSpreadMin: number;     // Minimum 1M spread in price terms (e.g., 0 pips = 0)
  baseSpreadMax: number;     // Maximum 1M spread in price terms (e.g., 1 pip = 0.0001)
  baseSpreadMean: number;    // Mean reversion target
  spreadVolatility: number;  // How much spread fluctuates per tick
  meanReversionSpeed: number; // How fast spread reverts to mean (0-1)
  tierAdditions: {           // Additional spread per tier (in price terms)
    '1': number;
    '5': number;
    '10': number;
    '50': number;
  };
  tierMinimums: {            // Minimum spread per tier (in price terms)
    '1': number;
    '5': number;
    '10': number;
    '50': number;
  };
}

const DEFAULT_CONFIG: SpreadConfig = {
  baseSpreadMin: 0,                    // 0 pips
  baseSpreadMax: 0.0001,               // 1 pip
  baseSpreadMean: 0.00005,             // 0.5 pips
  spreadVolatility: 0.00001,           // 0.1 pip fluctuation per tick
  meanReversionSpeed: 0.05,            // Slow mean reversion
  tierAdditions: {
    '1': 0,
    '5': 0.00003,                      // +0.3 pips
    '10': 0.00006,                     // +0.6 pips
    '50': 0.00012,                     // +1.2 pips
  },
  tierMinimums: {
    '1': 0,                            // 0 pips minimum
    '5': 0.00005,                      // 0.5 pips minimum
    '10': 0.0001,                      // 1.0 pips minimum
    '50': 0.00015,                     // 1.5 pips minimum
  },
};

export function createSpreadEngine(config: SpreadConfig = DEFAULT_CONFIG) {
  let baseSpread = config.baseSpreadMean;
  let volatilityFactor = 0; // 0 = calm, increases with news/events

  function tick(): TierSpreads {
    // Random walk with mean reversion for base spread
    const randomMove = (Math.random() - 0.5) * 2 * config.spreadVolatility;
    const meanReversion = (config.baseSpreadMean - baseSpread) * config.meanReversionSpeed;

    baseSpread += randomMove + meanReversion;

    // Clamp to bounds (adjusted by volatility factor)
    const maxSpread = config.baseSpreadMax * (1 + volatilityFactor);
    baseSpread = Math.max(config.baseSpreadMin, Math.min(maxSpread, baseSpread));

    // Calculate tier spreads
    const volMultiplier = 1 + volatilityFactor;

    return {
      '1': Math.max(
        config.tierMinimums['1'] * volMultiplier,
        baseSpread * volMultiplier
      ),
      '5': Math.max(
        config.tierMinimums['5'] * volMultiplier,
        (baseSpread + config.tierAdditions['5']) * volMultiplier
      ),
      '10': Math.max(
        config.tierMinimums['10'] * volMultiplier,
        (baseSpread + config.tierAdditions['10']) * volMultiplier
      ),
      '50': Math.max(
        config.tierMinimums['50'] * volMultiplier,
        (baseSpread + config.tierAdditions['50']) * volMultiplier
      ),
    };
  }

  function setVolatilityFactor(factor: number) {
    volatilityFactor = Math.max(0, factor);
  }

  function getVolatilityFactor(): number {
    return volatilityFactor;
  }

  function getBaseSpread(): number {
    return baseSpread;
  }

  return {
    tick,
    setVolatilityFactor,
    getVolatilityFactor,
    getBaseSpread,
  };
}
